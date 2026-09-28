import { z } from 'zod';

export const eventStatus = z.enum(['scheduled', 'active', 'held', 'cancelled', 'rescheduled']);
export type EventStatus = z.infer<typeof eventStatus>;

export const afterMeetingVenue = z.object({
  name: z.string(),
  address: z.string(),
  description: z.string().nullish(),
  lat: z.number().nullish(),
  lng: z.number().nullish(),
});
export type AfterMeetingVenue = z.infer<typeof afterMeetingVenue>;

export const clubEvent = z.object({
  id: z.string(),
  clubId: z.string(),
  clubName: z.string(),
  organizerId: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  date: z.string(),
  city: z.string(),
  address: z.string().nullable(),
  lat: z.number().nullable(),
  lng: z.number().nullable(),
  status: eventStatus,
  cancelledAt: z.string().nullable(),
  coverUrl: z.string().nullish(),
  bookTitle: z.string().nullish(),
  theme: z.string().nullable(),
  tags: z.array(z.string()).default([]),
  durationMinutes: z.number().nullable(),
  afterMeetingVenue: afterMeetingVenue.nullable(),
  attendeeCount: z.number(),
  isAttending: z.boolean(),
  hasWinner: z.boolean().default(false),
  winnerId: z.string().nullish(),
  winnerName: z.string().nullish(),
  googleBookId: z.string().nullish(),
});
export type ClubEvent = z.infer<typeof clubEvent>;

export const createEventRequest = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).nullish(),
  date: z.string(),
  city: z.string().min(1).max(100),
  address: z.string().max(300).nullish(),
  lat: z.number().nullish(),
  lng: z.number().nullish(),
  coverUrl: z.string().max(500).nullish(),
  bookTitle: z.string().max(300).nullish(),
  theme: z.string().max(200).nullish(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  durationMinutes: z.number().int().min(1).max(480).nullish(),
  afterMeetingVenue: afterMeetingVenue.nullish(),
  googleBookId: z.string().max(50).nullish(),
});
export type CreateEventRequest = z.input<typeof createEventRequest>;

/** PATCH /events/{id} mixes camelCase and snake_case exactly as the backend does. */
export const updateEventRequest = z.object({
  title: z.string().min(1).max(200).nullish(),
  description: z.string().max(5000).nullish(),
  date: z.string().nullish(),
  city: z.string().min(1).max(100).nullish(),
  address: z.string().max(300).nullish(),
  lat: z.number().nullish(),
  lng: z.number().nullish(),
  theme: z.string().max(200).nullish(),
  tags: z.array(z.string()).nullish(),
  cover_url: z.string().nullish(),
  duration_minutes: z.number().nullish(),
  after_meeting_venue: afterMeetingVenue.nullish(),
  has_winner: z.boolean().nullish(),
  google_book_id: z.string().nullish(),
});
export type UpdateEventRequest = z.input<typeof updateEventRequest>;

export const rescheduleEventRequest = z.object({
  newDate: z.string(),
  newAddress: z.string().nullish(),
  newCity: z.string().nullish(),
});
export type RescheduleEventRequest = z.input<typeof rescheduleEventRequest>;

export const attendEventResponse = z.object({
  attendeeCount: z.number(),
  joinRequestStatus: z.enum(['none', 'pending', 'member']).default('none'),
});
export type AttendEventResponse = z.infer<typeof attendEventResponse>;
