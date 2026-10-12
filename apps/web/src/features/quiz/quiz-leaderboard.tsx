'use client';
'use no memo';

import { useTranslations } from 'next-intl';
import { ErrorPanel } from '@/components/error-panel';
import { Skeleton } from '@/components/ui/skeleton';
import { Standings } from './leaderboard';
import { BackLink, QuizDetail } from './quiz-ui';
import { LEADERBOARD_POLL_MS, useActiveSession, useLeaderboard } from './use-quiz';

export function QuizLeaderboard({ clubId, quizId }: { clubId: string; quizId: string }) {
  return (
    <QuizDetail clubId={clubId} quizId={quizId} withQuestions={false}>
      {() => <LeaderboardView clubId={clubId} quizId={quizId} />}
    </QuizDetail>
  );
}

function LeaderboardView({ clubId, quizId }: { clubId: string; quizId: string }) {
  const t = useTranslations('QUIZ');
  const session = useActiveSession(quizId);
  const leaderboard = useLeaderboard(quizId, session.data?.id, LEADERBOARD_POLL_MS);
  const entries = leaderboard.data ?? [];

  return (
    <div className="page-container page-max-w py-8 space-y-6">
      <header className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-fantasy text-3xl font-bold tracking-wide text-[var(--color-ink)]">
            <span aria-hidden="true">🏆 </span>
            {t('leaderboard_title')}
          </h1>
          <p className="text-sm text-[var(--color-ink-muted)] mt-1">{t('leaderboard_refresh_hint')}</p>
        </div>
        <BackLink href={`/clubs/${clubId}/quizzes`}>{t('back_to_quizzes')}</BackLink>
      </header>

      {session.isPending ? (
        <div aria-busy="true" className="space-y-4">
          <Skeleton className="h-48" />
          <Skeleton className="h-32" />
        </div>
      ) : session.isError ? (
        <ErrorPanel compact onRetry={() => void session.refetch()} />
      ) : !session.data ? (
        <div className="parchment-card p-12 text-center">
          <p className="text-4xl mb-3" aria-hidden="true">
            🎯
          </p>
          <h2 className="font-semibold text-lg text-[var(--color-ink)]">{t('no_active_session')}</h2>
          <p className="text-sm text-[var(--color-ink-muted)] mt-1">{t('no_active_session_hint')}</p>
        </div>
      ) : leaderboard.isError && !leaderboard.data ? (
        <ErrorPanel compact onRetry={() => void leaderboard.refetch()} />
      ) : entries.length === 0 && !leaderboard.isPending ? (
        <div className="parchment-card p-12 text-center">
          <p className="text-4xl mb-3" aria-hidden="true">
            ⏳
          </p>
          <p className="text-[var(--color-ink-muted)]">{t('leaderboard_empty')}</p>
        </div>
      ) : (
        <Standings entries={entries} />
      )}
    </div>
  );
}
