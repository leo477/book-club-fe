'use client';

import type { ClubEvent } from '@book-club/contracts';
import { useLocale, useTranslations } from 'next-intl';
import { AppLink } from '@/components/app-link';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/format';
import { EventCountdown } from './countdown';
import { daysUntil } from './event-data';
import { RsvpButton } from './rsvp-button';

const STATUS_TONE: Record<string, string> = {
  cancelled: 'bg-destructive/10 text-destructive',
  active: 'bg-primary text-primary-foreground',
};

interface Props {
  event: ClubEvent;
  isAuthenticated: boolean;
  attending: boolean;
  isOrganizer: boolean;
  now: number;
  onAttend: () => void;
  onCancelAttend: () => void;
}

export function EventCard({ event, isAuthenticated, attending, isOrganizer, now, onAttend, onCancelAttend }: Props) {
  const t = useTranslations('EVENTS');
  const locale = useLocale();
  const days = daysUntil(event.date, now);
  const statusKey = `status_${event.status}`;

  return (
    <article className="parchment-card flex flex-col overflow-hidden h-full hover:shadow-[var(--shadow-parchment-lg)] transition-shadow duration-200">
      <div className="flex flex-col flex-1 p-4 gap-3">
        <div className="flex items-start justify-between gap-2">
          <span className="date-badge">{formatDate(event.date, locale)}</span>
          {event.status !== 'scheduled' && (
            <span className={`rounded-full px-2.5 py-0.5 text-xs flex-shrink-0 ${STATUS_TONE[event.status] ?? 'bg-secondary text-secondary-foreground'}`}>
              {t.has(statusKey) ? t(statusKey) : event.status}
            </span>
          )}
        </div>

        <h3 className="font-display font-semibold text-[var(--color-ink)] leading-snug line-clamp-2">{event.title}</h3>

        <AppLink href={`/clubs/${event.clubId}`} className="text-xs text-[var(--color-primary-600)] dark:text-[#fbbf24] hover:underline font-medium">
          {event.clubName}
        </AppLink>

        {event.city && (
          <p className="text-xs text-[var(--color-ink-muted)] flex items-center gap-1">
            <span aria-hidden="true">📍</span>
            <span>{event.address || event.city}</span>
          </p>
        )}

        {(event.theme || event.tags.length > 0) && (
          <div className="flex flex-wrap gap-1.5">
            {event.theme && (
              <span className="rounded-full bg-[var(--color-accent-100)]/80 dark:bg-[var(--color-accent-900)]/40 border border-[var(--color-accent-300)] dark:border-[var(--color-accent-700)]/60 px-2.5 py-0.5 text-xs font-medium text-[var(--color-accent-700)] dark:text-[var(--color-accent-300)]">
                {event.theme}
              </span>
            )}
            {event.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="rounded-full bg-[var(--color-surface-raised)] border border-[var(--color-sepia-mid)] px-2.5 py-0.5 text-xs text-[var(--color-ink-muted)]">
                {tag}
              </span>
            ))}
          </div>
        )}

        {days > 0 && days <= 3 && <EventCountdown eventDate={event.date} label={t('countdown_label', { title: event.title })} />}

        <div className="flex items-center justify-between mt-auto pt-2 border-t border-[var(--color-sepia-mid)] pr-16 sm:pr-0">
          <span className="text-xs text-[var(--color-ink-muted)]">
            {event.attendeeCount} {t('attending')}
          </span>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <AppLink href={`/events/${event.id}`}>
                {t('view')}
                <span className="sr-only"> — {event.title}</span>
              </AppLink>
            </Button>
            {isOrganizer ? (
              <span className="text-xs font-semibold text-[var(--color-primary-600)] dark:text-[#fbbf24]">{t('organizer_badge')}</span>
            ) : (
              isAuthenticated &&
              event.status !== 'cancelled' &&
              event.status !== 'held' && (
                <RsvpButton
                  attending={event.isAttending}
                  loading={attending}
                  closed={days <= 0}
                  label={event.title}
                  onClick={event.isAttending ? onCancelAttend : onAttend}
                />
              )
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
