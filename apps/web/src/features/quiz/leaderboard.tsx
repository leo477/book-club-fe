'use client';

import type { QuizLeaderboardEntry } from '@book-club/contracts';
import { useTranslations } from 'next-intl';
import { initials } from '@/lib/format';
import { safeImageUrl } from '@/lib/safe-image-url';
import { cn } from '@/lib/utils';

function Avatar({ entry, className }: { entry: QuizLeaderboardEntry; className: string }) {
  const src = entry.avatarUrl ? safeImageUrl(entry.avatarUrl) : '';
  return (
    <div className={cn('relative rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-bold text-gray-700 dark:text-gray-300 overflow-hidden', className)} aria-hidden="true">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- avatar URLs are arbitrary hosts
        <img src={src} alt="" referrerPolicy="no-referrer" loading="lazy" className="absolute inset-0 size-full object-cover" />
      ) : (
        initials(entry.displayName)
      )}
    </div>
  );
}

const PLACES = [
  { key: 'leaderboard_1st', medal: '🥇', avatar: 'size-14 text-base ring-4 ring-yellow-400', bar: 'h-32 from-yellow-300 to-yellow-100 dark:from-yellow-600/60 dark:to-yellow-400/30', order: 'order-2' },
  { key: 'leaderboard_2nd', medal: '🥈', avatar: 'size-12 text-sm ring-2 ring-gray-300 dark:ring-gray-500', bar: 'h-24 from-gray-200 to-gray-100 dark:from-gray-700 dark:to-gray-600', order: 'order-1' },
  { key: 'leaderboard_3rd', medal: '🥉', avatar: 'size-12 text-sm ring-2 ring-amber-500', bar: 'h-20 from-amber-600/70 to-amber-400/40 dark:from-amber-700/60 dark:to-amber-500/30', order: 'order-3' },
] as const;

/** Top three; an empty place keeps its slot so the podium never collapses. */
export function Podium({ entries }: { entries: readonly QuizLeaderboardEntry[] }) {
  const t = useTranslations('QUIZ');
  return (
    <ol className="flex items-end justify-center gap-3 px-4 py-6" aria-label={t('leaderboard_title')}>
      {PLACES.map((place, index) => {
        const entry = entries[index];
        return (
          <li key={place.key} className={cn('flex flex-col items-center gap-2 flex-1 max-w-[120px]', place.order)}>
            {entry ? (
              <>
                <Avatar entry={entry} className={place.avatar} />
                <p className="text-xs text-[var(--color-ink)] font-medium text-center truncate w-full px-1">
                  <span className="sr-only">{t(place.key)}: </span>
                  {entry.displayName}
                </p>
                <span className="inline-flex items-center rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-800 dark:text-primary-200 px-2.5 py-0.5 text-xs font-bold">
                  {entry.score}/{entry.totalQuestions}
                </span>
              </>
            ) : (
              <p className="text-xs text-[var(--color-ink-muted)] text-center">
                <span aria-hidden="true">—</span>
                <span className="sr-only">{t(place.key)}</span>
              </p>
            )}
            <div aria-hidden="true" className={cn('w-full rounded-t-xl flex items-center justify-center text-2xl bg-gradient-to-t', place.bar)}>
              {place.medal}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function RestTable({ entries }: { entries: readonly QuizLeaderboardEntry[] }) {
  const t = useTranslations('QUIZ');
  return (
    <div className="parchment-card overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-[var(--color-ink-muted)] uppercase tracking-wide text-xs">
          <tr>
            <th scope="col" className="px-4 py-3 text-left w-12">
              {t('leaderboard_rank')}
            </th>
            <th scope="col" className="px-4 py-3 text-left">
              {t('leaderboard_player')}
            </th>
            <th scope="col" className="px-4 py-3 text-right">
              {t('leaderboard_score')}
            </th>
            <th scope="col" className="px-4 py-3 text-right">
              {t('leaderboard_status')}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-border,#0001)]">
          {entries.map((entry) => (
            <tr key={entry.userId}>
              <td className="px-4 py-3 text-[var(--color-ink-muted)] font-mono text-center">{entry.rank}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <Avatar entry={entry} className="size-8 text-xs shrink-0" />
                  <span className="text-[var(--color-ink)] font-medium truncate">{entry.displayName}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-right whitespace-nowrap">
                <span className="font-semibold text-[var(--color-ink)]">{entry.score}</span>
                <span className="text-[var(--color-ink-muted)]">/{entry.totalQuestions}</span>
              </td>
              <td className="px-4 py-3 text-right">
                <span className="inline-flex rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-xs text-[var(--color-ink-muted)] dark:text-gray-300">
                  {entry.hasAttempted ? t('leaderboard_completed') : t('leaderboard_pending')}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Standings({ entries }: { entries: readonly QuizLeaderboardEntry[] }) {
  return (
    <div className="space-y-4">
      <div className="parchment-card overflow-hidden">
        <Podium entries={entries} />
      </div>
      {entries.length > 3 ? <RestTable entries={entries.slice(3)} /> : null}
    </div>
  );
}
