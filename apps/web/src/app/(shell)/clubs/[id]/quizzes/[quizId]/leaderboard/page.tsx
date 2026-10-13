import { NamespacesIntl } from '@/components/namespaces-intl';
import { RequireAuth } from '@/features/auth/require-auth';
import { QuizLeaderboard } from '@/features/quiz/quiz-leaderboard';
import { notFound } from 'next/navigation';
import { pageMetadata } from '@/lib/page-metadata';
import { isUuid } from '@/lib/uuid';

type Props = { params: Promise<{ id: string; quizId: string }> };

export async function generateMetadata({ params }: Props) {
  const { id, quizId } = await params;
  return pageMetadata('SEO.clubs_title', `/clubs/${id.toLowerCase()}/quizzes/${quizId.toLowerCase()}/leaderboard`, { index: false });
}

export default async function QuizLeaderboardPage({ params }: Props) {
  const { id, quizId } = await params;
  if (!isUuid(id) || !isUuid(quizId)) notFound();
  return (
    <NamespacesIntl namespaces={['QUIZ', 'CLUB_DETAIL', 'ERRORS']}>
      <RequireAuth>
        <QuizLeaderboard clubId={id.toLowerCase()} quizId={quizId.toLowerCase()} />
      </RequireAuth>
    </NamespacesIntl>
  );
}
