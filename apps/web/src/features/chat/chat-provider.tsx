'use client';
'use no memo';

import { skipToken, useQuery, useQueryClient } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import type { Club } from '@book-club/contracts';
import { createChatSocket, type ChatSocket, type ChatSocketStatus, type PresenceStatus } from '@book-club/api-client';
import { useSession } from '@/features/clubs/use-session';
import { api } from '@/lib/api';
import { SHELL_CHAT_WIDGET } from '@/strangler/flags';
import { useEnabledRoutes } from '@/strangler/context';
import { createChatAudioAlert, type ChatAudioAlert } from './chat-audio-alert';
import { isTemp, mergeIncoming, mergeLatest, messagesKey, unreadKey, type ChatRoomView, type MessagesPage, type UnreadState } from './chat-model';
import { WS_BASE_URL, fetchWsTicket } from './chat-ticket';
import { useChatRooms, useUnreadCounts } from './use-chat-data';

/** A tab asleep for longer than this is assumed to hold a dead socket the browser never reported. */
export const RESUME_RECONNECT_MS = 30_000;

interface ChatContextValue {
  /** The widget flag is on or the viewer is on /chats: otherwise nothing is fetched or connected. */
  active: boolean;
  isChatsPage: boolean;
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
  rooms: readonly ChatRoomView[];
  clubs: readonly Club[];
  roomsPending: boolean;
  roomsError: boolean;
  retryRooms: () => void;
  activeRoomId: string | null;
  selectRoom: (roomId: string) => void;
  unread: Readonly<Record<string, UnreadState>>;
  totalUnread: number;
  presence: ReadonlyMap<string, PresenceStatus>;
  hasNewMessage: boolean;
  connection: ChatSocketStatus;
  /** Zeroes the room's badge and moves its read marker to the newest confirmed message. */
  markRoomRead: (roomId: string) => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function useChat(): ChatContextValue {
  const value = useContext(ChatContext);
  if (!value) throw new Error('useChat must be used inside ChatProvider');
  return value;
}

const lastConfirmedId = (page: MessagesPage | undefined): string | null => {
  const last = page?.items[page.items.length - 1];
  return last && !isTemp(last) ? last.id : null;
};

export function ChatProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const { user } = useSession();
  const widgetEnabled = useEnabledRoutes().includes(SHELL_CHAT_WIDGET);
  const isChatsPage = pathname.startsWith('/chats');
  const userId = user?.id ?? null;
  const active = userId !== null && (widgetEnabled || isChatsPage);

  const { rooms, clubs, isPending: roomsPending, isError: roomsError, refetch: retryRooms } = useChatRooms(active);
  const { byRoom, total } = useUnreadCounts(rooms.map((r) => r.id), active);

  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [presence, setPresence] = useState<ReadonlyMap<string, PresenceStatus>>(new Map());
  const [connection, setConnection] = useState<ChatSocketStatus>('idle');
  const [pageVisible, setPageVisible] = useState(true);

  const activeRoomId = rooms.some((r) => r.id === picked) ? picked : (rooms[0]?.id ?? null);
  if (isChatsPage && open) setOpen(false);
  const isOpen = open && !isChatsPage;
  const chatVisible = isOpen || isChatsPage;

  const live = useRef({ userId, watching: false });
  const socketRef = useRef<ChatSocket | null>(null);
  const audioRef = useRef<ChatAudioAlert | null>(null);
  const postedRead = useRef(new Map<string, string>());

  useEffect(() => {
    live.current = { userId, watching: chatVisible && pageVisible };
  });

  const activePage = useQuery<MessagesPage>({ queryKey: messagesKey(activeRoomId ?? ''), queryFn: skipToken }).data;
  const newestId = lastConfirmedId(activePage);

  function postRead(roomId: string, messageId: string) {
    if (postedRead.current.get(roomId) === messageId) return;
    postedRead.current.set(roomId, messageId);
    api.chat.markRead(roomId, messageId, { suppressErrorToast: true }).catch(() => postedRead.current.delete(roomId));
  }

  function markRoomRead(roomId: string) {
    const newest = lastConfirmedId(queryClient.getQueryData<MessagesPage>(messagesKey(roomId)));
    queryClient.setQueryData<UnreadState>(unreadKey(roomId), (u) => ({ count: 0, lastReadId: newest ?? u?.lastReadId ?? null }));
    if (newest) postRead(roomId, newest);
  }

  // The room on screen is read as it arrives; the divider keeps pointing at the old marker until the viewer leaves or sends.
  useEffect(() => {
    if (!active || !activeRoomId || !chatVisible || !pageVisible) return;
    queryClient.setQueryData<UnreadState>(unreadKey(activeRoomId), (u) => ({ count: 0, lastReadId: u?.lastReadId ?? null }));
    if (newestId) postRead(activeRoomId, newestId);
  }, [active, activeRoomId, chatVisible, pageVisible, newestId, queryClient]);

  useEffect(() => {
    if (!active) return;
    const alert = createChatAudioAlert();
    audioRef.current = alert;
    return () => {
      alert.dispose();
      audioRef.current = null;
    };
  }, [active]);

  useEffect(() => {
    if (!active || !activeRoomId) return;
    const roomId = activeRoomId;
    const key = messagesKey(roomId);
    let hasOpened = false;

    const fillGap = () => {
      api.chat
        .messages(roomId, {}, { suppressErrorToast: true })
        .then((fresh) => queryClient.setQueryData<MessagesPage>(key, (page) => page && { ...page, items: mergeLatest(page.items, fresh) }))
        .catch(() => undefined);
    };

    const socket = createChatSocket({
      baseUrl: WS_BASE_URL,
      roomId,
      getTicket: fetchWsTicket,
      onStatus: (status) => {
        setConnection(status);
        if (status !== 'open') return;
        if (hasOpened) fillGap();
        hasOpened = true;
      },
      onPresence: (id, status) => setPresence((prev) => new Map(prev).set(id, status)),
      onPresenceSnapshot: (entries) => setPresence(new Map(entries.map((e) => [e.userId, e.status] as const))),
      onMessage: (message) => {
        let added = false;
        queryClient.setQueryData<MessagesPage>(key, (page) => {
          if (!page) return page;
          const merged = mergeIncoming(page.items, message);
          added = merged.added;
          return { ...page, items: merged.items };
        });
        const { userId: me, watching } = live.current;
        if (!added || message.senderId === me || watching) return;
        queryClient.setQueryData<UnreadState>(unreadKey(roomId), (u) => ({ count: (u?.count ?? 0) + 1, lastReadId: u?.lastReadId ?? null }));
        setHasNewMessage(true);
        audioRef.current?.playBeep();
      },
    });
    socketRef.current = socket;

    return () => {
      socket.close();
      if (socketRef.current === socket) socketRef.current = null;
      setPresence(new Map());
      setConnection('idle');
    };
  }, [active, activeRoomId, queryClient]);

  useEffect(() => {
    if (!active) return;
    let hiddenAt: number | null = null;
    const reconnect = () => socketRef.current?.reconnect();
    const onVisibility = () => {
      if (document.hidden) {
        hiddenAt = Date.now();
        setPageVisible(false);
        return;
      }
      setPageVisible(true);
      const slept = hiddenAt !== null && Date.now() - hiddenAt > RESUME_RECONNECT_MS;
      hiddenAt = null;
      if (slept || (socketRef.current && socketRef.current.status !== 'open')) reconnect();
    };
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) reconnect();
    };
    window.addEventListener('online', reconnect);
    window.addEventListener('pageshow', onPageShow);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('online', reconnect);
      window.removeEventListener('pageshow', onPageShow);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [active]);

  const value: ChatContextValue = {
    active,
    isChatsPage,
    isOpen,
    toggle: () => {
      setOpen(!isOpen);
      if (!isOpen) setHasNewMessage(false);
    },
    close: () => setOpen(false),
    rooms,
    clubs,
    roomsPending,
    roomsError,
    retryRooms,
    activeRoomId,
    selectRoom: (roomId) => {
      if (activeRoomId && activeRoomId !== roomId) markRoomRead(activeRoomId);
      setPicked(roomId);
      setHasNewMessage(false);
    },
    unread: byRoom,
    totalUnread: total,
    presence,
    hasNewMessage,
    connection,
    markRoomRead,
  };
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}
