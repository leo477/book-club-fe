import { NamespacesIntl } from '@/components/namespaces-intl';
import { RequireAuth } from '@/features/auth/require-auth';
import { LazyQuizSession } from '@/features/quiz/lazy';
import { notFound } from 'next/navigation';
import { notFoundMetadata } from '@/components/not-found-view';
import { pageMetadata } from '@/lib/page-metadata';
import { isUuid } from '@/lib/uuid';

type Props = { params: Promise<{ id: string; quizId: string }> };

export async function generateMetadata({ params }: Props) {
  const { id, quizId } = await params;
  if (!isUuid(id) || !isUuid(quizId)) return notFoundMetadata();
  return pageMetadata('SEO.clubs_title', `/clubs/${id.toLowerCase()}/quizzes/${quizId.toLowerCase()}/session`, { index: false });
}

export default async function QuizSessionPage({ params }: Props) {
  const { id, quizId } = await params;
  if (!isUuid(id) || !isUuid(quizId)) notFound();
  return (
    <NamespacesIntl namespaces={['QUIZ', 'CLUB_DETAIL', 'ERRORS']}>
      <RequireAuth>
        <LazyQuizSession clubId={id.toLowerCase()} quizId={quizId.toLowerCase()} />
      </RequireAuth>
    </NamespacesIntl>
  );
}
