import type { ClubEvent } from '@book-club/contracts';

const CITY_NORM: Record<string, string> = {
  київ: 'Kyiv', kyiv: 'Kyiv',
  львів: 'Lviv', lviv: 'Lviv',
  одеса: 'Odesa', odesa: 'Odesa',
  харків: 'Kharkiv', kharkiv: 'Kharkiv',
  дніпро: 'Dnipro', dnipro: 'Dnipro',
};

const normalizeCity = (city: string): string => CITY_NORM[city.toLowerCase()] ?? city;

export function filterByCity(events: readonly ClubEvent[], city: string): ClubEvent[] {
  if (!city) return [...events];
  return events.filter((e) => normalizeCity(e.city?.trim() ?? '') === city);
}

export function availableCities(events: readonly ClubEvent[]): string[] {
  const byKey = new Map<string, string>();
  for (const e of events) {
    const original = e.city?.trim();
    if (!original) continue;
    const normalized = normalizeCity(original);
    const key = normalized.toLowerCase();
    if (!byKey.has(key)) byKey.set(key, normalized);
  }
  return [...byKey.values()].sort((a, b) => a.localeCompare(b));
}

export function groupByDate(events: readonly ClubEvent[]): Record<string, ClubEvent[]> {
  const groups: Record<string, ClubEvent[]> = {};
  for (const e of events) (groups[e.date.slice(0, 10)] ??= []).push(e);
  return groups;
}

export const daysUntil = (date: string, now: number): number => Math.ceil((new Date(date).getTime() - now) / 86_400_000);

export function patchAttendance(events: ClubEvent[] | undefined, eventId: string, attending: boolean): ClubEvent[] | undefined {
  return events?.map((e) => (e.id === eventId ? { ...e, isAttending: attending, attendeeCount: e.attendeeCount + (attending ? 1 : -1) } : e));
}
