import type { Club, ClubEvent } from '@book-club/contracts';
import { useLocale, useTranslations } from 'next-intl';
import { AppLink } from '@/components/app-link';
import { formatDate } from '@/lib/format';
import { isUpcoming } from './structured-data';

export function Hero({ club }: { club: Pick<Club, 'name' | 'coverUrl'> }) {
  const t = useTranslations('CLUB_DETAIL');
  return (
    <div className="relative parchment-hero h-64">
      {club.coverUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- cover URLs are arbitrary hosts; no image optimizer is configured
        <img
          src={club.coverUrl}
          alt={`${club.name} cover`}
          width={1280}
          height={256}
          referrerPolicy="no-referrer"
          fetchPriority="high"
          className="absolute inset-0 size-full object-cover"
        />
      ) : (
        <div className="bg-gradient-fantasy h-64" aria-hidden="true" />
      )}
      <div className="absolute inset-0 flex items-end justify-center pointer-events-none px-6 pb-8">
        <h1
          data-testid="club-name"
          className="font-fantasy font-bold text-white uppercase tracking-widest text-4xl sm:text-5xl lg:text-6xl text-center drop-shadow-[0_2px_12px_rgba(0,0,0,0.7)]"
        >
          {club.name}
        </h1>
      </div>
      <nav aria-label={t('back')} className="absolute top-4 left-4">
        <AppLink
          href="/clubs"
          aria-label={t('back')}
          className="inline-flex items-center gap-1.5 rounded-full parchment-card px-3 py-1.5 text-sm font-medium text-[var(--color-ink)] hover:scale-105 transition-all duration-200"
        >
          ← {t('back_short')}
        </AppLink>
      </nav>
    </div>
  );
}

export function PrivateBadge({ club }: { club: Pick<Club, 'isPublic'> }) {
  const t = useTranslations('CLUB_DETAIL');
  if (club.isPublic) return null;
  return (
    <span className="rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:text-gray-400">
      🔒 {t('private')}
    </span>
  );
}

export function About({ club }: { club: Club }) {
  const t = useTranslations('CLUB_DETAIL');
  if (!club.description) return null;
  return (
    <section className="parchment-card-sunken px-6 py-6 flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">{t('about')}</h2>
      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{club.description}</p>
    </section>
  );
}

/** The book of the nearest upcoming event, else the club's current book. */
export function nearestBook(club: Club, events: readonly ClubEvent[]): { title: string; coverUrl: string | null } | null {
  const nearest = events.filter(isUpcoming).sort((a, b) => a.date.localeCompare(b.date))[0];
  if (nearest?.bookTitle) return { title: nearest.bookTitle, coverUrl: nearest.coverUrl ?? null };
  return club.currentBook ? { title: club.currentBook, coverUrl: null } : null;
}

export function NowReading({ book }: { book: { title: string; coverUrl: string | null } }) {
  const t = useTranslations('CLUB_DETAIL');
  return (
    <div className="parchment-card-sunken p-4 flex flex-col gap-3">
      <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">📖 {t('now_reading')}</h3>
      {book.coverUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- cover URLs are arbitrary hosts
        <img src={book.coverUrl} alt={book.title} width={256} height={160} referrerPolicy="no-referrer" loading="lazy" className="w-full rounded-xl object-cover mb-3 max-h-40" />
      )}
      <p className="font-serif italic text-sm font-semibold text-gray-900 dark:text-white leading-snug">{book.title}</p>
    </div>
  );
}

export function Champion({ club }: { club: Club }) {
  const champion = club.currentChampion;
  const t = useTranslations('EVENT');
  if (!champion) return null;
  return (
    <div className="parchment-card-raised p-4 text-center mb-4">
      <p className="font-fantasy text-xs tracking-widest text-[var(--color-primary-500)] mb-3 uppercase">🏆 {t('champion_title')}</p>
      <div
        className="mx-auto mb-2 h-12 w-12 rounded-full bg-gradient-brand flex items-center justify-center text-white text-lg font-bold select-none"
        aria-hidden="true"
      >
        {champion.displayName.charAt(0).toUpperCase()}
      </div>
      <p className="font-semibold text-[var(--color-ink)]">{champion.displayName}</p>
      <p className="text-xs text-[var(--color-ink-muted)] mt-1">
        {t('winner_of')} {champion.eventTitle}
      </p>
    </div>
  );
}

export function AfterMeetingVenue({ club }: { club: Club }) {
  const venue = club.afterMeetingVenue;
  const t = useTranslations('CLUB_DETAIL');
  if (!venue) return null;
  return (
    <div className="glass-card-subtle p-4 flex flex-col gap-3">
      <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">{t('after_meeting_title')}</h3>
      <p className="text-sm font-medium text-gray-900 dark:text-white">{venue.name}</p>
      {venue.address && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">📍 {venue.address}</p>}
      {venue.description && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 italic">{venue.description}</p>}
    </div>
  );
}

export function Created({ club }: { club: Club }) {
  const t = useTranslations('CLUB_DETAIL');
  const locale = useLocale();
  return (
    <footer className="text-xs text-gray-400 dark:text-gray-600 text-right">
      {t('created')} {formatDate(club.createdAt, locale)}
    </footer>
  );
}
