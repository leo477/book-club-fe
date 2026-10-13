'use client';
'use no memo';

import type { Quiz } from '@book-club/contracts';
import { useTranslations } from 'next-intl';
import { AppLink } from '@/components/app-link';
import { ErrorPanel } from '@/components/error-panel';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useGuardedRunner } from '@/features/club-shared/guarded-runner';
import { BackLink, StatusBadge } from './quiz-ui';
import { useCanManage, useClubQuizzes, useToggleActive } from './use-quiz';

const takeable = (quiz: Quiz) => quiz.isActive || quiz.status === 'live' || quiz.status === 'active';

export function QuizList({ clubId }: { clubId: string }) {
  const t = useTranslations('QUIZ');
  const query = useClubQuizzes(clubId);
  const { canManage, pending: roleUnknown } = useCanManage(clubId);
  const toggle = useToggleActive(clubId);
  const { run, busy } = useGuardedRunner();
  const base = `/clubs/${clubId}/quizzes`;
  const quizzes = query.data ?? [];

  return (
    <div className="page-container page-max-w py-8 space-y-6">
      <header className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-fantasy text-3xl font-bold tracking-wide text-[var(--color-ink)]">
            <span aria-hidden="true">🧠 </span>
            {t('title')}
          </h1>
          <p className="text-sm text-[var(--color-ink-muted)] mt-1">{t('list_subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          {canManage ? (
            <Button asChild className="bg-primary-600 hover:bg-primary-700 text-white">
              <AppLink href={`${base}/create`}>{t('create_btn')}</AppLink>
            </Button>
          ) : null}
          <BackLink href={`/clubs/${clubId}`}>{t('back_to_club_short')}</BackLink>
        </div>
      </header>

      {query.isPending ? (
        <div aria-busy="true" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <Skeleton key={n} aria-hidden="true" className="h-28" />
          ))}
        </div>
      ) : query.isError ? (
        <ErrorPanel compact onRetry={() => void query.refetch()} />
      ) : quizzes.length === 0 ? (
        <div className="parchment-card p-12 text-center">
          <p className="text-4xl mb-3" aria-hidden="true">
            📝
          </p>
          <h2 className="font-semibold text-lg text-[var(--color-ink)]">{t('no_quizzes')}</h2>
          <p className="text-sm text-[var(--color-ink-muted)] mt-1">{canManage ? t('no_quizzes_organizer') : t('no_quizzes_member')}</p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz) => (
            <li key={quiz.id} className="parchment-card p-5 flex flex-col gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h2 className="font-semibold text-[var(--color-ink)] break-words min-w-0">{quiz.title}</h2>
                  <StatusBadge status={quiz.status} />
                </div>
                {quiz.description ? <p className="text-xs text-[var(--color-ink-muted)] line-clamp-2">{quiz.description}</p> : null}
              </div>

              <div className="flex items-center gap-2 mt-auto flex-wrap">
                {roleUnknown ? null : canManage ? (
                  <>
                    <Button asChild size="sm" variant="outline">
                      <AppLink href={`${base}/${quiz.id}/preview`}>{t('preview')}</AppLink>
                    </Button>
                    {quiz.status === 'draft' ? (
                      <Button asChild size="sm" variant="ghost">
                        <AppLink href={`${base}/${quiz.id}/edit`}>{t('edit')}</AppLink>
                      </Button>
                    ) : null}
                    {quiz.status !== 'draft' && quiz.status !== 'closed' ? (
                      <Button asChild size="sm" className="bg-primary-600 hover:bg-primary-700 text-white">
                        <AppLink href={`${base}/${quiz.id}/session`}>{t('manage_session')}</AppLink>
                      </Button>
                    ) : null}
                    {quiz.status === 'draft' || quiz.status === 'active' ? (
                      <Button
                        type="button"
                        size="sm"
                        variant={quiz.isActive ? 'secondary' : 'outline'}
                        disabled={busy.has(quiz.id)}
                        onClick={() => void run(quiz.id, () => toggle.mutateAsync({ quizId: quiz.id, isActive: !quiz.isActive }).then(() => undefined))}
                      >
                        {quiz.isActive ? t('deactivate') : t('activate')}
                      </Button>
                    ) : null}
                  </>
                ) : takeable(quiz) ? (
                  <Button asChild size="sm" className="bg-primary-600 hover:bg-primary-700 text-white">
                    <AppLink href={`${base}/${quiz.id}`}>{t('take_btn')}</AppLink>
                  </Button>
                ) : null}
                {quiz.status === 'live' ? (
                  <Button asChild size="sm" variant="outline">
                    <AppLink href={`${base}/${quiz.id}/leaderboard`}>{t('leaderboard')}</AppLink>
                  </Button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
