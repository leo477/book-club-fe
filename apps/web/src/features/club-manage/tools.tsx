'use client';

import { useTranslations } from 'next-intl';
import { AppLink } from '@/components/app-link';
import { ChatRoomForm } from './chat-room-form';
import { DeleteClub } from './delete-club';
import { StatusActions } from './status-actions';

const TILES = [
  { path: 'quizzes', icon: '📝', title: 'quizzes_title', desc: 'quizzes_desc' },
  { path: 'randomizer', icon: '🎲', title: 'randomizer_title', desc: 'randomizer_desc' },
  { path: 'events/create', icon: '📅', title: 'create_event_title', desc: 'create_event_desc' },
] as const;

export function Tools({ clubId }: { clubId: string }) {
  const t = useTranslations('CLUB_DETAIL');
  const tManage = useTranslations('CLUB_MANAGE');
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-sm font-semibold text-[var(--color-ink-muted)] uppercase tracking-wide mb-3">{tManage('tools_title')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {TILES.map((tile) => (
            <AppLink key={tile.path} href={`/clubs/${clubId}/${tile.path}`} className="flex items-center gap-3 parchment-card p-4 hover:scale-[1.01] transition-transform">
              <span className="text-2xl" aria-hidden="true">
                {tile.icon}
              </span>
              <div>
                <p className="font-semibold text-[var(--color-ink)]">{t(tile.title)}</p>
                <p className="text-xs text-[var(--color-ink-muted)]">{t(tile.desc)}</p>
              </div>
            </AppLink>
          ))}
        </div>
      </section>

      <ChatRoomForm clubId={clubId} />

      <section className="rounded-2xl border border-red-500/40 bg-red-50/40 dark:bg-red-900/10 p-4 space-y-4" aria-labelledby="danger-title">
        <h2 id="danger-title" className="text-sm font-semibold text-red-600 dark:text-red-400 uppercase tracking-wide">
          {tManage('danger_title')}
        </h2>
        <StatusActions clubId={clubId} />
        <DeleteClub clubId={clubId} />
      </section>
    </div>
  );
}
