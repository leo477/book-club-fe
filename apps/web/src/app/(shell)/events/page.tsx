import { RequireAuth } from '@/features/auth/require-auth';
import { EventsFeed } from '@/features/events/events-feed';
import { EventsIntl } from '@/features/events/events-intl';
import { pageMetadata } from '@/lib/page-metadata';

export const generateMetadata = () => pageMetadata('TITLES.events', '/events', { index: false });

export default function EventsPage() {
  return (
    <EventsIntl>
      <RequireAuth>
        <EventsFeed />
      </RequireAuth>
    </EventsIntl>
  );
}
