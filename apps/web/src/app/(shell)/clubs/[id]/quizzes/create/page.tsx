import { NamespacesIntl } from '@/components/namespaces-intl';
import { RequireAuth } from '@/features/auth/require-auth';
import { LazyQuizCreate } from '@/features/quiz/lazy';
import { notFound } from 'next/navigation';
import { pageMetadata } from '@/lib/page-metadata';
import { isUuid } from '@/lib/uuid';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  return pageMetadata('SEO.clubs_title', `/clubs/${(await params).id.toLowerCase()}/quizzes/create`, { index: false });
}

export default async function QuizCreatePage({ params }: Props) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  return (
    <NamespacesIntl namespaces={['QUIZ', 'CLUB_DETAIL', 'FORM_ERRORS', 'ERRORS']}>
      <RequireAuth>
        <LazyQuizCreate clubId={id.toLowerCase()} />
      </RequireAuth>
    </NamespacesIntl>
  );
}
