'use client';
'use no memo';

import { zodResolver } from '@hookform/resolvers/zod';
import { createSubmissionForm, type CreateSubmissionForm } from '@book-club/contracts';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Field, FieldControl, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { describeError } from '@/features/club-detail/describe-error';
import { usePush } from '@/lib/use-push';
import { useCreateSubmission } from './use-support';

const TYPES = ['complaint', 'suggestion', 'comment'] as const;

function Label({ children }: { children: string }) {
  return (
    <FieldLabel>
      {children}
      <span className="text-red-500" aria-hidden="true">
        *
      </span>
    </FieldLabel>
  );
}

export function CreateSubmission() {
  const t = useTranslations('SUPPORT');
  const tErrors = useTranslations('ERRORS');
  const push = usePush();
  const create = useCreateSubmission();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateSubmissionForm>({ resolver: zodResolver(createSubmissionForm), defaultValues: { type: 'suggestion', title: '', body: '' }, mode: 'onTouched' });
  const busy = create.isPending || create.isSuccess;
  const message = (key?: string) => (key ? t(key.replace(/^SUPPORT\./, '')) : null);

  const submit = (values: CreateSubmissionForm) =>
    create.mutate({ type: values.type, title: values.title.trim(), body: values.body.trim() }, { onSuccess: () => push('/support') });

  return (
    <section className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <header className="text-center mb-8">
          <p className="font-display text-3xl font-bold text-gray-900 dark:text-white">💬 {t('title')}</p>
          <p className="text-gray-500 dark:text-gray-400 mt-2">{t('create_subtitle')}</p>
        </header>
        <article className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">{t('create_title')}</h1>
          <form onSubmit={handleSubmit(submit)} className="space-y-5" noValidate>
            <Field>
              <Label>{t('type_label')}</Label>
              <FieldControl>
                <NativeSelect data-testid="submission-type-select" className="bg-white text-gray-900 dark:bg-gray-900 dark:text-white" {...register('type')}>
                  {TYPES.map((type) => (
                    <option key={type} value={type} className="bg-white text-gray-900 dark:bg-gray-900 dark:text-white">
                      {t(`type_${type}`)}
                    </option>
                  ))}
                </NativeSelect>
              </FieldControl>
            </Field>

            <Field invalid={!!errors.title}>
              <Label>{t('title_label')}</Label>
              <FieldControl>
                <Input type="text" data-testid="submission-title-input" placeholder={t('title_placeholder')} {...register('title')} />
              </FieldControl>
              <FieldError>{message(errors.title?.message)}</FieldError>
            </Field>

            <Field invalid={!!errors.body}>
              <Label>{t('body_label')}</Label>
              <FieldControl>
                <Textarea rows={5} className="resize-none" data-testid="submission-body-input" placeholder={t('body_placeholder')} {...register('body')} />
              </FieldControl>
              <FieldError>{message(errors.body?.message)}</FieldError>
            </Field>

            {create.isError && (
              <div role="alert" className="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
                <span className="mt-0.5 shrink-0" aria-hidden="true">
                  ⚠️
                </span>
                <span>{describeError(create.error, tErrors)}</span>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => push('/support')} className="flex-1">
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={busy} data-testid="submission-submit" className="flex-1 bg-primary-600 hover:bg-primary-700 text-white">
                {busy ? (
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
        </article>
      </div>
    </section>
  );
}
