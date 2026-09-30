'use client';
'use no memo';

import { useQuery } from '@tanstack/react-query';
import type { Club } from '@book-club/contracts';
import { useTranslations } from 'next-intl';
import { api } from '@/lib/api';
import { initials } from '@/lib/format';
import { useClubMembers, useClubRole } from './use-club-detail';

const SOCIALS = [
  { key: 'telegram', base: 'https://t.me/', icon: '✈️', label: 'Telegram', color: 'text-blue-500 hover:text-blue-600' },
  { key: 'instagram', base: 'https://instagram.com/', icon: '📸', label: 'Instagram', color: 'text-pink-500 hover:text-pink-600' },
  { key: 'github', base: 'https://github.com/', icon: '🐙', label: 'GitHub', color: 'text-gray-700 dark:text-gray-300 hover:text-gray-900' },
  { key: 'goodreads', base: 'https://goodreads.com/', icon: '📚', label: 'Goodreads', color: 'text-amber-600 hover:text-amber-700' },
] as const;

/** The organizer comes from the member list, which only signed-in viewers can read. */
export function OrganizerCard({ club }: { club: Pick<Club, 'id' | 'organizerId'> }) {
  const t = useTranslations('CLUB_DETAIL');
  const role = useClubRole(club);
  const members = useClubMembers(club.id, role.isAuthenticated);
  const organizer = members.data?.find((m) => m.role === 'organizer');
  if (!role.isAuthenticated || !organizer) return null;
  const links = organizer.socialsPublic ? SOCIALS.filter((s) => organizer.socials?.[s.key]) : [];
  return (
    <div className="glass-card-subtle p-4 flex flex-col gap-3 text-sm">
      <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">{t('organizer_title')}</h3>
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0" aria-hidden="true">
          {initials(organizer.displayName)}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{organizer.displayName}</p>
          <span className="text-xs text-accent-600 dark:text-accent-400">{t('organizer_badge')}</span>
        </div>
      </div>
      {links.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {links.map((s) => (
            <a key={s.key} href={`${s.base}${organizer.socials?.[s.key]}`} target="_blank" rel="noopener noreferrer" className={`${s.color} text-lg`} aria-label={s.label}>
              {s.icon}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

const SKELETONS = [1, 2, 3];

/** Store availability is looked up in the browser, as Angular does; an https-only link opens in a new tab. */
export function BookStores({ bookTitle }: { bookTitle: string }) {
  const t = useTranslations('BOOK_STORES');
  const query = useQuery({ queryKey: ['book-stores', bookTitle], queryFn: () => api.books.stores(bookTitle), refetchOnWindowFocus: false, retry: false });
  const stores = query.data ?? [];
  return (
    <section>
      <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
        <span aria-hidden="true">📚</span> {t('title')}
      </h3>
      {query.isPending ? (
        <div className="flex flex-wrap gap-2" aria-busy="true">
          {SKELETONS.map((i) => (
            <div key={i} className="h-9 w-28 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse" />
          ))}
        </div>
      ) : stores.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {stores.map((store) => {
            const style =
              store.found === true
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/30'
                : store.found === false
                  ? 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700';
            const content = (
              <>
                <span>{store.name}</span>
                {store.found !== null && (
                  <span
                    className={`text-xs rounded-full px-1.5 py-0.5 font-semibold ${store.found ? 'bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}
                  >
                    {store.found ? t('found') : t('not_found')}
                  </span>
                )}
              </>
            );
            const className = `inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium border transition-colors ${style}`;
            return (
              <li key={store.name}>
                {store.url.startsWith('https://') ? (
                  <a href={store.url} target="_blank" rel="noopener noreferrer" className={className}>
                    {content}
                  </a>
                ) : (
                  <span className={className}>{content}</span>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-sm text-gray-400 dark:text-gray-500">{t('error')}</p>
      )}
    </section>
  );
}
