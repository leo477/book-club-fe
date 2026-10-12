'use client';
'use no memo';

import type { Quiz, QuizQuestion, QuizStatus } from '@book-club/contracts';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { AppLink } from '@/components/app-link';
import { ErrorPanel } from '@/components/error-panel';
import { Badge } from '@/components/ui/badge';
import { Busy, Notice } from '@/features/club-manage/organizer-gate';
import { statusOf, useQuizDetail } from './use-quiz';

export const optionLabel = (index: number): string => String.fromCodePoint(65 + index);

export function BackLink({ href, children }: { href: string; children: ReactNode }) {
  const t = useTranslations('QUIZ');
  return (
    <nav aria-label={t('breadcrumb_aria')}>
      <AppLink href={href} className="text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors">
        {children}
      </AppLink>
    </nav>
  );
}

const BADGE: Record<QuizStatus, { variant: 'success' | 'warning' | 'secondary' | 'outline'; key: string }> = {
  live: { variant: 'success', key: 'status_live' },
  active: { variant: 'warning', key: 'status_active' },
  closed: { variant: 'outline', key: 'status_closed' },
  draft: { variant: 'secondary', key: 'status_draft' },
};

export function StatusBadge({ status }: { status: QuizStatus }) {
  const t = useTranslations('QUIZ');
  const { variant, key } = BADGE[status];
  return <Badge variant={variant}>{t(key)}</Badge>;
}

/** quiz-detail-base: loads the quiz and its questions and refuses a quiz that belongs to another club than the URL names. */
export function QuizDetail({ clubId, quizId, withQuestions = true, children }: { clubId: string; quizId: string; withQuestions?: boolean; children: (quiz: Quiz, questions: readonly QuizQuestion[]) => ReactNode }) {
  const t = useTranslations('QUIZ');
  const detail = useQuizDetail(quizId, withQuestions);
  const back = { href: `/clubs/${clubId}/quizzes`, label: t('error_return') };

  if (detail.isError) {
    const status = statusOf(detail.error);
    if (status === 404 || status === 422) return <Notice title={t('error_not_found')} back={back} />;
    return <ErrorPanel onRetry={detail.retry} />;
  }
  if (!detail.quiz || detail.isPending) return <Busy />;
  if (detail.quiz.clubId.toLowerCase() !== clubId) return <Notice title={t('error_not_found')} back={back} />;
  return children(detail.quiz, detail.questions);
}
