'use client';
'use no memo';

import { zodResolver } from '@hookform/resolvers/zod';
import { eventForm, type EventForm } from '@book-club/contracts';
import { useTranslations } from 'next-intl';
import { useRef, useState, type ReactNode } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { AddressAutocomplete } from '@/components/address-autocomplete';
import { AppLink } from '@/components/app-link';
import { BookAutocomplete } from '@/components/book-autocomplete';
import { CoverUpload } from '@/components/cover-upload';
import { FormField } from '@/components/form-field';
import { Button } from '@/components/ui/button';
import { Field, FieldControl, FieldLabel } from '@/components/ui/field';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';

export const EMPTY_EVENT: EventForm = {
  title: '',
  description: '',
  date: '',
  city: '',
  address: '',
  lat: null,
  lng: null,
  theme: '',
  tagsRaw: '',
  durationMinutes: '',
  afterVenueName: '',
  afterVenueAddress: '',
  afterVenueLat: null,
  afterVenueLng: null,
  afterVenueDescription: '',
  coverUrl: '',
  bookTitle: '',
  googleBookId: null,
  hasWinner: false,
};

interface Props {
  defaultValues: EventForm;
  heading: string;
  backHref: string;
  backLabel: string;
  submitLabel: string;
  pending: boolean;
  error: string | null;
  /** Resolves true once saved, false on failure; a submit that arrives before then, or after a save, is dropped. */
  onSubmit: (values: EventForm) => Promise<boolean>;
  /** Only an existing event can be marked as having a winner: the create endpoint has no such field. */
  showHasWinner?: boolean;
  /** Debounce of the book search; tests shorten it. */
  bookDebounceMs?: number;
}

function Required({ children }: { children: ReactNode }) {
  return (
    <>
      {children}{' '}
      <span className="text-red-500" aria-hidden="true">
        *
      </span>
    </>
  );
}

const LABEL = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1';

/** The form create-event and edit-event share; the owner decides what a valid submit does. */
export function EventFormView({ defaultValues, heading, backHref, backLabel, submitLabel, pending, error, onSubmit, showHasWinner = false, bookDebounceMs }: Props) {
  const t = useTranslations('CREATE_EVENT');
  const tAll = useTranslations();
  const [showAfterVenue, setShowAfterVenue] = useState(defaultValues.afterVenueName !== '');
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<EventForm>({ resolver: zodResolver(eventForm), defaultValues, mode: 'onTouched' });
  const [address, bookTitle, coverUrl, afterVenueAddress] = useWatch({ control, name: ['address', 'bookTitle', 'coverUrl', 'afterVenueAddress'] });

  // a ref, not `pending`: a second submit can arrive before the render that disables the button
  const submitting = useRef(false);

  const submit = async (values: EventForm) => {
    if (submitting.current) return;
    submitting.current = true;
    // a saved event navigates away, so only a failed save may be submitted again
    if (!(await onSubmit(values))) submitting.current = false;
  };

  const toggleAfterVenue = () => {
    if (showAfterVenue) {
      setValue('afterVenueName', '');
      setValue('afterVenueAddress', '');
      setValue('afterVenueLat', null);
      setValue('afterVenueLng', null);
      setValue('afterVenueDescription', '');
    }
    setShowAfterVenue(!showAfterVenue);
  };

  return (
    <section className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <nav>
        <AppLink href={backHref} className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
          {backLabel}
        </AppLink>
      </nav>

      <div className="rounded-2xl bg-white dark:bg-gray-800 shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{heading}</h1>

        {error ? (
          <div role="alert" className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
            {error}
          </div>
        ) : null}

        <form onSubmit={(e) => void handleSubmit(submit)(e)} className="space-y-5" noValidate>
          <FormField
            id="title"
            type="text"
            data-testid="event-title-input"
            label={<Required>{t('title_label')}</Required>}
            placeholder={t('title_placeholder')}
            error={errors.title?.message}
            errorValues={{ requiredLength: 3 }}
            {...register('title')}
          />

          <div>
            <p id="book-title-label" className={LABEL}>
              {t('book_title_label')}
            </p>
            <BookAutocomplete
              value={bookTitle}
              onChange={(text) => setValue('bookTitle', text)}
              onSelected={(book) => {
                if (book.thumbnail) setValue('coverUrl', book.thumbnail);
                setValue('googleBookId', book.id);
              }}
              label={t('book_title_label')}
              placeholder={t('book_title_placeholder')}
              {...(bookDebounceMs === undefined ? {} : { debounceMs: bookDebounceMs })}
            />
          </div>

          <Field>
            <FieldLabel className={LABEL}>{t('description_label')}</FieldLabel>
            <FieldControl>
              <Textarea rows={3} className="resize-none" placeholder={t('description_placeholder')} {...register('description')} />
            </FieldControl>
          </Field>

          <FormField id="date" type="datetime-local" data-testid="date-input" label={<Required>{t('date_label')}</Required>} error={errors.date?.message} {...register('date')} />

          <div>
            <p className={LABEL}>
              <Required>{t('location_label')}</Required>
            </p>
            <AddressAutocomplete
              value={address}
              onChange={(text) => setValue('address', text)}
              onTyped={() => {
                setValue('city', '');
                setValue('lat', null);
                setValue('lng', null);
              }}
              onSelected={(s) => {
                setValue('city', s.city ?? s.label, { shouldValidate: true });
                setValue('address', s.label);
                setValue('lat', s.lat ?? null);
                setValue('lng', s.lng ?? null);
              }}
              label={t('location_label')}
              placeholder={t('address_placeholder')}
              invalid={!!errors.city}
              inputProps={{ 'data-testid': 'address-input', ...(errors.city ? { 'aria-describedby': 'event-location-error' } : {}) }}
            />
            {errors.city?.message ? (
              <p id="event-location-error" role="alert" className="mt-1 text-xs text-red-600 dark:text-red-400">
                {tAll(errors.city.message)}
              </p>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              id="duration"
              type="number"
              min={15}
              max={480}
              placeholder="120"
              label={t('duration_label')}
              error={errors.durationMinutes?.message}
              {...register('durationMinutes')}
            />
            <FormField id="theme" type="text" label={t('theme_label')} placeholder={t('theme_placeholder')} {...register('theme')} />
          </div>

          <FormField id="tags" type="text" label={t('tags_label')} placeholder={t('tags_placeholder')} {...register('tagsRaw')} />

          <div>
            <p className={`${LABEL} mb-2`}>{t('cover_label')}</p>
            <CoverUpload
              value={coverUrl}
              onChange={(url) => setValue('coverUrl', url, { shouldValidate: true })}
              invalid={!!errors.coverUrl}
              label={t('cover_label')}
              urlInputProps={errors.coverUrl ? { 'aria-describedby': 'event-cover-error' } : {}}
            />
            {errors.coverUrl?.message ? (
              <p id="event-cover-error" role="alert" className="mt-1 text-xs text-red-600 dark:text-red-400">
                {tAll(errors.coverUrl.message)}
              </p>
            ) : null}
          </div>

          <div>
            <button type="button" onClick={toggleAfterVenue} aria-expanded={showAfterVenue} className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline">
              {showAfterVenue ? t('after_venue_remove') : t('after_venue_add')}
            </button>

            {showAfterVenue ? (
              <div className="mt-3 space-y-3 rounded-xl border border-gray-200 dark:border-gray-600 p-4">
                <FormField
                  id="afterVenueName"
                  type="text"
                  label={<Required>{t('after_venue_name_label')}</Required>}
                  placeholder={t('after_venue_name_placeholder')}
                  {...register('afterVenueName')}
                />
                <div>
                  <p className={LABEL}>{t('after_venue_address_label')}</p>
                  <AddressAutocomplete
                    value={afterVenueAddress}
                    onChange={(text) => setValue('afterVenueAddress', text)}
                    onTyped={() => {
                      setValue('afterVenueLat', null);
                      setValue('afterVenueLng', null);
                    }}
                    onSelected={(s) => {
                      setValue('afterVenueAddress', s.label, { shouldValidate: true });
                      setValue('afterVenueLat', s.lat ?? null);
                      setValue('afterVenueLng', s.lng ?? null);
                    }}
                    label={t('after_venue_address_label')}
                    placeholder={t('after_venue_address_placeholder')}
                    invalid={!!errors.afterVenueAddress}
                    inputProps={errors.afterVenueAddress ? { 'aria-describedby': 'event-after-address-error' } : {}}
                  />
                  {errors.afterVenueAddress?.message ? (
                    <p id="event-after-address-error" role="alert" className="mt-1 text-xs text-red-600 dark:text-red-400">
                      {tAll(errors.afterVenueAddress.message)}
                    </p>
                  ) : null}
                </div>
                <FormField
                  id="afterVenueDesc"
                  type="text"
                  label={t('after_venue_notes_label')}
                  placeholder={t('after_venue_notes_placeholder')}
                  {...register('afterVenueDescription')}
                />
              </div>
            ) : null}
          </div>

          {showHasWinner ? (
            <label htmlFor="hasWinner" className="flex items-center gap-3 cursor-pointer select-none">
              <span className="relative inline-flex items-center">
                <input type="checkbox" id="hasWinner" className="sr-only peer" {...register('hasWinner')} />
                <div className="w-11 h-6 bg-gray-200 peer-focus-visible:ring-2 peer-focus-visible:ring-primary-500 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600" />
              </span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{tAll('EVENT.has_winner_label')}</span>
            </label>
          ) : null}

          <div className="flex justify-end gap-3 pt-2">
            <Button asChild variant="outline">
              <AppLink href={backHref}>{t('cancel')}</AppLink>
            </Button>
            <Button type="submit" disabled={pending} data-testid="event-submit" className="bg-primary-600 hover:bg-primary-700 text-white">
              {pending ? (
                <>
                  <Spinner className="mr-2" />
                  {t('submitting')}
                </>
              ) : (
                submitLabel
              )}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
