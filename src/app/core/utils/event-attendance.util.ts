import { ClubEvent } from '../models/event.model';

/** Applies the same isAttending/attendeeCount ±1 patch used by both
 *  EventService (post-confirmation) and ClubDetailComponent (optimistic,
 *  with rollback) — kept in one place so the two don't drift. */
export function patchEventAttendance(events: ClubEvent[], eventId: string, attending: boolean): ClubEvent[] {
  return events.map(e =>
    e.id === eventId
      ? { ...e, isAttending: attending, attendeeCount: e.attendeeCount + (attending ? 1 : -1) }
      : e,
  );
}
