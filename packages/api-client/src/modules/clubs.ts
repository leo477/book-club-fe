import {
  club,
  clubEvent,
  clubStats,
  joinClubResponse,
  myMembership,
  type CreateClubRequest,
  type CreateEventRequest,
  type UpdateClubRequest,
} from '@book-club/contracts';
import { z } from 'zod';
import type { ApiClient } from '../client';

const clubs = z.array(club);
const events = z.array(clubEvent);

export const clubsApi = (c: ApiClient) => ({
  list: (options?: { skipAuthRedirect?: boolean }) => c.get('/clubs', clubs, options),
  mine: () => c.get('/clubs/my', clubs),
  get: (id: string, options?: { skipAuthRedirect?: boolean }) => c.get(`/clubs/${id}`, club, options),
  create: (body: CreateClubRequest) => c.post('/clubs', club, body),
  update: (id: string, body: UpdateClubRequest) => c.patch(`/clubs/${id}`, club, body),
  pause: (id: string) => c.patch(`/clubs/${id}/pause`, club, {}),
  cancel: (id: string) => c.patch(`/clubs/${id}/cancel`, club, {}),
  reschedule: (id: string, newDate: string) => c.patch(`/clubs/${id}/reschedule`, club, { newDate }),
  remove: (id: string) => c.delete(`/clubs/${id}`, z.void()),
  join: (id: string) => c.post(`/clubs/${id}/join`, joinClubResponse, {}),
  leave: (id: string) => c.delete(`/clubs/${id}/leave`, z.void()),
  myMembership: (id: string) => c.get(`/clubs/${id}/my-membership`, myMembership),
  stats: (id: string) => c.get(`/clubs/${id}/stats`, clubStats),
  events: (id: string, includePast = false) =>
    c.get(`/clubs/${id}/events`, events, { query: { include_past: includePast } }),
  createEvent: (id: string, body: CreateEventRequest) => c.post(`/clubs/${id}/events`, clubEvent, body),
});
