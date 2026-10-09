import { splitTags, type AfterMeetingVenue, type CreateEventRequest, type EventForm, type UpdateEventRequest } from '@book-club/contracts';

const num = (raw: string): number | null => (raw.trim() === '' ? null : Number(raw));

const venueOf = (v: EventForm): AfterMeetingVenue | null =>
  v.afterVenueName.trim()
    ? {
        name: v.afterVenueName,
        address: v.afterVenueAddress,
        ...(v.afterVenueDescription ? { description: v.afterVenueDescription } : {}),
        ...(v.afterVenueLat === null ? {} : { lat: v.afterVenueLat }),
        ...(v.afterVenueLng === null ? {} : { lng: v.afterVenueLng }),
      }
    : null;

/** POST /clubs/{id}/events body: blank optionals are left out, as the Angular form did. */
export function toCreateRequest(v: EventForm): CreateEventRequest {
  const durationMinutes = num(v.durationMinutes);
  const venue = venueOf(v);
  return {
    title: v.title,
    ...(v.description ? { description: v.description } : {}),
    date: new Date(v.date).toISOString(),
    city: v.city,
    ...(v.address ? { address: v.address } : {}),
    ...(v.lat === null ? {} : { lat: v.lat }),
    ...(v.lng === null ? {} : { lng: v.lng }),
    ...(v.theme ? { theme: v.theme } : {}),
    tags: splitTags(v.tagsRaw),
    ...(durationMinutes === null ? {} : { durationMinutes }),
    ...(venue ? { afterMeetingVenue: venue } : {}),
    coverUrl: v.coverUrl || null,
    bookTitle: v.bookTitle || null,
    googleBookId: v.googleBookId,
  };
}

/** PATCH /events/{id} body: cleared fields are sent as null so the backend drops them. */
export function toUpdateRequest(v: EventForm): UpdateEventRequest {
  return {
    title: v.title,
    description: v.description || null,
    date: new Date(v.date).toISOString(),
    city: v.city,
    address: v.address || null,
    lat: v.lat,
    lng: v.lng,
    theme: v.theme || null,
    tags: splitTags(v.tagsRaw),
    duration_minutes: num(v.durationMinutes),
    after_meeting_venue: venueOf(v),
    cover_url: v.coverUrl || null,
    google_book_id: v.googleBookId,
    has_winner: v.hasWinner,
  };
}

const pad = (n: number) => String(n).padStart(2, '0');

/** An ISO instant as the local `YYYY-MM-DDTHH:mm` a datetime-local input takes. */
export function toDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
