'use client';
'use no memo';

import type { QuizAttempt, QuizQuestion } from '@book-club/contracts';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { AppLink } from '@/components/app-link';
import { Button } from '@/components/ui/button';
import { Notice } from '@/features/club-manage/organizer-gate';
import { useGuardedRunner } from '@/features/club-shared/guarded-runner';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { BackLink, QuizDetail, optionLabel } from './quiz-ui';

export function QuizTake({ clubId, quizId }: { clubId: string; quizId: string }) {
  const t = useTranslations('QUIZ');
  return (
    <QuizDetail clubId={clubId} quizId={quizId}>
      {(quiz, questions) =>
        questions.length === 0 ? (
          <Notice title={t('error_no_questions')} back={{ href: `/clubs/${clubId}/quizzes`, label: t('error_return') }} />
        ) : (
          <Taking clubId={clubId} quizId={quiz.id} title={quiz.title} questions={questions} />
        )
      }
    </QuizDetail>
  );
}

function Taking({ clubId, quizId, title, questions }: { clubId: string; quizId: string; title: string; questions: readonly QuizQuestion[] }) {
  const t = useTranslations('QUIZ');
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<readonly number[]>(() => questions.map(() => -1));
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const { run, busy } = useGuardedRunner();
  const list = `/clubs/${clubId}/quizzes`;
  const current = questions[index];
  const selected = answers[index] ?? -1;
  const last = index === questions.length - 1;
  const percent = Math.round(((index + 1) / questions.length) * 100);
  const position = t('question_of', { current: index + 1, total: questions.length });

  const choose = (option: number) => setAnswers((prev) => prev.map((a, i) => (i === index ? option : a)));

  if (attempt) return <Results clubId={clubId} title={title} attempt={attempt} questions={questions} />;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <BackLink href={list}>{t('back_to_quizzes')}</BackLink>
      <h1 className="font-fantasy text-2xl font-bold tracking-wide text-[var(--color-ink)] break-words">{title}</h1>

      <div>
        <div className="flex justify-between text-xs text-[var(--color-ink-muted)] mb-1.5">
          <span aria-live="polite">{position}</span>
          <span aria-hidden="true">{percent}%</span>
        </div>
        <div role="progressbar" aria-label={position} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} className="h-2 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
          <div className="h-full bg-primary-500 rounded-full transition-all duration-500" style={{ width: `${percent}%` }} />
        </div>
      </div>

      {current ? (
        <fieldset className="parchment-card p-6 min-w-0" disabled={busy.has('submit')}>
          <legend className="font-semibold text-lg leading-snug text-[var(--color-ink)] mb-6 break-words">{current.question}</legend>
          <div className="space-y-3">
            {current.options.map((option, i) => (
              <label
                key={`${index}-${i}`}
                className={cn(
                  'flex items-center gap-3 w-full rounded-xl px-5 py-4 text-sm font-medium border-2 cursor-pointer transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary-500',
                  selected === i ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-[var(--color-ink)]' : 'border-gray-200 dark:border-gray-700 hover:border-primary-400 text-[var(--color-ink)]',
                )}
              >
                <input type="radio" name={`question-${index}`} className="sr-only" checked={selected === i} onChange={() => choose(i)} />
                <span aria-hidden="true" className={cn('size-6 rounded-full border-2 shrink-0 flex items-center justify-center text-xs font-bold', selected === i ? 'border-primary-500 bg-primary-500 text-white' : 'border-gray-300 dark:border-gray-600 text-gray-500')}>
                  {optionLabel(i)}
                </span>
                <span className="break-words min-w-0">{option}</span>
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}

      <div className="flex justify-between items-center">
        <Button type="button" variant="outline" disabled={index === 0 || busy.has('submit')} onClick={() => setIndex(index - 1)}>
          {t('prev')}
        </Button>
        {last ? (
          <Button
            type="button"
            disabled={selected === -1 || busy.has('submit')}
            onClick={() => void run('submit', async () => setAttempt(await api.quiz.submitAttempt(quizId, [...answers])))}
            className="bg-primary-600 hover:bg-primary-700 text-white font-bold"
          >
            {busy.has('submit') ? t('submitting_quiz') : t('submit_quiz')}
          </Button>
        ) : (
          <Button type="button" disabled={selected === -1} onClick={() => setIndex(index + 1)} className="bg-primary-600 hover:bg-primary-700 text-white font-bold">
            {t('next')}
          </Button>
        )}
      </div>
    </div>
  );
}

function Results({ clubId, title, attempt, questions }: { clubId: string; title: string; attempt: QuizAttempt; questions: readonly QuizQuestion[] }) {
  const t = useTranslations('QUIZ');
  const percent = attempt.total === 0 ? 0 : Math.round((attempt.score / attempt.total) * 100);
  const message = percent === 100 ? t('result_perfect') : percent >= 80 ? t('result_great') : percent >= 60 ? t('result_good') : percent >= 40 ? t('result_keep_reading') : t('result_try_again');

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <h1 className="sr-only">{title}</h1>
      <div className="rounded-2xl bg-gradient-to-br from-primary-700 to-accent-700 p-8 text-center text-white shadow-xl" role="status">
        <p className="text-6xl font-fantasy font-bold">
          {attempt.score}/{attempt.total}
        </p>
        <p className="mt-2 text-lg">{message}</p>
        <p className="text-sm mt-1">{t('result_percent', { percent })}</p>
      </div>

      <section className="space-y-4" aria-labelledby="review-heading">
        <h2 id="review-heading" className="font-semibold text-lg text-[var(--color-ink)]">
          {t('result_review_title')}
        </h2>
        <ol className="space-y-4">
          {questions.map((q, i) => {
            const given = attempt.answers[i];
            const known = q.correctIndex !== null && q.correctIndex !== undefined;
            const right = known && given === q.correctIndex;
            return (
              <li key={q.id} className={cn('parchment-card p-5 border', known ? (right ? 'border-green-300' : 'border-red-300') : 'border-transparent')}>
                <p className="font-medium text-sm text-[var(--color-ink)] mb-4 break-words">
                  {known ? (
                    <>
                      <span aria-hidden="true">{right ? '✅ ' : '❌ '}</span>
                      <span className="sr-only">{right ? t('result_correct') : t('result_incorrect')}: </span>
                    </>
                  ) : null}
                  {q.question}
                </p>
                <ul className="space-y-2">
                  {q.options.map((option, o) => {
                    const isCorrect = known && o === q.correctIndex;
                    const isGiven = o === given;
                    return (
                      <li
                        key={o}
                        className={cn(
                          'rounded-lg px-3 py-2 text-sm flex items-center gap-2',
                          isCorrect ? 'bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-300 font-semibold' : isGiven ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' : 'text-[var(--color-ink-muted)]',
                        )}
                      >
                        <span className="font-bold">{optionLabel(o)}.</span>
                        <span className="break-words min-w-0">{option}</span>
                        {isCorrect ? <span className="ml-auto text-xs shrink-0">{t('result_correct')}</span> : null}
                        {!isCorrect && isGiven ? <span className="ml-auto text-xs shrink-0">{t('result_your_answer')}</span> : null}
                      </li>
                    );
                  })}
                </ul>
              </li>
            );
          })}
        </ol>
      </section>

      <div className="flex justify-center">
        <Button asChild className="bg-primary-600 hover:bg-primary-700 text-white px-8">
          <AppLink href={`/clubs/${clubId}/quizzes`}>{t('back_to_quizzes')}</AppLink>
        </Button>
      </div>
    </div>
  );
}
