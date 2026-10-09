import { NamespacesIntl } from '@/components/namespaces-intl';
import { RequireAuth } from '@/features/auth/require-auth';
import { LazyCreateEvent } from '@/features/organizer/lazy';
import { notFound } from 'next/navigation';
import { pageMetadata } from '@/lib/page-metadata';
import { isUuid } from '@/lib/uuid';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  return pageMetadata('TITLES.events', `/clubs/${(await params).id.toLowerCase()}/events/create`, { index: false });
}

export default async function CreateEventPage({ params }: Props) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  return (
    <NamespacesIntl namespaces={['CREATE_EVENT', 'CREATE_CLUB', 'EVENT', 'CLUB_MANAGE', 'COVER_UPLOAD', 'BOOK_AUTOCOMPLETE', 'FORM_ERRORS', 'CLUB_DETAIL', 'ERRORS']}>
      <RequireAuth>
        <LazyCreateEvent clubId={id.toLowerCase()} />
      </RequireAuth>
    </NamespacesIntl>
  );
}
