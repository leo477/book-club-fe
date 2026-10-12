'use client';
'use no memo';

import { skipToken, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, type Dispatch, type MutableRefObject, type SetStateAction } from 'react';
import { useTranslations } from 'next-intl';
import type { Club } from '@book-club/contracts';
import type { ChatSocket, ChatSocketStatus, PresenceStatus } from '@book-club/api-client/ws';
import { api } from '@/lib/api';
import { showToast } from '@/lib/toast';
import type { ChatAudioAlert } from './chat-audio-alert';
import { RESUME_RECONNECT_MS, lastConfirmedId, messagesKey, unreadKey } from './chat-keys';
import { mergeIncoming, mergeLatest, type ChatRoomView, type MessagesPage, type UnreadState } from './chat-model';
import { fetchWsTicket, wsBaseUrl } from './chat-ticket';
import { useChatRooms, useUnreadCounts } from './use-chat-data';

export interface RoomsSnapshot {
  rooms: readonly ChatRoomView[];
  clubs: readonly Club[];
  pending: boolean;
  error: boolean;
  retry: () => void;
  unread: Readonly<Record<string, UnreadState>>;
  total: number;
}

interface Props {
  activeRoomId: string | null;
  chatVisible: boolean;
  pageVisible: boolean;
  live: MutableRefObject<{ userId: string | null; watching: boolean }>;
  socketRef: MutableRefObject<ChatSocket | null>;
  postRead: (roomId: string, messageId: string) => void;
  onSnapshot: Dispatch<SetStateAction<RoomsSnapshot>>;
  setPresence: Dispatch<SetStateAction<ReadonlyMap<string, PresenceStatus>>>;
  setConnection: Dispatch<SetStateAction<ChatSocketStatus>>;
  setPageVisible: Dispatch<SetStateAction<boolean>>;
  setHasNewMessage: Dispatch<SetStateAction<boolean>>;
}

/** Everything that talks to the network for chat; mounted (and loaded) only while the chat is active. Renders nothing. */
export function ChatRuntime({
  activeRoomId,
  chatVisible,
  pageVisible,
  live,
  socketRef,
  postRead,
  onSnapshot,
  setPresence,
  setConnection,
  setPageVisible,
  setHasNewMessage,
}: Props) {
  const queryClient = useQueryClient();
  const t = useTranslations('CHAT');
  const { rooms, clubs, isPending, isError, refetch } = useChatRooms(true);
  const { byRoom, total } = useUnreadCounts(rooms.map((r) => r.id), true);
  const audioRef = useRef<ChatAudioAlert | null>(null);
  const refetchRef = useRef<() => void>(() => undefined);
  const retry = useCallback(() => refetchRef.current(), []);

  useEffect(() => {
    refetchRef.current = refetch;
  });

  useEffect(() => {
    onSnapshot({ rooms, clubs, pending: isPending, error: isError, retry, unread: byRoom, total });
  }, [onSnapshot, rooms, clubs, isPending, isError, retry, byRoom, total]);

  useEffect(() => () => onSnapshot((prev) => ({ ...prev, rooms: [], clubs: [], unread: {}, total: 0, pending: true })), [onSnapshot]);

  const newestId = lastConfirmedId(useQuery<MessagesPage>({ queryKey: messagesKey(activeRoomId ?? ''), queryFn: skipToken }).data);

  // The room on screen is read as it arrives; the divider keeps pointing at the old marker until the viewer leaves or sends.
  useEffect(() => {
    if (!activeRoomId || !chatVisible || !pageVisible) return;
    queryClient.setQueryData<UnreadState>(unreadKey(activeRoomId), (u) => ({ count: 0, lastReadId: u?.lastReadId ?? null }));
    if (newestId) postRead(activeRoomId, newestId);
  }, [activeRoomId, chatVisible, pageVisible, newestId, queryClient, postRead]);

  useEffect(() => {
    let disposed = false;
    let alert: ChatAudioAlert | null = null;
    void import('./chat-audio-alert').then((m) => {
      if (disposed) return;
      alert = m.createChatAudioAlert();
      audioRef.current = alert;
    });
    return () => {
      disposed = true;
      alert?.dispose();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!activeRoomId) return;
    const roomId = activeRoomId;
    const key = messagesKey(roomId);
    let hasOpened = false;
    let disposed = false;
    let socket: ChatSocket | null = null;
    // a live frame can precede the first history fetch, so "new" cannot depend on the cached page
    const seen = new Set<string>();

    const fillGap = () => {
      api.chat
        .messages(roomId, {}, { skipAuthRedirect: true, suppressErrorToast: true })
        .then((fresh) => queryClient.setQueryData<MessagesPage>(key, (page) => page && { ...page, items: mergeLatest(page.items, fresh) }))
        .catch(() => undefined);
    };

    void import('@book-club/api-client/ws').then(({ createChatSocket }) => {
      if (disposed) return;
      socket = createChatSocket({
        baseUrl: wsBaseUrl(),
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
        onError: (error) => showToast('error', t(error.code === 'ROOM_BANNED' ? 'error_banned' : 'error_rate_limited')),
        onMessage: (message) => {
          const page = queryClient.getQueryData<MessagesPage>(key);
          let added: boolean;
          if (page) {
            const merged = mergeIncoming(page.items, message);
            added = merged.added;
            if (added) queryClient.setQueryData<MessagesPage>(key, { ...page, items: merged.items });
          } else {
            added = !seen.has(message.id);
          }
          seen.add(message.id);
          const { userId: me, watching } = live.current;
          if (!added || message.senderId === me || watching) return;
          queryClient.setQueryData<UnreadState>(unreadKey(roomId), (u) => ({ count: (u?.count ?? 0) + 1, lastReadId: u?.lastReadId ?? null }));
          setHasNewMessage(true);
          audioRef.current?.playBeep();
        },
      });
      socketRef.current = socket;
    });

    return () => {
      disposed = true;
      socket?.close();
      if (socketRef.current === socket) socketRef.current = null;
      setPresence(new Map());
      setConnection('idle');
    };
  }, [activeRoomId, queryClient, t, live, socketRef, setConnection, setPresence, setHasNewMessage]);

  useEffect(() => {
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
  }, [socketRef, setPageVisible]);

  return null;
}
