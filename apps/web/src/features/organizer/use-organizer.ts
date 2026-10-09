'use client';
'use no memo';

import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import type { Club, ClubEvent, CreateClubRequest, CreateEventRequest, UpdateClubRequest, UpdateEventRequest } from '@book-club/contracts';
import { clubKey } from '@/features/club-detail/use-club-detail';
import { invalidateEvents, eventKey } from '@/features/events/use-events';
import { api } from '@/lib/api';

/**
 * The browser never calls `/_internal/revalidate`: that route needs REVALIDATE_SECRET, which must not reach client code.
 * The backend already posts `["clubs","club:<id>"]` to it after create/update of a club and create/update of a club event,
 * so only the browser-side query cache is refreshed here.
 */
export const invalidateClub = (queryClient: QueryClient, clubId: string) =>
  Promise.all([
    queryClient.invalidateQueries({ queryKey: ['clubs'] }),
    queryClient.invalidateQueries({ queryKey: ['club', clubId] }),
  ]);

const noRefocus = { refetchOnWindowFocus: false } as const;

/** The club behind the edit form; a private club the viewer cannot see arrives as a stub and is treated as missing by the caller. */
export const useClubForEdit = (clubId: string) =>
  useQuery({ queryKey: clubKey(clubId), queryFn: () => api.clubs.get(clubId), retry: false, staleTime: 0, ...noRefocus });

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
