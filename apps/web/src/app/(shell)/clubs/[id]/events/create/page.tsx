import { NamespacesIntl } from '@/components/namespaces-intl';
import { RequireRole } from '@/features/auth/require-auth';
import { LazyCreateEvent } from '@/features/organizer/lazy';
import { pageMetadata } from '@/lib/page-metadata';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  return pageMetadata('TITLES.events', `/clubs/${(await params).id.toLowerCase()}/events/create`, { index: false });
}

export default async function CreateEventPage({ params }: Props) {
  const { id } = await params;
  return (
    <NamespacesIntl namespaces={['CREATE_EVENT', 'EVENT', 'CLUB_MANAGE', 'COVER_UPLOAD', 'BOOK_AUTOCOMPLETE', 'FORM_ERRORS', 'ERRORS']}>
      <RequireRole role="organizer">
        <LazyCreateEvent clubId={id.toLowerCase()} />
      </RequireRole>
    </NamespacesIntl>
  );
}
