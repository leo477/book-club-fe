import type { Club, ClubEvent } from '@book-club/contracts';
import { SITE_URL } from '@/lib/site';

const EVENT_STATUS = 'https://schema.org/EventScheduled';

export const isUpcoming = (event: Pick<ClubEvent, 'status'>): boolean => event.status === 'scheduled' || event.status === 'active';

/** Only absolute http(s) URLs may enter metadata or structured data (rejects javascript:, data:, relative paths). */
export function safeHttpUrl(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : undefined;
  } catch {
    return undefined;
  }
}

export function clubUrl(id: string): string {
  return `${SITE_URL}/clubs/${id}`;
}

export function clubDescription(club: Club): string | null {
  return club.description ? club.description.slice(0, 160) : null;
}

/** The club as an Organization (as Angular emits) plus its upcoming events as Event nodes. */
export function clubJsonLd(club: Club, events: readonly ClubEvent[], description: string) {
  const url = clubUrl(club.id);
  const organization = {
    '@type': 'Organization',
    '@id': url,
    name: club.name,
    description,
    url,
    ...(safeHttpUrl(club.coverUrl) && { image: safeHttpUrl(club.coverUrl) }),
    ...(club.city && { address: { '@type': 'PostalAddress', addressLocality: club.city, addressCountry: 'UA' } }),
    ...(club.createdAt && { foundingDate: club.createdAt.slice(0, 10) }),
    ...(club.tags.length > 0 && { keywords: club.tags.join(', ') }),
  };
  const upcoming = events.filter(isUpcoming).map((event) => ({
    '@type': 'Event',
    name: event.title,
    startDate: event.date,
    eventStatus: EVENT_STATUS,
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    url: `${SITE_URL}/events/${event.id}`,
    ...(event.description && { description: event.description }),
    ...(safeHttpUrl(event.coverUrl) && { image: safeHttpUrl(event.coverUrl) }),
    location: {
      '@type': 'Place',
      name: event.address ?? event.city,
      address: { '@type': 'PostalAddress', addressLocality: event.city, addressCountry: 'UA', ...(event.address && { streetAddress: event.address }) },
    },
    organizer: { '@id': url },
  }));
  return { '@context': 'https://schema.org', '@graph': [organization, ...upcoming] };
}
