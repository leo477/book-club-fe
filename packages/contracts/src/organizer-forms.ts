import { z } from 'zod';

/** Same pattern as the Angular cover-URL validator. */
export const COVER_URL_PATTERN = /^https?:\/\/.+\..+/;

type ClubNamespace = 'CREATE_CLUB' | 'EDIT_CLUB';

const coverUrlField = z.string().refine((v) => v === '' || COVER_URL_PATTERN.test(v), 'CREATE_CLUB.cover_url_invalid');

const clubBasics = (ns: ClubNamespace) => ({
  name: z.string().min(1, `${ns}.name_required`).min(3, `${ns}.name_min`).max(100, `${ns}.name_max`),
  description: z.string().max(500, `${ns}.description_max`),
  isPublic: z.boolean(),
  city: z.string(),
  coverUrl: coverUrlField,
});

/** Messages are i18n keys, identical to the Angular create-club template. The optional first meeting is only sent when all three of its fields are filled. */
export const createClubForm = z.object({
  ...clubBasics('CREATE_CLUB'),
  firstEventTitle: z.string(),
  firstEventDate: z.string(),
  firstEventCity: z.string(),
});
export type CreateClubForm = z.input<typeof createClubForm>;

const DURATION_INVALID = 'CLUB_MANAGE.duration_invalid';

/** Blank is allowed; otherwise a whole number inside [min, max]. */
export const minutesField = (min: number, max: number, message: string) =>
  z.string().refine((v) => {
    if (v.trim() === '') return true;
    const n = Number(v);
    return Number.isInteger(n) && n >= min && n <= max;
  }, message);

export const editClubForm = z
  .object({
    ...clubBasics('EDIT_CLUB'),
    tags: z.string(),
    meetingDurationMinutes: minutesField(1, 480, DURATION_INVALID),
    venueName: z.string(),
    venueAddress: z.string(),
    venueDescription: z.string(),
  })
  .refine((v) => !v.venueName.trim() || v.venueAddress.trim() !== '', { path: ['venueAddress'], message: 'CLUB_MANAGE.venue_address_required' });
export type EditClubForm = z.input<typeof editClubForm>;

/** Create and edit share these rules; city is filled from the address suggestion, so an empty one means no place was picked. */
export const eventForm = z
  .object({
    title: z.string().min(1, 'CREATE_EVENT.title_required').min(3, 'FORM_ERRORS.minlength').max(120, 'FORM_ERRORS.invalid'),
    description: z.string(),
    date: z.string().min(1, 'CREATE_EVENT.date_required'),
    city: z.string().min(1, 'CREATE_EVENT.location_required'),
    address: z.string(),
    lat: z.number().nullable(),
    lng: z.number().nullable(),
    theme: z.string(),
    tagsRaw: z.string(),
    durationMinutes: minutesField(15, 480, 'FORM_ERRORS.invalid'),
    afterVenueName: z.string(),
    afterVenueAddress: z.string(),
    afterVenueLat: z.number().nullable(),
    afterVenueLng: z.number().nullable(),
    afterVenueDescription: z.string(),
    coverUrl: z.string(),
    bookTitle: z.string(),
    googleBookId: z.string().nullable(),
    hasWinner: z.boolean(),
  })
  .refine((v) => !v.afterVenueName.trim() || v.afterVenueAddress.trim() !== '', { path: ['afterVenueAddress'], message: 'CLUB_MANAGE.venue_address_required' });
export type EventForm = z.input<typeof eventForm>;

/** `a, b,, c` -> ['a', 'b', 'c'] */
export const splitTags = (raw: string): string[] =>
  raw
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
