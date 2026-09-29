import {
  attendEventResponse,
  clubEvent,
  type RescheduleEventRequest,
  type UpdateEventRequest,
} from '@book-club/contracts';
import { z } from 'zod';
import type { ApiClient } from '../client';

const events = z.array(clubEvent);

export interface EventsQuery {
  city?: string;
  clubId?: string;
  skip?: number;
  limit?: number;
}

export const eventsApi = (c: ApiClient) => ({
  list: ({ clubId, ...rest }: EventsQuery = {}, options?: { skipAuthRedirect?: boolean }) =>
    c.get('/events', events, { ...options, query: { ...rest, club_id: clubId } }),
  mine: () => c.get('/events/my', events),
  get: (id: string, options?: { skipAuthRedirect?: boolean }) => c.get(`/events/${id}`, clubEvent, options),
  attend: (id: string) => c.post(`/events/${id}/attend`, attendEventResponse, {}, { suppressErrorToast: true }),
  cancelAttendance: (id: string) => c.delete(`/events/${id}/attend`, z.void()),
  update: (id: string, body: UpdateEventRequest) => c.patch(`/events/${id}`, clubEvent, body),
  reschedule: (id: string, body: RescheduleEventRequest) => c.patch(`/events/${id}/reschedule`, clubEvent, body),
  cancel: (id: string) => c.patch(`/events/${id}/cancel`, clubEvent, {}),
  setWinner: (id: string, winnerId: string) => c.patch(`/events/${id}/winner`, clubEvent, { winner_id: winnerId }),
});
