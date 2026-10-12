'use client';
'use no memo';

import { useQueryClient } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';
import { createContext, lazy, Suspense, useCallback, useContext, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import type { Club } from '@book-club/contracts';
import type { ChatSocket, ChatSocketStatus, PresenceStatus } from '@book-club/api-client/ws';
import { myClubsKey } from '@/features/clubs/use-clubs';
import { useSession } from '@/features/clubs/use-session';
import { api } from '@/lib/api';
import { SHELL_CHAT_WIDGET } from '@/strangler/flags';
import { useEnabledRoutes } from '@/strangler/context';
import { lastConfirmedId, messagesKey, unreadKey } from './chat-keys';

export { RESUME_RECONNECT_MS } from './chat-keys';
import type { ChatRoomView, MessagesPage, UnreadState } from './chat-model';
import type { RoomsSnapshot } from './chat-runtime';

// sockets, queries and audio load only for a viewer who actually gets the chat: everyone else keeps this file's few KB
const ChatRuntime = lazy(() => import('./chat-runtime').then((m) => ({ default: m.ChatRuntime })));

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
  /** Starts over with a fresh ticket; for the "gave up" notice. */
  reconnect: () => void;
  /** Zeroes the room's badge and moves its read marker to the newest confirmed message. */
  markRoomRead: (roomId: string) => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function useChat(): ChatContextValue {
  const value = useContext(ChatContext);
  if (!value) throw new Error('useChat must be used inside ChatProvider');
  return value;
}

const EMPTY: RoomsSnapshot = { rooms: [], clubs: [], pending: true, error: false, retry: () => undefined, unread: {}, total: 0 };

export function ChatProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const { user } = useSession();
  const widgetEnabled = useEnabledRoutes().includes(SHELL_CHAT_WIDGET);
  const isChatsPage = pathname.startsWith('/chats');
  const userId = user?.id ?? null;
  const active = userId !== null && (widgetEnabled || isChatsPage);

  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [presence, setPresence] = useState<ReadonlyMap<string, PresenceStatus>>(new Map());
  const [connection, setConnection] = useState<ChatSocketStatus>('idle');
  const [pageVisible, setPageVisible] = useState(true);
  const [snapshot, setSnapshot] = useState<RoomsSnapshot>(EMPTY);

  // a different viewer in the same tab (sign-in after expiry): nothing of the previous one's chat state may carry over
  const [seenUser, setSeenUser] = useState(userId);
  if (seenUser !== userId) {
    setSeenUser(userId);
    setOpen(false);
    setPicked(null);
    setHasNewMessage(false);
    setPresence(new Map());
    setConnection('idle');
    setSnapshot(EMPTY);
  }

  const { rooms } = snapshot;
  const activeRoomId = rooms.some((r) => r.id === picked) ? picked : (rooms[0]?.id ?? null);
  if (isChatsPage && open) setOpen(false);
  const isOpen = open && !isChatsPage;
  const chatVisible = isOpen || isChatsPage;

  const live = useRef({ userId, watching: false });
  const socketRef = useRef<ChatSocket | null>(null);
  const postedRead = useRef(new Map<string, string>());

  const previousUser = useRef(userId);
  useLayoutEffect(() => {
    live.current = { userId, watching: chatVisible && pageVisible };
    if (previousUser.current === userId) return;
    const previous = previousUser.current ?? '';
    previousUser.current = userId;
    // the previous viewer's chat entries go; the club list is viewer-specific too and is re-read for the new one
    queryClient.removeQueries({ queryKey: ['chat', previous] });
    void queryClient.resetQueries({ queryKey: myClubsKey });
    postedRead.current.clear();
  });

  const postRead = useCallback((roomId: string, messageId: string) => {
    if (postedRead.current.get(roomId) === messageId) return;
    postedRead.current.set(roomId, messageId);
    api.chat.markRead(roomId, messageId, { skipAuthRedirect: true, suppressErrorToast: true }).catch(() => postedRead.current.delete(roomId));
  }, []);

  function markRoomRead(roomId: string) {
    if (!userId) return;
    const newest = lastConfirmedId(queryClient.getQueryData<MessagesPage>(messagesKey(userId, roomId)));
    queryClient.setQueryData<UnreadState>(unreadKey(userId, roomId), (u) => ({ count: 0, lastReadId: newest ?? u?.lastReadId ?? null }));
    if (newest) postRead(roomId, newest);
  }

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
    clubs: snapshot.clubs,
    roomsPending: active && snapshot.pending,
    roomsError: snapshot.error,
    retryRooms: snapshot.retry,
    activeRoomId,
    selectRoom: (roomId) => {
      if (activeRoomId && activeRoomId !== roomId) markRoomRead(activeRoomId);
      setPicked(roomId);
      setHasNewMessage(false);
    },
    unread: snapshot.unread,
    totalUnread: snapshot.total,
    presence,
    hasNewMessage,
    connection,
    reconnect: () => socketRef.current?.reconnect(),
    markRoomRead,
  };
  return (
    <ChatContext.Provider value={value}>
      {children}
      {active && userId && (
        <Suspense fallback={null}>
          <ChatRuntime
            userId={userId}
            activeRoomId={activeRoomId}
            chatVisible={chatVisible}
            pageVisible={pageVisible}
            live={live}
            socketRef={socketRef}
            postRead={postRead}
            onSnapshot={setSnapshot}
            setPresence={setPresence}
            setConnection={setConnection}
            setPageVisible={setPageVisible}
            setHasNewMessage={setHasNewMessage}
          />
        </Suspense>
      )}
    </ChatContext.Provider>
  );
}
