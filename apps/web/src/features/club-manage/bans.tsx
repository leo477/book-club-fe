'use client';
'use no memo';

import { useQueryClient } from '@tanstack/react-query';
import type { BanRecord } from '@book-club/contracts';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { useClubMembers } from '@/features/club-detail/use-club-detail';
import { trackClubAction } from '@/features/club-shared/club-actions';
import { mayBeTruncated } from '@/features/club-shared/list-limit';
import { describeError } from '@/features/club-detail/describe-error';
import { api } from '@/lib/api';
import { useGuardedRunner } from '@/features/club-shared/guarded-runner';
import { bansKey, useBans } from './use-club-manage';

export function Bans({ clubId }: { clubId: string }) {
  const t = useTranslations('CLUB_MANAGE');
  const tErrors = useTranslations('ERRORS');
  const queryClient = useQueryClient();
  const bansQuery = useBans(clubId);
  const members = useClubMembers(clubId, true).data;
  const { run, busy } = useGuardedRunner();
  const bans = bansQuery.data ?? [];

  // the ban record carries no name, and a banned user has left the member list, so the row shows a short id
  const nameOf = (ban: BanRecord) => members?.find((m) => m.userId === ban.userId)?.displayName ?? `${t('banned_user')} ${ban.userId.slice(0, 8)}`;

  const unban = (ban: BanRecord) =>
    run(ban.userId, () =>
      trackClubAction(queryClient, clubId, async () => {
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
        }
      }),
    );

  return (
    <section className="parchment-card px-6 py-5">
      <h2 className="text-sm font-semibold text-[var(--color-ink-muted)] uppercase tracking-wide mb-4">
        {t('bans_title')} ({bans.length})
      </h2>
      {mayBeTruncated(bans.length) && (
        <p role="note" className="mb-3 text-xs text-amber-700 dark:text-amber-400">
          {t('list_truncated')}
        </p>
      )}
      {bansQuery.isError ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {describeError(bansQuery.error, tErrors)}
        </p>
      ) : bans.length === 0 ? (
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
