import type { ClubEvent } from '@book-club/contracts';
import { useLocale, useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { AppLink } from '@/components/app-link';
import { formatDate } from '@/lib/format';

const STATUS_BADGE: Partial<Record<ClubEvent['status'], { icon: string; className: string }>> = {
  active: { icon: '🟢', className: 'bg-green-100/80 border-green-400 dark:bg-green-900/50 dark:border-green-600' },
  cancelled: { icon: '🔴', className: 'bg-red-100/80 border-red-400 dark:bg-red-900/50 dark:border-red-600' },
  held: { icon: '🟡', className: 'bg-yellow-100/80 border-yellow-400 dark:bg-yellow-900/50 dark:border-yellow-600' },
  rescheduled: { icon: '🟡', className: 'bg-yellow-100/80 border-yellow-400 dark:bg-yellow-900/50 dark:border-yellow-600' },
};

interface EventCardProps {
  event: ClubEvent;
  /** viewer-specific controls (RSVP, organizer badge); absent in the server-rendered list */
  actions?: ReactNode;
}

/** Renders on the server for the crawlable first paint and in the interactive island, so it holds no client state. */
export function EventCard({ event, actions }: EventCardProps) {
  const t = useTranslations('CLUB_DETAIL');
  const locale = useLocale();
  const badge = STATUS_BADGE[event.status];

  return (
    <article className="relative parchment-card flex flex-col overflow-hidden h-full">
      {event.coverUrl ? (
        <div className="relative h-28 overflow-hidden flex-shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element -- cover URLs are arbitrary hosts */}
          <img src={event.coverUrl} alt="" aria-hidden="true" width={400} height={112} referrerPolicy="no-referrer" loading="lazy" className="absolute inset-0 size-full object-cover" />
        </div>
      ) : (
        <div className="h-1 w-full bg-gradient-to-r from-primary-500 via-accent-500 to-primary-400 flex-shrink-0" />
      )}

      {badge && (
        <div
          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center text-sm shadow-sm border z-10 ${badge.className}`}
          title={event.status}
        >
          <span aria-hidden="true">{badge.icon}</span>
          <span className="sr-only">{event.status}</span>
        </div>
      )}

      <div className="flex flex-col flex-1 p-4 gap-3">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-100/80 dark:bg-primary-900/40 border border-primary-200 dark:border-primary-700/60 px-3 py-1 text-xs font-semibold text-primary-700 dark:text-primary-300">
            <span aria-hidden="true">📅</span> {formatDate(event.date, locale)}
          </span>
        </div>

        <AppLink
          href={`/events/${event.id}`}
          className="block font-display text-base font-semibold leading-snug text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors line-clamp-2"
        >
          {event.title}
        </AppLink>

        {event.city && (
          <p className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <span aria-hidden="true">📍</span>
            <span>{event.address || event.city}</span>
          </p>
        )}

        {(event.theme || event.tags.length > 0) && (
          <div className="flex flex-wrap gap-1.5">
            {event.theme && (
              <span className="rounded-full bg-accent-100/80 dark:bg-accent-900/40 border border-accent-200 dark:border-accent-700/60 px-2.5 py-0.5 text-xs font-medium text-accent-700 dark:text-accent-300">
                ✨ {event.theme}
              </span>
            )}
            {event.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="rounded-full bg-gray-100/80 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60 px-2.5 py-0.5 text-xs text-gray-600 dark:text-gray-400">
                🏷 {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/20 dark:border-white/10">
          <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <span aria-hidden="true">👥</span> {event.attendeeCount} {t('rsvp_attending')}
          </span>
          <div className="flex items-center gap-2">{actions}</div>
        </div>
      </div>
    </article>
  );
}
