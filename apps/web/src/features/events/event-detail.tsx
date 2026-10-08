'use client';
'use no memo';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocale, useTranslations } from 'next-intl';
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { AppLink } from '@/components/app-link';
import { LazyBoundary } from '@/components/lazy-boundary';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { BookStores } from '@/features/club-detail/sidebar';
import { useSession } from '@/features/clubs/use-session';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/format';
import { RsvpButton } from './rsvp-button';
import { invalidateEvents, useEvent, useRsvp } from './use-events';

// the Maps loader and its key request only matter on events that have coordinates
const EventMap = lazy(() => import('./event-map'));

const CARD = 'rounded-2xl bg-white dark:bg-gray-800 shadow-sm p-6';
const SECTION_TITLE = 'text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3';
const BACK_LINK = 'inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors';

function BookDetails({ bookId }: { bookId: string }) {
  const t = useTranslations('EVENTS');
  const query = useQuery({ queryKey: ['book', bookId], queryFn: () => api.books.details(bookId), retry: false, refetchOnWindowFocus: false });
  const book = query.data;
  return (
    <div className="rounded-xl border border-[var(--color-sepia)] bg-[var(--color-surface)] p-5 space-y-4">
      {query.isPending ? (
        <div className="flex justify-center py-4">
          <Spinner />
        </div>
      ) : (
        book && (
          <>
            <div className="flex gap-4">
              {book.thumbnail && (
                // eslint-disable-next-line @next/next/no-img-element -- cover URLs are arbitrary hosts
                <img src={book.thumbnail} alt={book.title} width={64} height={96} referrerPolicy="no-referrer" className="w-16 h-24 object-cover rounded-lg shadow-sm shrink-0" />
              )}
              <div>
                <p className="font-display font-bold text-lg text-[var(--color-ink)] leading-tight">{book.title}</p>
                <p className="text-sm text-[var(--color-ink-muted)] mt-0.5">{book.authors.join(', ')}</p>
                {book.publishedDate && (
                  <p className="text-xs text-[var(--color-ink-muted)] mt-0.5 opacity-70">
                    {t('book_published')}: {book.publishedDate.slice(0, 4)}
                  </p>
                )}
              </div>
            </div>
            {book.description && (
              <div>
                <p className="font-fantasy text-xs uppercase tracking-widest text-[var(--color-primary-500)] mb-2">📖 {t('book_about')}</p>
                <p className="text-sm text-[var(--color-ink)] leading-relaxed">{book.description}</p>
              </div>
            )}
            {book.authors.length > 0 && (
              <div>
                <p className="font-fantasy text-xs uppercase tracking-widest text-[var(--color-primary-500)] mb-2">✍️ {t('book_author')}</p>
                <p className="text-sm font-medium text-[var(--color-ink)]">{book.authors.join(', ')}</p>
                {book.publisher && <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">{book.publisher}</p>}
              </div>
            )}
          </>
        )
      )}
    </div>
  );
}

export function EventDetail({ id: rawId }: { id: string }) {
  // ids are lowercase everywhere else; an uppercase URL must hit the same cache entry the RSVP patches
  const id = rawId.toLowerCase();
  const t = useTranslations('EVENTS');
  const tNew = useTranslations('CREATE_EVENT');
  const locale = useLocale();
  const queryClient = useQueryClient();
  const { user } = useSession();
  const query = useEvent(id);
  const { rsvp, pendingIds } = useRsvp();
  const [bookOpen, setBookOpen] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const cancelTrigger = useRef<HTMLButtonElement>(null);
  const confirmButton = useRef<HTMLButtonElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (confirmCancel) confirmButton.current?.focus();
  }, [confirmCancel]);

  const dismissConfirm = () => {
    setConfirmCancel(false);
    cancelTrigger.current?.focus();
  };

  const cancelEvent = useMutation({
    mutationFn: () => api.events.cancel(id),
    onSettled: () => invalidateEvents(queryClient),
  });

  if (query.isPending) {
    return (
      <section className="max-w-3xl mx-auto px-4 py-8" aria-busy="true">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded-lg" />
        </div>
      </section>
    );
  }

  const event = query.data;
  if (!event) {
    return (
      <section className="max-w-3xl mx-auto px-4 py-8 text-center" role="alert">
        <p className="text-6xl mb-4" aria-hidden="true">😕</p>
        <p className="text-gray-500 dark:text-gray-400 mb-6">{t('load_error')}</p>
        <AppLink href="/events" className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 transition-colors">
          {t('back_to_events')}
        </AppLink>
      </section>
    );
  }

  const isOrganizer = user !== null && event.organizerId === user.id;
  const actioning = pendingIds.includes(event.id) || cancelEvent.isPending;
  const venue = event.afterMeetingVenue;

  return (
    <section className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <nav>
        <AppLink href="/events" className={BACK_LINK}>
          {t('back_to_events')}
        </AppLink>
      </nav>

      <div className={`${CARD} space-y-3`}>
        <div className="flex items-start justify-between gap-4">
          <h1 ref={heading} tabIndex={-1} className="text-2xl focus:outline-none font-bold text-gray-900 dark:text-white">{event.title}</h1>
          {event.status !== 'scheduled' && (
            <span
              className={`text-xs rounded-full px-2.5 py-1 shrink-0 ${
                event.status === 'cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              }`}
            >
              {t.has(`status_${event.status}`) ? t(`status_${event.status}`) : event.status}
            </span>
          )}
        </div>

        <AppLink href={`/clubs/${event.clubId}`} className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
          <span aria-hidden="true">📚</span> {event.clubName}
        </AppLink>

        <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
          <span>
            <span aria-hidden="true">📅</span> {formatDate(event.date, locale)}
          </span>
          {event.city && (
            <span>
              <span aria-hidden="true">📍</span> {event.address || event.city}
            </span>
          )}
          {event.durationMinutes ? (
            <span>
              <span aria-hidden="true">⏱</span> {event.durationMinutes} {t('minutes_abbr')}
            </span>
          ) : null}
          <span>
            <span aria-hidden="true">👤</span> {event.attendeeCount} {t('attending')}
          </span>
        </div>

        {user && event.status !== 'cancelled' && (
          <div className="flex gap-3 pt-2">
            <RsvpButton
              attending={event.isAttending}
              loading={actioning}
              showCancel
              size="default"
              onClick={() => rsvp({ eventId: event.id, attending: !event.isAttending })}
            />
          </div>
        )}

        {(event.coverUrl || event.bookTitle) && (
          <div className="flex gap-4 items-start pt-1 border-t border-gray-100 dark:border-gray-700">
            {event.coverUrl && (
              // eslint-disable-next-line @next/next/no-img-element -- cover URLs are arbitrary hosts
              <img
                src={event.coverUrl}
                alt=""
                width={64}
                height={96}
                referrerPolicy="no-referrer"
                loading="lazy"
                className="w-16 h-24 object-cover rounded-lg shadow-[var(--shadow-parchment-lg)] shrink-0 border border-[var(--color-sepia)]"
              />
            )}
            <div className="flex-1 min-w-0 pt-1">
              {event.bookTitle && <p className="font-display font-semibold text-[var(--color-ink)] leading-snug text-sm">📖 {event.bookTitle}</p>}
              {event.googleBookId && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  aria-expanded={bookOpen}
                  className="mt-1 h-auto px-0 py-0 text-xs text-[var(--color-primary-600)] dark:text-[var(--color-primary-400)] hover:bg-transparent hover:underline font-medium"
                  onClick={() => setBookOpen((open) => !open)}
                >
                  {bookOpen ? t('book_details_hide') : t('book_details_btn')}
                </Button>
              )}
            </div>
          </div>
        )}
        {bookOpen && event.googleBookId && <BookDetails bookId={event.googleBookId} />}
      </div>

      {isOrganizer && event.status !== 'cancelled' && (
        <section className="rounded-2xl border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 p-6">
          <h2 className="text-sm font-semibold text-yellow-800 dark:text-yellow-300 uppercase tracking-wide mb-3">{t('organizer_controls')}</h2>
          <div className="flex gap-3">
            <AppLink href={`/events/${event.id}/edit`} className="rounded-lg bg-primary-600 hover:bg-primary-700 px-3 py-1.5 text-xs font-semibold text-white transition-colors">
              {t('editEvent')}
            </AppLink>
            <button
              ref={cancelTrigger}
              type="button"
              disabled={actioning}
              onClick={() => setConfirmCancel(true)}
              className="rounded-lg bg-red-600 hover:bg-red-700 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60 transition-colors"
            >
              {t('cancel_event')}
            </button>
          </div>
          {confirmCancel && (
            <div
              className="flex items-center justify-between gap-3 mt-3 px-3 py-2 rounded-lg bg-red-100 dark:bg-red-900/30"
              onKeyDown={(e) => {
                if (e.key === 'Escape') dismissConfirm();
              }}
            >
              <span className="text-xs text-red-700 dark:text-red-300">{t('cancel_confirm')}</span>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  ref={confirmButton}
                  type="button"
                  disabled={actioning}
                  onClick={() => {
                    setConfirmCancel(false);
                    // the trigger is disabled while cancelling and unmounts once the event is cancelled, the heading always stays
                    heading.current?.focus();
                    cancelEvent.mutate();
                  }}
                  className="rounded-lg bg-red-600 hover:bg-red-700 px-3 py-1 text-xs font-semibold text-white disabled:opacity-60 transition-colors"
                >
                  {t('cancel_event')}
                </button>
                <button type="button" onClick={dismissConfirm} className="rounded-lg bg-white dark:bg-gray-700 px-3 py-1 text-xs font-semibold text-gray-700 dark:text-gray-200 transition-colors">
                  {tNew('cancel')}
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {event.bookTitle && (
        <section className={CARD}>
          <BookStores bookTitle={event.bookTitle} />
        </section>
      )}

      {event.description && (
        <section className={CARD}>
          <h2 className={SECTION_TITLE}>{t('about')}</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{event.description}</p>
        </section>
      )}

      {(event.theme || event.tags.length > 0) && (
        <section className={CARD}>
          <h2 className={SECTION_TITLE}>{t('tags')}</h2>
          <div className="flex flex-wrap gap-2">
            {event.theme && <span className="rounded-full bg-accent-100 dark:bg-accent-900/30 px-3 py-1 text-xs font-medium text-accent-700 dark:text-accent-300">{event.theme}</span>}
            {event.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-gray-100 dark:bg-gray-700 px-3 py-1 text-xs text-gray-600 dark:text-gray-400">
                {tag}
              </span>
            ))}
          </div>
        </section>
      )}

      {venue && (
        <section className={CARD}>
          <h2 className={SECTION_TITLE}>{t('after_meeting_venue')}</h2>
          <p className="font-medium text-gray-900 dark:text-white">{venue.name}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{venue.address}</p>
          {venue.description && <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{venue.description}</p>}
        </section>
      )}

      {event.lat != null && event.lng != null && (
        <LazyBoundary fallback={null}>
          <Suspense fallback={null}>
            <EventMap lat={event.lat} lng={event.lng} address={event.address} afterMeetingVenue={venue} />
          </Suspense>
        </LazyBoundary>
      )}
    </section>
  );
}
