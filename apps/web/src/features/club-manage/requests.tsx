'use client';
'use no memo';

import type { JoinRequest } from '@book-club/contracts';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { trackClubAction } from '@/features/club-shared/club-actions';
import { mayBeTruncated } from '@/features/club-shared/list-limit';
import { describeError } from '@/features/club-detail/describe-error';
import { api } from '@/lib/api';
import { safeImageUrl } from '@/lib/safe-image-url';
import { useGuardedRunner } from '@/features/club-shared/guarded-runner';
import { requestsKey, useJoinRequests } from './use-club-manage';

export function Requests({ clubId }: { clubId: string }) {
  const t = useTranslations('CLUBS');
  const tManage = useTranslations('CLUB_MANAGE');
  const tErrors = useTranslations('ERRORS');
  const queryClient = useQueryClient();
  const query = useJoinRequests(clubId);
  const { run, busy } = useGuardedRunner();

  const resolve = (userId: string, call: () => Promise<unknown>) =>
    run(userId, () =>
      trackClubAction(queryClient, clubId, async () => {
        await call();
        // an older in-flight list fetch must not land after the removal and bring the resolved request back
        await queryClient.cancelQueries({ queryKey: requestsKey(clubId) });
        queryClient.setQueryData<JoinRequest[]>(requestsKey(clubId), (list) => list?.filter((r) => r.userId !== userId));
      }),
    );

  const requests = query.data ?? [];
  return (
    <section className="parchment-card px-6 py-5">
      <h2 className="text-sm font-semibold text-[var(--color-ink-muted)] uppercase tracking-wide mb-4">{t('join_requests_title')}</h2>
      {mayBeTruncated(requests.length) && (
        <p role="note" className="mb-3 text-xs text-amber-700 dark:text-amber-400">
          {tManage('list_truncated')}
        </p>
      )}
      {query.isPending ? (
        <div className="flex justify-center py-6" aria-busy="true">
          <Spinner />
        </div>
      ) : query.isError ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400 text-center py-6">
          {describeError(query.error, tErrors)}
        </p>
      ) : requests.length === 0 ? (
        <p className="text-sm text-[var(--color-ink-muted)] text-center py-6">{t('no_join_requests')}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {requests.map((req) => {
            const avatar = req.avatarUrl ? safeImageUrl(req.avatarUrl) : '';
            return (
              <li key={req.userId} className="flex items-center gap-3 rounded-xl border border-[var(--color-sepia)] bg-[var(--color-surface)] p-3">
                {avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element -- avatar hosts are arbitrary; only http(s) URLs are rendered
                  <img src={avatar} width={40} height={40} alt="" referrerPolicy="no-referrer" className="h-10 w-10 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-gradient-fantasy flex items-center justify-center text-white font-semibold flex-shrink-0" aria-hidden="true">
                    {req.displayName.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[var(--color-ink)] truncate">{req.displayName}</p>
                  <span className="inline-block mt-0.5 rounded-full bg-[var(--color-surface-raised)] px-2 py-0.5 text-xs text-[var(--color-ink-muted)] border border-[var(--color-sepia)]">{req.source}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button type="button" size="sm" className="bg-gradient-fantasy text-white" disabled={busy.has(req.userId)} onClick={() => void resolve(req.userId, () => api.members.approveJoinRequest(clubId, req.userId))}>
                    {t('approve')}
                  </Button>
                  <Button type="button" variant="outline" size="sm" disabled={busy.has(req.userId)} onClick={() => void resolve(req.userId, () => api.members.rejectJoinRequest(clubId, req.userId))}>
                    {t('reject')}
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
