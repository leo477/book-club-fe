'use client';
'use no memo';

import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import type { ChatMessage } from '@book-club/contracts';
import { describeError } from '@/features/club-detail/describe-error';
import { useMyClubs } from '@/features/clubs/use-clubs';
import { useSession } from '@/features/clubs/use-session';
import { api } from '@/lib/api';
import { showToast } from '@/lib/toast';
import {
  OLDER_PAGE_SIZE,
  TEMP_PREFIX,
  isTemp,
  mergeLatest,
  messagesKey,
  prependOlder,
  roomsKey,
  unreadKey,
  type ChatRoomView,
  type MessagesPage,
  type UnreadState,
} from './chat-model';

const NO_ROOMS: readonly ChatRoomView[] = [];
const NO_UNREAD: Readonly<Record<string, UnreadState>> = {};

/** Rooms of every club the viewer belongs to; with several clubs a room reads "Club · Room". */
export function useChatRooms(enabled: boolean) {
  const myClubs = useMyClubs(enabled);
  const clubs = myClubs.data ?? [];
  const ids = clubs.map((c) => c.id).join(',');
  const rooms = useQuery({
    queryKey: [...roomsKey, ids],
    enabled: enabled && clubs.length > 0,
    refetchOnWindowFocus: false,
    queryFn: async ({ signal }): Promise<ChatRoomView[]> => {
      const several = clubs.length > 1;
      const perClub = await Promise.all(
        clubs.map((club) =>
          api.chat
            .clubRooms(club.id, { signal, suppressErrorToast: true })
            .then((list) =>
              list.map((r) => ({ ...r, name: several ? `${club.name} · ${r.name}` : r.name, clubId: club.id, clubName: club.name })),
            )
            .catch((): ChatRoomView[] => []),
        ),
      );
      return perClub.flat();
    },
  });
  return {
    rooms: rooms.data ?? NO_ROOMS,
    clubs,
    isPending: enabled && (myClubs.isPending || (clubs.length > 0 && rooms.isPending)),
    isError: myClubs.isError || rooms.isError,
    refetch: () => void Promise.all([myClubs.isError ? myClubs.refetch() : null, rooms.refetch()]),
  };
}

/** Server-backed unread counts, fetched once per room; a failing endpoint just means "nothing unread". */
export function useUnreadCounts(roomIds: readonly string[], enabled: boolean) {
  return useQueries({
    queries: roomIds.map((id) => ({
      queryKey: unreadKey(id),
      enabled,
      staleTime: Infinity,
      retry: false,
      refetchOnWindowFocus: false,
      queryFn: async ({ signal }: { signal: AbortSignal }): Promise<UnreadState> => {
        const data = await api.chat.unreadCount(id, { signal, suppressErrorToast: true });
        return { count: data.unread_count, lastReadId: data.last_read_message_id ?? null };
      },
    })),
    combine: (results) => {
      const byRoom: Record<string, UnreadState> = {};
      let total = 0;
      results.forEach((r, i) => {
        const id = roomIds[i];
        if (id === undefined || !r.data) return;
        byRoom[id] = r.data;
        total += r.data.count;
      });
      return { byRoom: roomIds.length === 0 ? NO_UNREAD : byRoom, total };
    },
  });
}

export function useChatRoom(roomId: string | null) {
  const queryClient = useQueryClient();
  const { user } = useSession();
  const tErrors = useTranslations('ERRORS');
  const key = messagesKey(roomId ?? '');
  const olderInFlight = useRef(false);
  const [isLoadingOlder, setLoadingOlder] = useState(false);

  const query = useQuery({
    queryKey: key,
    enabled: roomId !== null,
    // a room left behind misses its live frames, so each visit re-reads the latest page
    staleTime: 0,
    refetchOnWindowFocus: false,
    queryFn: async ({ signal }): Promise<MessagesPage> => {
      const fresh = await api.chat.messages(roomId ?? '', {}, { signal, suppressErrorToast: true });
      const prev = queryClient.getQueryData<MessagesPage>(key);
      return { items: mergeLatest(prev?.items ?? [], fresh), hasMoreOlder: prev?.hasMoreOlder ?? true };
    },
  });

  const edit = (fn: (items: ChatMessage[]) => ChatMessage[]) =>
    queryClient.setQueryData<MessagesPage>(key, (page) => (page ? { ...page, items: fn(page.items) } : page));

  const send = useMutation({
    mutationFn: (text: string) => api.chat.send(roomId ?? '', text),
    onMutate: (text) => {
      const tempId = `${TEMP_PREFIX}${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      edit((items) => [
        ...items,
        { id: tempId, senderId: user?.id ?? '', senderName: user?.displayName ?? '', text, timestamp: new Date().toISOString(), isSystem: false },
      ]);
      return { tempId };
    },
    onSuccess: (saved, _text, ctx) =>
      edit((items) =>
        items.some((m) => m.id === saved.id) ? items.filter((m) => m.id !== ctx.tempId) : items.map((m) => (m.id === ctx.tempId ? saved : m)),
      ),
    onError: (err, _text, ctx) => {
      if (ctx) edit((items) => items.filter((m) => m.id !== ctx.tempId));
      showToast('error', describeError(err, tErrors));
    },
  });

  /** Fetches the page before the oldest confirmed message and prepends it; resolves true when something was added. */
  async function loadOlder(): Promise<boolean> {
    const page = queryClient.getQueryData<MessagesPage>(key);
    const oldest = page?.items[0];
    if (!roomId || !page?.hasMoreOlder || !oldest || isTemp(oldest) || olderInFlight.current) return false;
    olderInFlight.current = true;
    setLoadingOlder(true);
    try {
      const older = await api.chat.messages(roomId, { beforeId: oldest.id, limit: OLDER_PAGE_SIZE }, { suppressErrorToast: true });
      queryClient.setQueryData<MessagesPage>(key, (current) =>
        current && { items: prependOlder(current.items, older), hasMoreOlder: older.length >= OLDER_PAGE_SIZE },
      );
      return older.length > 0;
    } catch (err) {
      showToast('error', describeError(err, tErrors));
      return false;
    } finally {
      olderInFlight.current = false;
      setLoadingOlder(false);
    }
  }

  return {
    messages: query.data?.items ?? [],
    hasMoreOlder: query.data?.hasMoreOlder ?? true,
    isPending: roomId !== null && query.isPending,
    isError: query.isError && query.data === undefined,
    refetch: () => void query.refetch(),
    isLoadingOlder,
    loadOlder,
    send: (text: string) => send.mutate(text),
  };
}

export function useRoomActions() {
  const queryClient = useQueryClient();
  const tErrors = useTranslations('ERRORS');
  const refresh = () => queryClient.invalidateQueries({ queryKey: roomsKey });
  const onError = (err: unknown) => showToast('error', describeError(err, tErrors));
  const create = useMutation({
    mutationFn: ({ clubId, name }: { clubId: string; name: string }) => api.chat.createClubRoom(clubId, name),
    onSuccess: refresh,
    onError,
  });
  const remove = useMutation({
    mutationFn: (roomId: string) => api.chat.deleteRoom(roomId),
    onSuccess: refresh,
    onError,
  });
  return {
    createRoom: (clubId: string, name: string) => create.mutateAsync({ clubId, name }).then(() => true, () => false),
    deleteRoom: (roomId: string) => remove.mutateAsync(roomId).then(() => true, () => false),
    isCreating: create.isPending,
  };
}
