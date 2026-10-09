import { describe, expect, it } from 'vitest';
import { createClubForm, editClubForm, eventForm, splitTags } from '../src';

// react-hook-form shows the first failing rule per field, so the first message is the one that matters
const keys = (result: { success: boolean; error?: { issues: { message: string; path: PropertyKey[] }[] } }) => {
  const seen = new Set<string>();
  return (result.error?.issues ?? []).filter((i) => !seen.has(i.path.join('.')) && seen.add(i.path.join('.'))).map((i) => i.message);
};

const club = { name: 'Alpha', description: '', isPublic: true, city: '', coverUrl: '', firstEventTitle: '', firstEventDate: '', firstEventCity: '' };

describe('createClubForm', () => {
  it('accepts the minimal valid form', () => {
    expect(createClubForm.safeParse(club).success).toBe(true);
  });

  it.each([
    [{ name: '' }, 'CREATE_CLUB.name_required'],
    [{ name: 'ab' }, 'CREATE_CLUB.name_min'],
    [{ name: 'x'.repeat(101) }, 'CREATE_CLUB.name_max'],
    [{ description: 'x'.repeat(501) }, 'CREATE_CLUB.description_max'],
    [{ coverUrl: 'not a url' }, 'CREATE_CLUB.cover_url_invalid'],
    [{ coverUrl: 'ftp://a.b/c.png' }, 'CREATE_CLUB.cover_url_invalid'],
  ])('reports %j as %s', (patch, key) => {
    expect(keys(createClubForm.safeParse({ ...club, ...patch }))).toEqual([key]);
  });

  it('accepts an https cover URL', () => {
    expect(createClubForm.safeParse({ ...club, coverUrl: 'https://example.com/c.jpg' }).success).toBe(true);
  });
});

const edit = { ...club, tags: '', meetingDurationMinutes: '', venueName: '', venueAddress: '', venueDescription: '' };

describe('editClubForm', () => {
  it('uses the EDIT_CLUB message keys', () => {
    expect(keys(editClubForm.safeParse({ ...edit, name: '' }))).toEqual(['EDIT_CLUB.name_required']);
    expect(keys(editClubForm.safeParse({ ...edit, description: 'x'.repeat(501) }))).toEqual(['EDIT_CLUB.description_max']);
  });

  it.each([['0'], ['481'], ['1.5'], ['abc']])('rejects a duration of %s', (value) => {
    expect(keys(editClubForm.safeParse({ ...edit, meetingDurationMinutes: value }))).toEqual(['CLUB_MANAGE.duration_invalid']);
  });

  it.each([[''], ['1'], ['480']])('accepts a duration of %j', (value) => {
    expect(editClubForm.safeParse({ ...edit, meetingDurationMinutes: value }).success).toBe(true);
  });

  it('requires a venue address once a venue name is given', () => {
    const result = editClubForm.safeParse({ ...edit, venueName: 'Cafe', venueAddress: '  ' });
    expect(keys(result)).toEqual(['CLUB_MANAGE.venue_address_required']);
    expect(result.error?.issues[0]?.path).toEqual(['venueAddress']);
    expect(editClubForm.safeParse({ ...edit, venueName: 'Cafe', venueAddress: 'Main st' }).success).toBe(true);
  });
});

const event = {
  title: 'Dune night',
  description: '',
  date: '2099-05-01T18:00',
  city: 'Kyiv',
  address: '',
  lat: null,
  lng: null,
  theme: '',
  tagsRaw: '',
  durationMinutes: '',
  afterVenueName: '',
  afterVenueAddress: '',
  afterVenueLat: null,
  afterVenueLng: null,
  afterVenueDescription: '',
  coverUrl: '',
  bookTitle: '',
  googleBookId: null,
  hasWinner: false,
};

describe('eventForm', () => {
  it('accepts a valid event', () => {
    expect(eventForm.safeParse(event).success).toBe(true);
  });

  it.each([
    [{ title: '' }, 'CREATE_EVENT.title_required'],
    [{ title: 'ab' }, 'FORM_ERRORS.minlength'],
    [{ title: 'x'.repeat(121) }, 'FORM_ERRORS.invalid'],
    [{ date: '' }, 'CREATE_EVENT.date_required'],
    [{ city: '' }, 'CREATE_EVENT.location_required'],
    [{ durationMinutes: '14' }, 'FORM_ERRORS.invalid'],
    [{ durationMinutes: '481' }, 'FORM_ERRORS.invalid'],
    [{ afterVenueName: 'Bar' }, 'CLUB_MANAGE.venue_address_required'],
  ])('reports %j as %s', (patch, key) => {
    expect(keys(eventForm.safeParse({ ...event, ...patch }))).toEqual([key]);
  });
});

describe('splitTags', () => {
  it('trims and drops empty entries', () => {
    expect(splitTags(' a, b ,, c,')).toEqual(['a', 'b', 'c']);
    expect(splitTags('')).toEqual([]);
  });
});
