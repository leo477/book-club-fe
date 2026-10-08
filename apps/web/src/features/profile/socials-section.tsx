'use client';
'use no memo';

import type { UserProfile, UserSocials } from '@book-club/contracts';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { SocialBadges } from '@/components/social-badges';
import { SocialLinkField, type SocialField } from '@/components/social-link-field';
import { Button } from '@/components/ui/button';
import { useUpdateSocials, useUpdateSocialsVisibility } from './use-profile';

const KEYS = ['telegram', 'instagram', 'twitter', 'linkedin', 'github', 'goodreads'] as const;
type Values = Record<(typeof KEYS)[number], string>;

const fieldsFor = (atPlaceholder: string, urlPlaceholder: string): SocialField[] => [
  { key: 'telegram', label: 'Telegram', labelClass: 'text-blue-600 dark:text-blue-400', placeholder: atPlaceholder, focusRingClass: 'focus-visible:ring-blue-500' },
  { key: 'instagram', label: 'Instagram', labelClass: 'bg-gradient-to-r from-pink-600 via-purple-600 to-orange-500 bg-clip-text text-transparent', placeholder: atPlaceholder, focusRingClass: 'focus-visible:ring-pink-500' },
  { key: 'twitter', label: 'Twitter / X', labelClass: 'text-gray-900 dark:text-gray-100', placeholder: atPlaceholder, focusRingClass: 'focus-visible:ring-gray-800' },
  { key: 'linkedin', label: 'LinkedIn', labelClass: 'text-blue-700 dark:text-blue-400', placeholder: urlPlaceholder, focusRingClass: 'focus-visible:ring-blue-600' },
  { key: 'github', label: 'GitHub', labelClass: 'text-gray-800 dark:text-gray-200', placeholder: 'username', focusRingClass: 'focus-visible:ring-gray-700' },
  { key: 'goodreads', label: 'Goodreads', labelClass: 'text-amber-700 dark:text-amber-400', placeholder: urlPlaceholder, focusRingClass: 'focus-visible:ring-amber-500' },
];

export function SocialsSection({ user }: { user: UserProfile }) {
  const t = useTranslations('PROFILE');
  const saveSocials = useUpdateSocials();
  const saveVisibility = useUpdateSocialsVisibility();
  const [isPublic, setIsPublic] = useState(user.socialsPublic);
  const { register, handleSubmit } = useForm<Values>({
    defaultValues: Object.fromEntries(KEYS.map((k) => [k, user.socials[k] ?? ''])) as Values,
  });
  const fields = fieldsFor(t('social_placeholder_at'), t('social_placeholder_url'));
  const hasAny = KEYS.some((k) => user.socials[k]);

  // empty inputs are left out, as in Angular
  const submit = (values: Values) => {
    const socials: UserSocials = Object.fromEntries(KEYS.filter((k) => values[k]).map((k) => [k, values[k]]));
    saveSocials.mutate(socials);
  };

  return (
    <>
      <div className="flex items-center gap-3 mb-4 p-3 rounded-[var(--bento-radius)] glass-card-subtle">
        <label className="flex items-center gap-2 cursor-pointer select-none text-sm font-medium text-gray-700 dark:text-gray-300">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => {
              setIsPublic(e.target.checked);
              saveVisibility.mutate(e.target.checked);
            }}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus-visible:ring-primary-500"
          />
          {t('socials_public_label')}
        </label>
      </div>

      {hasAny && (
        <div className="flex flex-wrap gap-2 mb-6">
          <SocialBadges socials={user.socials} />
        </div>
      )}

      <form onSubmit={handleSubmit(submit)} noValidate className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {fields.map((field) => (
            <SocialLinkField key={field.key} config={field} {...register(field.key as keyof Values)} />
          ))}
        </div>
        <div className="flex items-center gap-3 pt-1">
          <Button type="submit" className="bg-gradient-brand text-white border-0 hover:opacity-90">
            {t('save')}
          </Button>
        </div>
      </form>
    </>
  );
}
