'use client';
'use no memo';

import { zodResolver } from '@hookform/resolvers/zod';
import { editClubForm, isClubStub, splitTags, type Club, type EditClubForm } from '@book-club/contracts';
import { useTranslations } from 'next-intl';
import { useForm, useWatch } from 'react-hook-form';
import { CoverUpload } from '@/components/cover-upload';
import { FormField } from '@/components/form-field';
import { Button } from '@/components/ui/button';
import { Field, FieldControl, FieldError, FieldLabel } from '@/components/ui/field';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { describeError } from '@/features/club-detail/describe-error';
import { showToast } from '@/lib/toast';
import { usePush } from '@/lib/use-push';
import { ErrorAlert, FormCard, VisibilitySwitch } from './club-form-parts';
import { useClubForEdit, useUpdateClub } from './use-organizer';

const valuesOf = (club: Club): EditClubForm => ({
  name: club.name,
  description: club.description ?? '',
  isPublic: club.isPublic,
  city: club.city ?? '',
  coverUrl: club.coverUrl ?? '',
  tags: club.tags.join(', '),
  meetingDurationMinutes: club.meetingDurationMinutes == null ? '' : String(club.meetingDurationMinutes),
  venueName: club.afterMeetingVenue?.name ?? '',
  venueAddress: club.afterMeetingVenue?.address ?? '',
  venueDescription: club.afterMeetingVenue?.description ?? '',
});

export function EditClub({ id }: { id: string }) {
  const t = useTranslations('EDIT_CLUB');
  const query = useClubForEdit(id);
  const club = query.data && !isClubStub(query.data) ? query.data : null;

  return (
    <FormCard subtitle={t('subtitle')} title={t('title')}>
      {query.isPending ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : club ? (
        <EditClubFormView club={club} />
      ) : (
        <ErrorAlert>{t('not_found')}</ErrorAlert>
      )}
    </FormCard>
  );
}

function EditClubFormView({ club }: { club: Club }) {
  const t = useTranslations('EDIT_CLUB');
  const tAll = useTranslations();
  const tErrors = useTranslations('ERRORS');
  const push = usePush();
  const update = useUpdateClub(club.id);
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<EditClubForm>({ resolver: zodResolver(editClubForm), defaultValues: valuesOf(club), mode: 'onTouched' });
  const [isPublic, coverUrl] = useWatch({ control, name: ['isPublic', 'coverUrl'] });

  const submit = async (values: EditClubForm) => {
    if (update.isPending) return;
    const venueName = values.venueName.trim();
    const duration = values.meetingDurationMinutes.trim();
    try {
      await update.mutateAsync({
        name: values.name,
        description: values.description,
        isPublic: values.isPublic,
        city: values.city || undefined,
        coverUrl: values.coverUrl || null,
        tags: splitTags(values.tags),
        meetingDurationMinutes: duration === '' ? null : Number(duration),
        afterMeetingVenue: venueName ? { name: venueName, address: values.venueAddress.trim(), description: values.venueDescription.trim() } : null,
      });
      showToast('success', t('success'));
      push(`/clubs/${club.id}`);
    } catch {
      // surfaced through update.error
    }
  };

  return (
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

      <FormField id="club-city" type="text" label={t('city_label')} placeholder={t('city_placeholder')} {...register('city')} />

      <div>
        <FormField id="club-tags" type="text" label={tAll('CLUB_MANAGE.tags_label')} placeholder={tAll('CLUB_MANAGE.tags_placeholder')} {...register('tags')} />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{tAll('CLUB_MANAGE.tags_hint')}</p>
      </div>

      <FormField
        id="club-duration"
        type="number"
        min={1}
        max={480}
        label={tAll('CLUB_MANAGE.duration_label')}
        placeholder={tAll('CLUB_MANAGE.duration_placeholder')}
        error={errors.meetingDurationMinutes?.message}
        {...register('meetingDurationMinutes')}
      />

      <fieldset className="space-y-3 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <legend className="px-1 text-sm font-semibold text-gray-900 dark:text-white">{tAll('CLUB_MANAGE.venue_legend')}</legend>
        <FormField id="venue-name" type="text" label={tAll('CLUB_MANAGE.venue_name')} {...register('venueName')} />
        <FormField id="venue-address" type="text" label={tAll('CLUB_MANAGE.venue_address')} error={errors.venueAddress?.message} {...register('venueAddress')} />
        <Field>
          <FieldLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">{tAll('CLUB_MANAGE.venue_description')}</FieldLabel>
          <FieldControl>
            <Textarea rows={2} className="resize-none" {...register('venueDescription')} />
          </FieldControl>
        </Field>
      </fieldset>

      <div>
        <p className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('cover_url_label')}</p>
        <CoverUpload
          value={coverUrl}
          onChange={(url) => setValue('coverUrl', url, { shouldValidate: true })}
          invalid={!!errors.coverUrl}
          label={t('cover_url_label')}
          urlInputProps={errors.coverUrl ? { 'aria-describedby': 'club-cover-error' } : {}}
        />
        {errors.coverUrl?.message ? (
          <p id="club-cover-error" role="alert" className="mt-1 text-xs text-red-600 dark:text-red-400">
            {tAll(errors.coverUrl.message)}
          </p>
        ) : null}
      </div>

      <VisibilitySwitch legend={t('visibility_legend')} label={t('public_label')} description={t('public_desc')} checked={isPublic} onChange={(next) => setValue('isPublic', next)} />

      {update.isError ? <ErrorAlert>{describeError(update.error, tErrors)}</ErrorAlert> : null}

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={() => push(`/clubs/${club.id}`)} className="flex-1">
          {t('cancel')}
        </Button>
        <Button type="submit" disabled={update.isPending} data-testid="save-button" className="flex-1 bg-primary-600 hover:bg-primary-700 text-white">
          {update.isPending ? (
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
  );
}
