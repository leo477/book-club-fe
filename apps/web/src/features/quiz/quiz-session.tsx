'use client';
'use no memo';

import type { QuizSession as Session } from '@book-club/contracts';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { ErrorPanel } from '@/components/error-panel';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { NativeSelect } from '@/components/ui/native-select';
import { Skeleton } from '@/components/ui/skeleton';
import { useGuardedRunner } from '@/features/club-shared/guarded-runner';
import { formatDate, formatDateTime } from '@/lib/format';
import { usePush } from '@/lib/use-push';
import { Standings } from './leaderboard';
import { BackLink, QuizDetail } from './quiz-ui';
import { SESSION_POLL_MS, useActiveSession, useClubEventsForSession, useEndSession, useLeaderboard, useStartSession } from './use-quiz';

export function QuizSession({ clubId, quizId }: { clubId: string; quizId: string }) {
  return (
    <QuizDetail clubId={clubId} quizId={quizId} withQuestions={false}>
      {() => <SessionView clubId={clubId} quizId={quizId} />}
    </QuizDetail>
  );
}

function SessionView({ clubId, quizId }: { clubId: string; quizId: string }) {
  const t = useTranslations('QUIZ');
  const session = useActiveSession(quizId);
  const list = `/clubs/${clubId}/quizzes`;

  return (
    <div className="page-container page-max-w py-8 space-y-6">
      <header className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="font-fantasy text-3xl font-bold tracking-wide text-[var(--color-ink)]">
          <span aria-hidden="true">🎮 </span>
          {t('session_title')}
        </h1>
        <BackLink href={list}>{t('back_to_quizzes')}</BackLink>
      </header>

      {session.isPending ? (
        <Skeleton aria-busy="true" className="h-32" />
      ) : session.isError ? (
        <ErrorPanel compact onRetry={() => void session.refetch()} />
      ) : session.data ? (
        <Running clubId={clubId} quizId={quizId} session={session.data} />
      ) : (
        <Starter clubId={clubId} quizId={quizId} />
      )}
    </div>
  );
}

function Starter({ clubId, quizId }: { clubId: string; quizId: string }) {
  const t = useTranslations('QUIZ');
  const locale = useLocale();
  const events = useClubEventsForSession(clubId);
  const start = useStartSession(quizId, clubId);
  const { run, busy } = useGuardedRunner();
  const [eventId, setEventId] = useState('');

  return (
    <form
      className="parchment-card p-6 space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        if (eventId) void run('start', () => start.mutateAsync(eventId).then(() => undefined));
      }}
    >
      <h2 className="font-semibold text-lg text-[var(--color-ink)]">{t('session_start_heading')}</h2>
      <p className="text-sm text-[var(--color-ink-muted)]">{t('session_start_hint')}</p>
      <div className="space-y-2">
        <label htmlFor="event-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('session_pick_event_label')}
        </label>
        <NativeSelect id="event-select" value={eventId} onChange={(e) => setEventId(e.target.value)}>
          <option value="" disabled>
            {t('session_pick_event_placeholder')}
          </option>
          {(events.data ?? []).map((event) => (
            <option key={event.id} value={event.id}>
              {t('session_event_option', { title: event.title, date: formatDate(event.date, locale) })}
            </option>
          ))}
        </NativeSelect>
        {events.isSuccess && events.data.length === 0 ? <p className="text-xs text-yellow-700 dark:text-yellow-400">{t('session_no_events')}</p> : null}
        {events.isError ? <p role="alert" className="text-xs text-red-600 dark:text-red-400">{t('session_no_events')}</p> : null}
      </div>
      <Button type="submit" disabled={!eventId || busy.has('start')} className="bg-primary-600 hover:bg-primary-700 text-white">
        {busy.has('start') ? t('session_starting') : t('session_start')}
      </Button>
    </form>
  );
}

function Running({ clubId, quizId, session }: { clubId: string; quizId: string; session: Session }) {
  const t = useTranslations('QUIZ');
  const locale = useLocale();
  const push = usePush();
  const leaderboard = useLeaderboard(quizId, session.id, SESSION_POLL_MS);
  const end = useEndSession(quizId, clubId);
  const { run, busy } = useGuardedRunner();
  const entries = leaderboard.data ?? [];

  return (
    <div className="space-y-6">
      <div className="parchment-card p-5 flex items-center gap-4 flex-wrap">
        <Badge variant="success" className="text-sm px-3 py-1 h-auto">
          {t('session_live')}
        </Badge>
        <span className="text-sm text-[var(--color-ink-muted)]">
          {t('session_started_at')} {formatDateTime(session.startedAt, locale)}
        </span>
        <span className="text-sm font-medium text-[var(--color-ink)]">
          <span aria-hidden="true">👥 </span>
          {session.participantCount} {t('session_participants')}
        </span>
      </div>

      <section className="space-y-4" aria-labelledby="live-leaderboard">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 id="live-leaderboard" className="font-semibold text-lg text-[var(--color-ink)]">
              {t('session_live_leaderboard')}
            </h2>
            <p className="text-xs text-[var(--color-ink-muted)]">{t('session_refresh_hint')}</p>
          </div>
          <Button type="button" variant="outline" size="sm" disabled={leaderboard.isFetching} onClick={() => void leaderboard.refetch()}>
            {leaderboard.isFetching ? t('session_refreshing') : t('session_refresh')}
          </Button>
        </div>

        {leaderboard.isError && !leaderboard.data ? (
          <ErrorPanel compact onRetry={() => void leaderboard.refetch()} />
        ) : entries.length === 0 && !leaderboard.isPending ? (
          <div className="parchment-card p-8 text-center">
            <p className="text-2xl mb-2" aria-hidden="true">
              ⏳
            </p>
            <p className="text-sm text-[var(--color-ink-muted)]">{t('session_no_participants')}</p>
          </div>
        ) : (
          <Standings entries={entries} />
        )}
      </section>

      <div className="flex justify-end pt-2">
        <Button
          type="button"
          variant="destructive"
          disabled={busy.has('end')}
          onClick={() =>
            void run('end', async () => {
              await end.mutateAsync(session.id);
              push(`/clubs/${clubId}/quizzes`);
            })
          }
        >
          {busy.has('end') ? t('session_ending') : t('session_end')}
        </Button>
      </div>
    </div>
  );
}
