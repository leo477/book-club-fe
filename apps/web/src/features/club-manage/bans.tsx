'use client';
'use no memo';

import { useQueryClient } from '@tanstack/react-query';
import type { BanRecord } from '@book-club/contracts';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { useClubMembers } from '@/features/club-detail/use-club-detail';
import { invalidateClub } from '@/features/organizer/use-organizer';
import { api } from '@/lib/api';
import { bansKey, useBans, useGuardedRunner } from './use-club-manage';

export function Bans({ clubId }: { clubId: string }) {
  const t = useTranslations('CLUB_MANAGE');
  const queryClient = useQueryClient();
  const bansQuery = useBans(clubId);
  const members = useClubMembers(clubId, true).data;
  const { run, busy } = useGuardedRunner();
  const bans = bansQuery.data ?? [];

  const nameOf = (ban: BanRecord) => members?.find((m) => m.userId === ban.userId)?.displayName ?? ban.userId;

  const unban = (ban: BanRecord) =>
    run(ban.userId, async () => {
      await queryClient.cancelQueries({ queryKey: bansKey(clubId) });
      const index = bans.findIndex((b) => b.userId === ban.userId);
      queryClient.setQueryData<BanRecord[]>(bansKey(clubId), (list) => list?.filter((b) => b.userId !== ban.userId));
      try {
        await api.members.unban(clubId, ban.userId);
      } catch (err) {
        queryClient.setQueryData<BanRecord[]>(bansKey(clubId), (list) => {
          if (!list || list.some((b) => b.userId === ban.userId)) return list;
          const restored = [...list];
          restored.splice(Math.min(index, restored.length), 0, ban);
          return restored;
        });
        throw err;
      } finally {
        void invalidateClub(queryClient, clubId);
      }
    });

  return (
    <section className="parchment-card px-6 py-5">
      <h2 className="text-sm font-semibold text-[var(--color-ink-muted)] uppercase tracking-wide mb-4">
        {t('bans_title')} ({bans.length})
      </h2>
      {bans.length === 0 ? (
        <p className="text-sm text-[var(--color-ink-muted)]">{t('no_bans')}</p>
      ) : (
        <ul className="divide-y divide-[var(--color-sepia)]">
          {bans.map((ban) => (
            <li key={ban.userId} className="flex items-center gap-3 py-3">
              <span className="text-lg" aria-hidden="true">
                🚫
              </span>
              <span className="flex-1 text-sm text-[var(--color-ink)]">{nameOf(ban)}</span>
              <Button type="button" variant="outline" size="sm" disabled={busy.has(ban.userId)} onClick={() => void unban(ban)}>
                {t('unban')}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
