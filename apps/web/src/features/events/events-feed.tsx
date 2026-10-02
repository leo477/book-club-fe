'use client';
'use no memo';

import { useQuery } from '@tanstack/react-query';
import type { Club, ClubEvent } from '@book-club/contracts';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { AppLink } from '@/components/app-link';
import { EmptyState } from '@/components/empty-state';
import { Spinner } from '@/components/ui/spinner';
import { clubsKey } from '@/features/clubs/use-clubs';
import { useSession } from '@/features/clubs/use-session';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import { EventCard } from './event-card';
import { availableCities, filterByCity, groupByDate } from './event-data';
import { useAllEvents, useMyEvents, useRsvp } from './use-events';

type Tab = 'upcoming' | 'my';

const GRID = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6';
const TAB_BASE = 'relative z-10 px-7 py-2 rounded-full text-sm font-medium transition-colors duration-300 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-500)] focus-visible:ring-offset-1';
const TAB_ON = 'text-[var(--color-primary-700)] dark:text-[#fbbf24] font-semibold';
const TAB_OFF = 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]';

export function EventsFeed() {
  const t = useTranslations('EVENTS');
  const tNav = useTranslations('NAV');
  const tCities = useTranslations('events');
  const locale = useLocale();
  const { user } = useSession();
  const all = useAllEvents();
  const mine = useMyEvents();
  // like Angular, the single-club shortcut only knows clubs the /clubs page has already loaded; it never fetches them
  const loadedClubs = useQuery<Club[]>({ queryKey: clubsKey, queryFn: () => [], enabled: false });
  const { rsvp, pendingIds } = useRsvp();
  const [tab, setTab] = useState<Tab>('upcoming');
  const [city, setCity] = useState('');
  const [now] = useState(Date.now);

  const events = all.data ?? [];
  const myEvents = mine.data ?? [];
  const cities = availableCities(events);
  const grouped = groupByDate(filterByCity(events, city));
  const dates = Object.keys(grouped).sort((a, b) => a.localeCompare(b));
  const ownedClubs = (loadedClubs.data ?? []).filter((c) => c.organizerId === user?.id);
  const singleOwned = ownedClubs.length === 1 ? ownedClubs[0] : undefined;
  const error = all.isError ? t('load_error') : mine.isError ? t('load_my_error') : null;

  const card = (event: ClubEvent) => (
    <li key={event.id} data-testid="event-card">
      <EventCard
        event={event}
        isAuthenticated={user !== null}
        attending={pendingIds.includes(event.id)}
        isOrganizer={user?.id === event.organizerId}
        now={now}
        onAttend={() => rsvp({ eventId: event.id, attending: true })}
        onCancelAttend={() => rsvp({ eventId: event.id, attending: false })}
      />
    </li>
  );

  const spinner = (
    <div className="py-16 flex justify-center" aria-busy="true">
      <Spinner />
    </div>
  );

  const upcoming = all.isPending ? (
    spinner
  ) : dates.length === 0 ? (
    <EmptyState icon="📅" title={t('no_upcoming')} description={t('no_upcoming_desc')} />
  ) : (
    dates.map((date) => (
      <section key={date} aria-labelledby={`date-${date}`} className="mb-10">
        <div className="date-section-divider mb-5">
          <h2 id={`date-${date}`} className="date-badge font-fantasy tracking-wider uppercase">
            <span aria-hidden="true">✦</span> {formatDate(date, locale)} <span aria-hidden="true">✦</span>
          </h2>
        </div>
        <ul className={GRID}>{grouped[date]?.map(card)}</ul>
      </section>
    ))
  );

  const myPanel = all.isPending || mine.isPending ? (
    spinner
  ) : myEvents.length === 0 ? (
    <EmptyState icon="📅" title={t('no_my_events')} description={t('no_my_events_desc')} />
  ) : (
    <ul className={GRID}>{myEvents.map(card)}</ul>
  );

  return (
    <div className="min-h-screen">
      <section className="parchment-hero px-4 py-14 text-center">
        <div className="relative z-10">
          <h1 className="font-fantasy text-4xl font-bold tracking-widest uppercase text-[var(--color-ink)] mb-2 drop-shadow-sm">{tNav('events')}</h1>
          <p className="text-[var(--color-ink-muted)] font-display text-lg mb-8">{t('subtitle')}</p>

          {user?.role === 'organizer' && (
            <div className="mb-6">
              <AppLink
                href={singleOwned ? `/clubs/${singleOwned.id}/events/create` : '/clubs'}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-fantasy text-white font-medium shadow-md hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)] focus:ring-offset-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                {singleOwned ? t('create_event_cta') : t('choose_club_cta')}
              </AppLink>
            </div>
          )}

          {cities.length > 0 && (
            <div className="mx-auto max-w-sm">
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                aria-label={t('filter_by_city')}
                className="w-full parchment-input rounded-full px-4 py-2.5 text-sm appearance-none cursor-pointer"
              >
                <option value="">{tCities('filter.cities.all')}</option>
                {cities.map((c) => {
                  const key = `cities.${c.toLowerCase()}`;
                  return (
                    <option key={c} value={c}>
                      {tCities.has(key) ? tCities(key) : c}
                    </option>
                  );
                })}
              </select>
            </div>
          )}
        </div>
      </section>

      <div className="page-container py-8 space-y-8">
        {error && (
          <div className="flex items-start gap-2 parchment-card px-4 py-3 text-sm text-red-700 dark:text-red-400" role="alert">
            <span aria-hidden="true">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <div className="flex justify-center" role="tablist" aria-label="Event filter">
          <div className="relative flex rounded-full p-1 bg-[var(--color-surface-sunken)] border border-[var(--color-sepia)] shadow-inner">
            <div
              className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full bg-[var(--color-surface-raised)] shadow-[var(--shadow-parchment)] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
              style={{ left: tab === 'upcoming' ? '4px' : '50%' }}
              aria-hidden="true"
            />
            <button role="tab" type="button" aria-selected={tab === 'upcoming'} onClick={() => setTab('upcoming')} className={cn(TAB_BASE, tab === 'upcoming' ? TAB_ON : TAB_OFF)}>
              {t('tab_upcoming')}
            </button>
            <button role="tab" type="button" aria-selected={tab === 'my'} onClick={() => setTab('my')} className={cn(TAB_BASE, 'flex items-center gap-1.5', tab === 'my' ? TAB_ON : TAB_OFF)}>
              {t('tab_my')}
              {myEvents.length > 0 && (
                <span
                  className={cn(
                    'inline-flex items-center justify-center h-4 min-w-[1rem] px-1 rounded-full text-[10px] font-bold leading-none transition-colors duration-300',
                    tab === 'my' ? 'bg-[var(--color-primary-600)] text-white' : 'bg-[var(--color-ink-muted)]/20 text-[var(--color-ink-muted)]',
                  )}
                >
                  {myEvents.length}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="pt-6" role="tabpanel">
          {tab === 'upcoming' ? upcoming : myPanel}
        </div>
      </div>
    </div>
  );
}
