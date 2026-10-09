'use client';
'use no memo';

import type { ClubEvent, EventForm } from '@book-club/contracts';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { ErrorPanel } from '@/components/error-panel';
import { Pending } from '@/features/auth/require-auth';
import { useSession } from '@/features/clubs/use-session';
import { useEvent } from '@/features/events/use-events';
import { usePush } from '@/lib/use-push';
import { EventFormView } from './event-form';
import { toDatetimeLocal, toUpdateRequest } from './event-payload';
import { useUpdateEvent } from './use-organizer';

const valuesOf = (event: ClubEvent): EventForm => ({
  title: event.title,
  description: event.description ?? '',
  date: toDatetimeLocal(event.date),
  city: event.city,
  address: event.address ?? '',
  lat: event.lat,
  lng: event.lng,
  theme: event.theme ?? '',
  tagsRaw: event.tags.join(', '),
  durationMinutes: event.durationMinutes === null ? '' : String(event.durationMinutes),
  afterVenueName: event.afterMeetingVenue?.name ?? '',
  afterVenueAddress: event.afterMeetingVenue?.address ?? '',
  afterVenueLat: event.afterMeetingVenue?.lat ?? null,
  afterVenueLng: event.afterMeetingVenue?.lng ?? null,
  afterVenueDescription: event.afterMeetingVenue?.description ?? '',
  coverUrl: event.coverUrl ?? '',
  bookTitle: event.bookTitle ?? '',
  googleBookId: event.googleBookId ?? null,
  hasWinner: event.hasWinner,
});

export function EditEvent({ id }: { id: string }) {
  const query = useEvent(id);
  const { user } = useSession();
  const event = query.data;
  // only the event's organizer edits it; anyone else is sent to the feed (admins included, as in Angular)
  const foreign = event !== undefined && user !== null && event.organizerId !== user.id;
  const push = usePush();

  useEffect(() => {
    if (foreign) push('/events');
  }, [foreign, push]);

  if (query.isError) return <ErrorPanel onRetry={() => void query.refetch()} />;
  if (!event || foreign) return <Pending />;
  return <EditEventForm key={event.id} event={event} />;
}

function EditEventForm({ event }: { event: ClubEvent }) {
  const t = useTranslations('CREATE_EVENT');
  const tEvents = useTranslations('EVENTS');
  const push = usePush();
  const update = useUpdateEvent(event.id);

  return (
    <EventFormView
      defaultValues={valuesOf(event)}
      heading={tEvents('editEvent')}
      backHref={`/events/${event.id}`}
      backLabel={tEvents('back_to_events')}
      submitLabel={tEvents('saveChanges')}
      showHasWinner
      pending={update.isPending}
      error={update.isError ? t('save_error') : null}
      onSubmit={async (values) => {
        try {
          await update.mutateAsync(toUpdateRequest(values));
          push(`/events/${event.id}`);
          return true;
        } catch {
          // surfaced through update.isError
          return false;
        }
      }}
    />
  );
}
