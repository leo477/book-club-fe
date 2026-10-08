'use client';
'use no memo';

import { zodResolver } from '@hookform/resolvers/zod';
import { displayNameForm, type DisplayNameForm } from '@book-club/contracts';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/form-field';
import { useUpdateDisplayName } from './use-profile';

export function DisplayNameForm({ displayName }: { displayName: string }) {
  const t = useTranslations('PROFILE');
  const save = useUpdateDisplayName();
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<DisplayNameForm>({ resolver: zodResolver(displayNameForm), defaultValues: { displayName }, mode: 'onTouched' });

  return (
    <form onSubmit={handleSubmit((values) => save.mutate(values.displayName))} noValidate>
      <div className="space-y-4">
        <FormField
          label={t('display_name_label')}
          type="text"
          autoComplete="nickname"
          data-testid="display-name-input"
          placeholder={t('display_name_placeholder')}
          error={errors.displayName?.message}
          {...register('displayName')}
        />
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={!isValid || save.isPending} className="bg-gradient-brand text-white border-0 hover:opacity-90">
            {save.isPending ? t('saving') : t('save_name')}
          </Button>
        </div>
      </div>
    </form>
  );
}
