import { describe, expect, it } from 'vitest';
import { clubEvent } from '@book-club/contracts';
import { eventJson } from '@/test/harness';
import { availableCities, daysUntil, filterByCity, groupByDate, patchAttendance } from './event-data';

const ev = (o: Record<string, unknown> = {}) => clubEvent.parse(eventJson(o));

describe('city helpers', () => {
  const events = [ev({ id: 'a', city: 'Київ' }), ev({ id: 'b', city: 'kyiv' }), ev({ id: 'c', city: ' Lviv ' }), ev({ id: 'd', city: 'Poltava' }), ev({ id: 'e', city: '' })];

  it('merges transliterations and sorts the distinct cities', () => {
    expect(availableCities(events)).toEqual(['Kyiv', 'Lviv', 'Poltava']);
  });

  it('filters by the normalised city, and returns everything for an empty filter', () => {
    expect(filterByCity(events, 'Kyiv').map((e) => e.id)).toEqual(['a', 'b']);
    expect(filterByCity(events, 'Poltava').map((e) => e.id)).toEqual(['d']);
    expect(filterByCity(events, '')).toHaveLength(5);
  });
});

describe('groupByDate', () => {
  it('groups by the date part of the ISO string', () => {
    const grouped = groupByDate([ev({ id: 'a', date: '2030-05-01T18:00:00Z' }), ev({ id: 'b', date: '2030-05-01T09:00:00Z' }), ev({ id: 'c', date: '2030-05-02T09:00:00Z' })]);
    expect(Object.keys(grouped)).toEqual(['2030-05-01', '2030-05-02']);
    expect(grouped['2030-05-01']?.map((e) => e.id)).toEqual(['a', 'b']);
  });
});

describe('daysUntil', () => {
  const now = Date.parse('2030-01-01T00:00:00Z');
  it('rounds partial days up and goes non-positive once the event started', () => {
    expect(daysUntil('2030-01-01T00:00:01Z', now)).toBe(1);
    expect(daysUntil('2030-01-04T00:00:00Z', now)).toBe(3);
    expect(daysUntil('2030-01-01T00:00:00Z', now)).toBe(0);
    expect(daysUntil('2029-12-30T00:00:00Z', now)).toBe(-2);
  });
});

describe('patchAttendance', () => {
  it('adjusts only the target event and tolerates a missing list', () => {
    const list = [ev({ id: 'a', attendeeCount: 2 }), ev({ id: 'b', attendeeCount: 5 })];
    const joined = patchAttendance(list, 'a', true)!;
    expect(joined[0]).toMatchObject({ isAttending: true, attendeeCount: 3 });
    expect(joined[1]).toBe(list[1]);
    expect(patchAttendance(joined, 'a', false)![0]).toMatchObject({ isAttending: false, attendeeCount: 2 });
    expect(patchAttendance(undefined, 'a', true)).toBeUndefined();
  });
});
