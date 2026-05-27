import { ClubEvent } from '../app/core/models/event.model';
import { ApiEvent } from '../app/core/api/api-mappers';

const BASE_EVENT = {
  id: 'e1', clubId: 'c1', clubName: 'Test Club', organizerId: 'u1',
  title: 'Test Event', description: null,
  date: '2025-06-01T10:00:00', city: 'Kyiv',
  address: null, lat: null, lng: null, status: 'scheduled' as const,
  coverUrl: null, theme: null, tags: [],
  durationMinutes: null, afterMeetingVenue: null,
  attendeeCount: 5, isAttending: false,
  googleBookId: null,
  hasWinner: false, winnerId: null, winnerName: null,
};

export function makeClubEvent(overrides: Partial<ClubEvent> = {}): ClubEvent {
  return { ...BASE_EVENT, ...overrides };
}

export function makeApiEvent(overrides: Partial<ApiEvent> = {}): ApiEvent {
  return { ...BASE_EVENT, ...overrides };
}
