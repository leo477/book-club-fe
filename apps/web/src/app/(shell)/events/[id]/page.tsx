import { RequireAuth } from '@/features/auth/require-auth';
import { EventDetail } from '@/features/events/event-detail';
import { EventsIntl } from '@/features/events/events-intl';
import { pageMetadata } from '@/lib/page-metadata';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  return pageMetadata('TITLES.events', `/events/${(await params).id.toLowerCase()}`, { index: false });
}

export default async function EventDetailPage({ params }: Props) {
  const { id } = await params;
  return (
    <EventsIntl>
      <RequireAuth>
        <EventDetail id={id} />
      </RequireAuth>
    </EventsIntl>
  );
}
