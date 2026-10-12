'use client';
'use no memo';

import type { Quiz, QuizQuestion } from '@book-club/contracts';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { AppLink } from '@/components/app-link';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useGuardedRunner } from '@/features/club-shared/guarded-runner';
import { usePush } from '@/lib/use-push';
import { cn } from '@/lib/utils';
import { BackLink, QuizDetail, optionLabel } from './quiz-ui';
import { useToggleActive } from './use-quiz';

export function QuizPreview({ clubId, quizId }: { clubId: string; quizId: string }) {
  return <QuizDetail clubId={clubId} quizId={quizId}>{(quiz, questions) => <PreviewView clubId={clubId} quiz={quiz} questions={questions} />}</QuizDetail>;
}

function PreviewView({ clubId, quiz, questions }: { clubId: string; quiz: Quiz; questions: readonly QuizQuestion[] }) {
  const t = useTranslations('QUIZ');
  const push = usePush();
  const toggle = useToggleActive(clubId);
  const { run, busy } = useGuardedRunner();
  const [index, setIndex] = useState(0);
  const list = `/clubs/${clubId}/quizzes`;
  const current = questions[index];
  const last = index === questions.length - 1;
  const percent = questions.length === 0 ? 0 : Math.round(((index + 1) / questions.length) * 100);
  const position = t('question_of', { current: index + 1, total: questions.length });

  const activate = () =>
    run('activate', async () => {
      await toggle.mutateAsync({ quizId: quiz.id, isActive: true });
      push(list);
    });

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <header className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-fantasy text-2xl font-bold tracking-wide text-[var(--color-ink)]">{t('preview_heading')}</h1>
          <p className="text-sm text-[var(--color-ink-muted)] mt-0.5 break-words">{quiz.title}</p>
        </div>
        <BackLink href={list}>{t('close')}</BackLink>
      </header>

      {quiz.status === 'live' ? (
        <p role="status" className="rounded-xl border border-green-200 bg-green-50 dark:bg-green-900/20 px-4 py-3 text-sm text-green-800 dark:text-green-300">
          {t('preview_live_banner')}
        </p>
      ) : null}
      <p className="rounded-xl border border-blue-200 bg-blue-50 dark:bg-blue-900/20 px-4 py-3 text-sm text-blue-800 dark:text-blue-300">{t('preview_banner')}</p>

      {!current ? (
        <div className="parchment-card p-12 text-center">
          <p className="text-4xl mb-3" aria-hidden="true">
            📝
          </p>
          <p className="text-[var(--color-ink-muted)]">{t('preview_no_questions')}</p>
          <AppLink href={`${list}/${quiz.id}/edit`} className="inline-block mt-4 text-sm text-primary-600 dark:text-primary-400 hover:underline">
            {t('preview_no_questions_link')}
          </AppLink>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <p className="text-sm text-[var(--color-ink-muted)] text-center" aria-live="polite">
              {position}
            </p>
            <div role="progressbar" aria-label={position} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-primary-500 rounded-full transition-all duration-300" style={{ width: `${percent}%` }} />
            </div>
          </div>

          <div className="parchment-card p-6 space-y-5">
            <h2 className="font-semibold text-lg leading-relaxed text-[var(--color-ink)] break-words">{current.question}</h2>
            <ul className="space-y-2">
              {current.options.map((option, i) => {
                const isCorrect = i === current.correctIndex;
                return (
                  <li
                    key={i}
                    className={cn(
                      'px-4 py-3 rounded-xl border-2 text-sm font-medium flex items-center gap-3',
                      isCorrect ? 'bg-green-50 dark:bg-green-900/20 border-green-500 text-green-900 dark:text-green-300' : 'bg-gray-50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700 text-[var(--color-ink-muted)]',
                    )}
                  >
                    <span aria-hidden="true" className={cn('size-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0', isCorrect ? 'bg-green-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300')}>
                      {optionLabel(i)}
                    </span>
                    <span className="flex-1 break-words">{option}</span>
                    {isCorrect ? <span className="text-green-700 dark:text-green-400 text-xs font-semibold shrink-0">{t('preview_correct_answer')}</span> : null}
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="flex justify-between items-center">
            <Button type="button" variant="outline" disabled={index === 0} onClick={() => setIndex(index - 1)}>
              {t('prev')}
            </Button>
            {last ? (
              quiz.status === 'draft' ? (
                <Button type="button" disabled={busy.has('activate')} onClick={() => void activate()} className="bg-primary-600 hover:bg-primary-700 text-white font-bold">
                  {busy.has('activate') ? <Spinner className="mr-2" /> : null}
                  {busy.has('activate') ? t('preview_activating') : t('preview_activate')}
                </Button>
              ) : null
            ) : (
              <Button type="button" onClick={() => setIndex(index + 1)}>
                {t('next')}
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
