'use client';
'use no memo';

import { zodResolver } from '@hookform/resolvers/zod';
import { createClubForm, type CreateClubForm } from '@book-club/contracts';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { FormField } from '@/components/form-field';
import { Button } from '@/components/ui/button';
import { Field, FieldControl, FieldError, FieldLabel } from '@/components/ui/field';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { describeError } from '@/features/club-detail/describe-error';
import { useMyClubs } from '@/features/clubs/use-clubs';
import { useSession } from '@/features/clubs/use-session';
import { usePush } from '@/lib/use-push';
import { ErrorAlert, FormCard, VisibilitySwitch } from './club-form-parts';
import { CoverPreview } from './cover-preview';
import { useCreateClub } from './use-organizer';

const DEFAULTS: CreateClubForm = { name: '', description: '', isPublic: true, city: '', coverUrl: '', firstEventTitle: '', firstEventDate: '', firstEventCity: '' };

export function CreateClub() {
  const t = useTranslations('CREATE_CLUB');
  const tAll = useTranslations();
  const tErrors = useTranslations('ERRORS');
  const push = usePush();
  const { user } = useSession();
  const mine = useMyClubs(user !== null);
  const create = useCreateClub();
  const [showFirstEvent, setShowFirstEvent] = useState(false);
  const [created, setCreated] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<CreateClubForm>({ resolver: zodResolver(createClubForm), defaultValues: DEFAULTS, mode: 'onTouched' });
  const [isPublic, coverUrl] = useWatch({ control, name: ['isPublic', 'coverUrl'] });

  // one club per organizer: whoever already owns one is sent back to the list (not after creating it, which lands on the new club)
  const ownsClub = user !== null && !created && (mine.data?.some((c) => c.organizerId === user.id) ?? false);
  useEffect(() => {
    if (ownsClub) push('/clubs');
  }, [ownsClub, push]);

  const submit = async (values: CreateClubForm) => {
    if (create.isPending) return;
    const eventTitle = values.firstEventTitle.trim();
    const eventCity = values.firstEventCity.trim();
    const withEvent = showFirstEvent && eventTitle !== '' && values.firstEventDate !== '' && eventCity !== '';
    try {
      const club = await create.mutateAsync({
        club: { name: values.name, description: values.description, isPublic: values.isPublic, city: values.city, coverUrl: values.coverUrl || null },
        firstEvent: withEvent ? { title: eventTitle, date: new Date(values.firstEventDate).toISOString(), city: eventCity } : null,
      });
      setCreated(true);
      push(`/clubs/${club.id}`);
    } catch {
      // surfaced through create.error
    }
  };

  return (
    <FormCard subtitle={t('subtitle')} title={t('title')}>
      <form onSubmit={handleSubmit(submit)} className="space-y-5" noValidate>
        <FormField
          id="club-name"
          type="text"
          data-testid="club-name-input"
          label={
            <>
              {t('name_label')}
              <span className="text-red-500" aria-hidden="true">
                *
              </span>
            </>
          }
          placeholder={t('name_placeholder')}
          error={errors.name?.message}
          {...register('name')}
        />

        <Field invalid={!!errors.description}>
          <FieldLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('description_label')}</FieldLabel>
          <FieldControl>
            <Textarea rows={3} className="resize-none" placeholder={t('description_placeholder')} {...register('description')} />
          </FieldControl>
          <FieldError className="text-xs">{errors.description?.message ? tAll(errors.description.message) : null}</FieldError>
        </Field>

        <div>
          <CoverPreview src={coverUrl} />
          <FormField id="club-cover-url" type="url" label={t('cover_url_label')} placeholder={t('cover_url_placeholder')} error={errors.coverUrl?.message} {...register('coverUrl')} />
          {errors.coverUrl ? null : <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{t('cover_url_hint')}</p>}
        </div>

        <VisibilitySwitch
          legend={t('visibility_legend')}
          label={t('public_label')}
          description={t('public_desc')}
          checked={isPublic}
          onChange={(next) => setValue('isPublic', next)}
        />

        <div className="space-y-3">
          <Button type="button" variant="ghost" onClick={() => setShowFirstEvent((v) => !v)}>
            {showFirstEvent ? t('remove_first_meeting') : t('add_first_meeting')}
          </Button>
          {showFirstEvent ? (
            <>
              <FormField id="event-title" type="text" label={t('first_meeting_title_label')} placeholder={t('first_meeting_title_placeholder')} {...register('firstEventTitle')} />
              <FormField id="event-date" type="datetime-local" label={t('first_meeting_date_label')} {...register('firstEventDate')} />
              <FormField id="event-city" type="text" label={t('first_meeting_city_label')} placeholder={t('first_meeting_city_placeholder')} {...register('firstEventCity')} />
            </>
          ) : null}
        </div>

        {create.isError ? <ErrorAlert>{describeError(create.error, tErrors)}</ErrorAlert> : null}

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" onClick={() => push('/clubs')} className="flex-1">
            {t('cancel')}
          </Button>
          <Button type="submit" disabled={create.isPending} data-testid="club-submit" className="flex-1 bg-primary-600 hover:bg-primary-700 text-white">
            {create.isPending ? (
              <>
                <Spinner className="mr-2" />
                {t('submitting')}
              </>
            ) : (
              t('submit')
            )}
          </Button>
        </div>
      </form>
    </FormCard>
  );
}
