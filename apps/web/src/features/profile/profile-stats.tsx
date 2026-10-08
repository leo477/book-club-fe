import type { UserStats } from '@book-club/contracts';
import { BookIcon, BookOpenIcon, BrainIcon, HeartIcon, TrophyIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

const TILES = [
  { key: 'clubsJoined', label: 'clubs_joined', Icon: BookOpenIcon, border: 'border-primary-500', text: 'text-primary-500' },
  { key: 'quizzesTaken', label: 'quizzes_taken', Icon: BrainIcon, border: 'border-accent-500', text: 'text-accent-500' },
  { key: 'quizWins', label: 'quizzes_won', Icon: TrophyIcon, border: 'border-amber-500', text: 'text-amber-500' },
  { key: 'likesReceived', label: 'likes_received', Icon: HeartIcon, border: 'border-rose-500', text: 'text-rose-500' },
  { key: 'booksRead', label: 'books_read', Icon: BookIcon, border: 'border-teal-500', text: 'text-teal-500' },
] as const;

export function ProfileStats({ stats }: { stats: UserStats | null }) {
  const t = useTranslations('PROFILE');
  return (
    <>
      <dl className="bento-grid-3">
        {TILES.map(({ key, label, Icon, border, text }) => (
          <div key={key} className={`parchment-card-raised border-t-4 p-5 text-center ${border}`}>
            <div className={`flex justify-center mb-2 ${text}`} aria-hidden="true">
              <Icon size={28} />
            </div>
            <dt className="text-xs uppercase tracking-widest text-[var(--color-ink-muted)] mt-1">{t(label)}</dt>
            <dd className="heading-display text-4xl font-bold text-[var(--color-ink)]">{stats?.[key] ?? 0}</dd>
          </div>
        ))}
      </dl>
      {!stats && <p className="text-center text-sm text-gray-400 dark:text-gray-500 mt-4">{t('no_stats')}</p>}
    </>
  );
}
