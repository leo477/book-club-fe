import type { ClubEvent } from '@book-club/contracts';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { EventCard } from './event-card';
import { isUpcoming } from './structured-data';

export const EVENTS_GRID = 'grid gap-5 sm:grid-cols-2';
export const EVENTS_EMPTY = 'text-sm text-gray-500 dark:text-gray-400 text-center py-8';

export function EventsFrame({ action, children }: { action?: ReactNode; children: ReactNode }) {
  const t = useTranslations('CLUB_DETAIL');
  return (
    <section className="parchment-card px-6 py-6 flex flex-col gap-4 text-sm" aria-labelledby="club-events-title">
      <div className="flex items-center justify-between mb-4">
        <h2 id="club-events-title" className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          <span aria-hidden="true">📅</span> {t('events_title')}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

/**
 * The upcoming events as plain server markup: the crawlable first paint, and what stays on screen until the
 * interactive island (tabs, sorting, RSVP) has loaded. The blank strip holds the place of its tab bar.
 */
export function EventsStatic({ events }: { events: readonly ClubEvent[] }) {
  const t = useTranslations('CLUB_DETAIL');
  const upcoming = events.filter(isUpcoming).sort((a, b) => a.date.localeCompare(b.date));
  return (
    <EventsFrame>
      <div className="h-9 mb-4" aria-hidden="true" />
      {upcoming.length === 0 ? (
        <p className={EVENTS_EMPTY}>{t('events_empty')}</p>
      ) : (
        <ul className={EVENTS_GRID}>
          {upcoming.map((event) => (
            <li key={event.id}>
              <EventCard event={event} />
            </li>
          ))}
        </ul>
      )}
    </EventsFrame>
  );
}
