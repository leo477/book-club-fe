'use client';
'use no memo';

import { useMutation, useMutationState, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ClubEvent } from '@book-club/contracts';
import { useTranslations } from 'next-intl';
import { describeError } from '@/features/club-detail/describe-error';
import { api } from '@/lib/api';
import { showToast } from '@/lib/toast';
import { patchAttendance } from './event-data';

export const eventsKey = ['events', 'all'] as const;
export const myEventsKey = ['events', 'mine'] as const;
export const eventKey = (id: string) => ['events', 'detail', id] as const;
const RSVP_KEY = ['events', 'rsvp'] as const;

const noRefocus = { refetchOnWindowFocus: false } as const;

export const useAllEvents = () => useQuery({ queryKey: eventsKey, queryFn: () => api.events.list({ skip: 0, limit: 50 }), ...noRefocus });
export const useMyEvents = () => useQuery({ queryKey: myEventsKey, queryFn: () => api.events.mine(), ...noRefocus });
export const useEvent = (id: string) => useQuery({ queryKey: eventKey(id), queryFn: () => api.events.get(id), retry: false, ...noRefocus });

interface Snapshot {
  all: ClubEvent | undefined;
  mine: ClubEvent | undefined;
  detail: ClubEvent | undefined;
}

const isBadRequest = (err: unknown) => typeof err === 'object' && err !== null && (err as { status?: unknown }).status === 400;

/** Optimistic RSVP: lists and the detail cache flip at once, a failed call restores only the touched event. */
export function useRsvp() {
  const queryClient = useQueryClient();
  const tErrors = useTranslations('ERRORS');
  const tEvents = useTranslations('EVENTS');

  const restoreSnapshot = (eventId: string, snapshot: Snapshot | undefined) => {
    const restore = (before: ClubEvent | undefined) => (list: ClubEvent[] | undefined) => (before ? list?.map((e) => (e.id === eventId ? before : e)) : list);
    queryClient.setQueryData<ClubEvent[]>(eventsKey, restore(snapshot?.all));
    queryClient.setQueryData<ClubEvent[]>(myEventsKey, restore(snapshot?.mine));
    if (snapshot?.detail) queryClient.setQueryData<ClubEvent>(eventKey(eventId), snapshot.detail);
  };

  const mutation = useMutation({
    mutationKey: RSVP_KEY,
    mutationFn: async ({ eventId, attending }: { eventId: string; attending: boolean }) => {
      if (attending) return api.events.attend(eventId);
      await api.events.cancelAttendance(eventId);
      return null;
    },
    onMutate: async ({ eventId, attending }): Promise<Snapshot> => {
      await queryClient.cancelQueries({ queryKey: ['events'] });
      const find = (list: ClubEvent[] | undefined) => list?.find((e) => e.id === eventId);
      const snapshot: Snapshot = {
        all: find(queryClient.getQueryData<ClubEvent[]>(eventsKey)),
        mine: find(queryClient.getQueryData<ClubEvent[]>(myEventsKey)),
        detail: queryClient.getQueryData<ClubEvent>(eventKey(eventId)),
      };
      queryClient.setQueryData<ClubEvent[]>(eventsKey, (list) => patchAttendance(list, eventId, attending));
      queryClient.setQueryData<ClubEvent[]>(myEventsKey, (list) => patchAttendance(list, eventId, attending));
      queryClient.setQueryData<ClubEvent>(eventKey(eventId), (e) => patchAttendance(e && [e], eventId, attending)?.[0]);
      return snapshot;
    },
    onSuccess: (result, { eventId }, snapshot) => {
      // a pending join request means the user is not attending yet
      if (result?.joinRequestStatus === 'pending') {
        restoreSnapshot(eventId, snapshot);
        showToast('success', tEvents('join_request_sent'));
      }
    },
    onError: (err, { eventId, attending }, snapshot) => {
      restoreSnapshot(eventId, snapshot);
      // attend is called with the toast suppressed so a closed registration can get its own message; cancel is toasted by the client
      if (attending) showToast('error', isBadRequest(err) ? tEvents('registration_closed') : describeError(err, tErrors));
    },
    // refetch once the last concurrent RSVP settled so a stale response cannot undo another event's optimistic patch
    onSettled: () => (queryClient.isMutating({ mutationKey: RSVP_KEY }) === 1 ? queryClient.invalidateQueries({ queryKey: ['events'] }) : undefined),
  });

  const pendingIds = useMutationState({ filters: { mutationKey: RSVP_KEY, status: 'pending' }, select: (m) => (m.state.variables as { eventId: string }).eventId });
  return { rsvp: mutation.mutate, pendingIds };
}
