import { NamespacesIntl } from '@/components/namespaces-intl';
import { RequireRole } from '@/features/auth/require-auth';
import { LazyClubManage } from '@/features/club-manage/lazy';
import { notFound } from 'next/navigation';
import { pageMetadata } from '@/lib/page-metadata';
import { isUuid } from '@/lib/uuid';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  return pageMetadata('SEO.clubs_title', `/clubs/${(await params).id.toLowerCase()}/manage`, { index: false });
}

export default async function ClubManagePage({ params }: Props) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  return (
    <NamespacesIntl namespaces={['CLUB_MANAGE', 'CLUBS', 'CLUB_DETAIL', 'MEMBERS', 'ORGANIZER', 'CHAT', 'EDIT_CLUB', 'CREATE_CLUB', 'COVER_UPLOAD', 'ERRORS']}>
      <RequireRole role="organizer">
        <LazyClubManage id={id.toLowerCase()} />
      </RequireRole>
    </NamespacesIntl>
  );
}
