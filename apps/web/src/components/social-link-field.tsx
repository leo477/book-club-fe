'use client';

import type { ComponentProps } from 'react';
import { Field, FieldControl, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface SocialField {
  key: string;
  label: string;
  labelClass: string;
  placeholder: string;
  focusRingClass: string;
}

type Props = { config: SocialField } & Omit<ComponentProps<typeof Input>, 'placeholder' | 'type'>;

/** One social-network input; the `register(...)` props of the owning form go in `...input`. */
export function SocialLinkField({ config, className, ...input }: Props) {
  return (
    <Field className="gap-1.5">
      <FieldLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
        <span className={config.labelClass}>{config.label}</span>
      </FieldLabel>
      <FieldControl>
        <Input
          type="text"
          autoComplete="off"
          placeholder={config.placeholder}
          data-testid={`social-${config.key}`}
          className={cn('h-auto rounded-xl border-gray-200 bg-gray-50 px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900', config.focusRingClass, className)}
          {...input}
        />
      </FieldControl>
    </Field>
  );
}
