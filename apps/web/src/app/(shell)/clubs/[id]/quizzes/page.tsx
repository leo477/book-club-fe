import { NamespacesIntl } from '@/components/namespaces-intl';
import { RequireAuth } from '@/features/auth/require-auth';
import { QuizList } from '@/features/quiz/quiz-list';
import { notFound } from 'next/navigation';
import { pageMetadata } from '@/lib/page-metadata';
import { isUuid } from '@/lib/uuid';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  return pageMetadata('SEO.clubs_title', `/clubs/${(await params).id.toLowerCase()}/quizzes`, { index: false });
}

export default async function QuizListPage({ params }: Props) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  return (
    <NamespacesIntl namespaces={['QUIZ', 'CLUB_DETAIL', 'ERRORS']}>
      <RequireAuth>
        <QuizList clubId={id.toLowerCase()} />
      </RequireAuth>
    </NamespacesIntl>
  );
}
