'use client';
'use no memo';

import { useTranslations } from 'next-intl';
import { usePush } from '@/lib/use-push';
import { EMPTY_EVENT, EventFormView } from './event-form';
import { toCreateRequest } from './event-payload';
import { useCreateEvent } from './use-organizer';

export function CreateEvent({ clubId }: { clubId: string }) {
  const t = useTranslations('CREATE_EVENT');
  const push = usePush();
  const create = useCreateEvent(clubId);

  return (
    <EventFormView
      defaultValues={EMPTY_EVENT}
      heading={t('heading')}
      backHref={`/clubs/${clubId}`}
      backLabel={t('back_to_club')}
      submitLabel={t('submit')}
      pending={create.isPending}
      error={create.isError ? t('save_error') : null}
      onSubmit={async (values) => {
        try {
          const created = await create.mutateAsync(toCreateRequest(values));
          push(`/events/${created.id}`);
          return true;
        } catch {
          // surfaced through create.isError
          return false;
        }
      }}
    />
  );
}
