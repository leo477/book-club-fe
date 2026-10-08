'use client';

import type { ComponentProps, ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { Field, FieldControl, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

type Props = Omit<ComponentProps<typeof Input>, 'children'> & {
  label: ReactNode;
  /** i18n key of the message (zod issues carry keys such as `FORM_ERRORS.required`); shown while set */
  error?: string | undefined;
  /** ICU arguments for the key, e.g. `{ requiredLength: 8 }` for `FORM_ERRORS.minlength` */
  errorValues?: Record<string, string | number>;
};

/** Label + input + error with the a11y wiring (`aria-invalid`, `aria-describedby`) done by Field. */
export function FormField({ label, error, errorValues, ...input }: Props) {
  const t = useTranslations();
  return (
    <Field invalid={!!error} className="gap-1">
      <FieldLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</FieldLabel>
      <FieldControl>
        <Input {...input} />
      </FieldControl>
      <FieldError className="text-xs">{error ? t(error, errorValues) : null}</FieldError>
    </Field>
  );
}
