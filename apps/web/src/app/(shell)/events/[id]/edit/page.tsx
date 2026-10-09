import { NamespacesIntl } from '@/components/namespaces-intl';
import { RequireRole } from '@/features/auth/require-auth';
import { LazyEditEvent } from '@/features/organizer/lazy';
import { pageMetadata } from '@/lib/page-metadata';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  return pageMetadata('TITLES.events', `/events/${(await params).id.toLowerCase()}/edit`, { index: false });
}

export default async function EditEventPage({ params }: Props) {
  const { id } = await params;
  return (
    <NamespacesIntl namespaces={['CREATE_EVENT', 'EVENTS', 'EVENT', 'CLUB_MANAGE', 'COVER_UPLOAD', 'BOOK_AUTOCOMPLETE', 'FORM_ERRORS', 'ERRORS']}>
      <RequireRole role="organizer">
        <LazyEditEvent id={id.toLowerCase()} />
      </RequireRole>
    </NamespacesIntl>
  );
}
