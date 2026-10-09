import { NamespacesIntl } from '@/components/namespaces-intl';
import { RequireRole } from '@/features/auth/require-auth';
import { LazyEditClub } from '@/features/organizer/lazy';
import { pageMetadata } from '@/lib/page-metadata';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  return pageMetadata('SEO.clubs_title', `/clubs/${(await params).id.toLowerCase()}/edit`, { index: false });
}

export default async function EditClubPage({ params }: Props) {
  const { id } = await params;
  return (
    <NamespacesIntl namespaces={['EDIT_CLUB', 'CREATE_CLUB', 'CLUB_MANAGE', 'COVER_UPLOAD', 'ERRORS']}>
      <RequireRole role="organizer">
        <LazyEditClub id={id.toLowerCase()} />
      </RequireRole>
    </NamespacesIntl>
  );
}
