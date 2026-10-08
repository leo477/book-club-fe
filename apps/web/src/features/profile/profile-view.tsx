'use client';

import { useLocale, useTranslations } from 'next-intl';
import type { CSSProperties } from 'react';
import { useSession } from '@/features/clubs/use-session';
import { DisplayNameForm } from './display-name-form';
import { ProfileStats } from './profile-stats';
import { RoleSelector } from './role-selector';
import { SocialsSection } from './socials-section';
import { useStats, useUpdateRole } from './use-profile';

const LOCALES: Record<string, string> = { uk: 'uk-UA', en: 'en-US' };
const SECTION = 'glass-card p-6 section-stagger';
const HEADING = 'heading-display text-lg font-semibold text-gray-900 dark:text-white mb-5 flex items-center gap-2';

function joinedDate(raw: string, locale: string): string {
  return new Intl.DateTimeFormat(LOCALES[locale] ?? 'en-US', { year: 'numeric', month: 'long' }).format(new Date(raw));
}

/** Rendered under RequireAuth, so the session user is always present. */
export function ProfileView() {
  const t = useTranslations('PROFILE');
  const locale = useLocale();
  const { user } = useSession();
  const stats = useStats();
  const changeRole = useUpdateRole();
  if (!user) return null;

  const organizer = user.role === 'organizer';
  const initials = user.displayName
    .split(' ')
    .map((w) => w.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
  const joined = user.createdAt ? joinedDate(user.createdAt, locale) : '';

  return (
    <div className="parchment-hero min-h-screen">
      <div className="max-w-2xl mx-auto space-y-5 py-8 px-4">
        <section aria-labelledby="profile-heading" className="parchment-card-raised p-8 text-center section-stagger" style={{ '--stagger': 0 } as CSSProperties}>
          <div
            className="mx-auto mb-4 h-24 w-24 rounded-full bg-gradient-brand flex items-center justify-center text-white text-3xl font-bold select-none shadow-lg ring-4 ring-[var(--color-primary-400)] ring-offset-2 ring-offset-[var(--color-bg)]"
            aria-hidden="true"
          >
            {initials}
          </div>
          <h1 id="profile-heading" className="heading-display text-2xl font-bold text-gray-900 dark:text-white">
            {user.displayName}
          </h1>
          <span
            className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${
              organizer
                ? 'bg-accent-100/80 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300'
                : 'bg-primary-100/80 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
            }`}
          >
            {organizer ? '🎯' : '📖'} {organizer ? t('role_organizer') : t('role_reader')}
          </span>
          {joined && (
            <p className="mt-3 text-sm text-gray-400 dark:text-gray-500">
              {t('member_since')} {joined}
            </p>
          )}
        </section>

        <section aria-labelledby="edit-name-heading" className={SECTION} style={{ '--stagger': 1 } as CSSProperties}>
          <h2 id="edit-name-heading" className={HEADING}>
            <span aria-hidden="true">✏️</span> {t('edit_profile')}
          </h2>
          <DisplayNameForm displayName={user.displayName} />
        </section>

        <section aria-labelledby="role-heading" className={SECTION} style={{ '--stagger': 2 } as CSSProperties}>
          <h2 id="role-heading" className={`${HEADING} mb-1`}>
            <span aria-hidden="true">🔖</span> {t('role_title')}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">{t('role_subtitle')}</p>
          <RoleSelector currentRole={user.role} onChange={changeRole.mutate} />
        </section>

        <section aria-labelledby="stats-heading" className={SECTION} style={{ '--stagger': 3 } as CSSProperties}>
          <h2 id="stats-heading" className={HEADING}>
            <span aria-hidden="true">📊</span> {t('stats_title')}
          </h2>
          <ProfileStats stats={stats} />
        </section>

        <section aria-labelledby="socials-heading" className={SECTION} style={{ '--stagger': 4 } as CSSProperties}>
          <h2 id="socials-heading" className={HEADING}>
            <span aria-hidden="true">🌐</span> {t('socials_title')}
          </h2>
          <SocialsSection user={user} />
        </section>
      </div>
    </div>
  );
}
