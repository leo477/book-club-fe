'use client';
'use no memo';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Club, ClubEvent, CreateClubRequest, CreateEventRequest, UpdateClubRequest, UpdateEventRequest } from '@book-club/contracts';
import { clubKey } from '@/features/club-detail/use-club-detail';
import { invalidateEvents, eventKey } from '@/features/events/use-events';
import { invalidateClub } from '@/features/club-shared/invalidate-club';
import { api } from '@/lib/api';

const noRefocus = { refetchOnWindowFocus: false } as const;

/** The club behind the edit form; a private club the viewer cannot see arrives as a stub and is treated as missing by the caller. */
export const useClubForEdit = (clubId: string, refetchOnMount: 'always' | false = 'always') =>
  useQuery({ queryKey: clubKey(clubId), queryFn: ({ signal }) => api.clubs.get(clubId, { signal }), retry: false, staleTime: 0, refetchOnMount, ...noRefocus });

interface CreateClubInput {
  club: CreateClubRequest;
  firstEvent: CreateEventRequest | null;
}

export function useCreateClub() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ club, firstEvent }: CreateClubInput): Promise<Club> => {
      const created = await api.clubs.create(club);
      if (firstEvent) {
        try {
          await api.clubs.createEvent(created.id, firstEvent);
        } catch {
          // the club already exists; a failed first meeting must not turn the creation into an error
        }
      }
      return created;
    },
    onSuccess: (created) => void invalidateClub(queryClient, created.id),
  });
}

export function useUpdateClub(clubId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateClubRequest) => api.clubs.update(clubId, body),
    onSuccess: () => void invalidateClub(queryClient, clubId),
  });
}

export function useCreateEvent(clubId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateEventRequest) => api.clubs.createEvent(clubId, body),
    onSuccess: (created: ClubEvent) => {
      queryClient.setQueryData(eventKey(created.id), created);
      void Promise.all([invalidateEvents(queryClient), invalidateClub(queryClient, clubId)]);
    },
  });
}

export function useUpdateEvent(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateEventRequest) => api.events.update(eventId, body),
    onSuccess: (updated: ClubEvent) => {
      queryClient.setQueryData(eventKey(eventId), updated);
      void Promise.all([invalidateEvents(queryClient), invalidateClub(queryClient, updated.clubId)]);
    },
  });
}
