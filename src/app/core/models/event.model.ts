export type EventStatus = 'scheduled' | 'active' | 'held' | 'cancelled' | 'rescheduled';

export interface AfterMeetingVenue {
  name: string;
  address: string;
  description?: string;
  lat?: number;
  lng?: number;
}

// Named ClubEvent to avoid collision with the DOM Event type
export interface ClubEvent {
  id: string;
  clubId: string;
  clubName: string;
  organizerId: string;
  title: string;
  description: string | null;
  date: string;
  city: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
  status: EventStatus;
  cancelledAt?: string;
  coverUrl: string | null;
  theme: string | null;
  tags: string[];
  durationMinutes: number | null;
  afterMeetingVenue: AfterMeetingVenue | null;
  attendeeCount: number;
  isAttending: boolean;
}
