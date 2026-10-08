'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

type Selectable = 'user' | 'organizer';

const OPTIONS = [
  {
    role: 'user',
    emoji: '📖',
    title: 'role_reader',
    desc: 'role_reader_desc',
    on: 'border-primary-500 bg-primary-50 dark:bg-primary-900/20',
    off: 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-gray-50 dark:hover:bg-gray-700/40',
    ring: 'focus-visible:ring-primary-500',
    badge: 'bg-primary-600',
  },
  {
    role: 'organizer',
    emoji: '🎯',
    title: 'role_organizer',
    desc: 'role_organizer_desc',
    on: 'border-accent-500 bg-accent-50 dark:bg-accent-900/20',
    off: 'border-gray-200 dark:border-gray-700 hover:border-accent-300 dark:hover:border-accent-700 hover:bg-gray-50 dark:hover:bg-gray-700/40',
    ring: 'focus-visible:ring-accent-500',
    badge: 'bg-accent-600',
  },
] as const;

export function RoleSelector({ currentRole, onChange }: { currentRole: string; onChange: (role: Selectable) => void }) {
  const t = useTranslations('PROFILE');
  return (
    <fieldset className="grid grid-cols-2 gap-4 border-0 p-0 m-0">
      <legend className="sr-only">{t('role_title')}</legend>
      {OPTIONS.map((o) => {
        const active = currentRole === o.role;
        return (
          <button
            key={o.role}
            type="button"
            onClick={() => onChange(o.role)}
            aria-pressed={active}
            data-testid={`role-${o.role}`}
            className={cn('rounded-xl border-2 p-5 text-left transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-offset-2', o.ring, active ? o.on : o.off)}
          >
            <div className="text-3xl mb-2" aria-hidden="true">
              {o.emoji}
            </div>
            <div className="font-semibold text-gray-900 dark:text-white text-sm">{t(o.title)}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t(o.desc)}</div>
            {active && <span className={cn('mt-3 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium text-white', o.badge)}>{t('active_badge')}</span>}
          </button>
        );
      })}
    </fieldset>
  );
}
