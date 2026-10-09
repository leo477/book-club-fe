import { NamespacesIntl } from '@/components/namespaces-intl';
import { RequireAuth } from '@/features/auth/require-auth';
import { LazyEditClub } from '@/features/organizer/lazy';
import { notFound } from 'next/navigation';
import { pageMetadata } from '@/lib/page-metadata';
import { isUuid } from '@/lib/uuid';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  return pageMetadata('SEO.clubs_title', `/clubs/${(await params).id.toLowerCase()}/edit`, { index: false });
}

export default async function EditClubPage({ params }: Props) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  return (
    <NamespacesIntl namespaces={['EDIT_CLUB', 'CREATE_CLUB', 'CLUB_MANAGE', 'COVER_UPLOAD', 'CLUB_DETAIL', 'ERRORS']}>
      <RequireAuth>
        <LazyEditClub id={id.toLowerCase()} />
      </RequireAuth>
    </NamespacesIntl>
  );
}
