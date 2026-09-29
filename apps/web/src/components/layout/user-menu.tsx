'use client';

import { useTranslations } from 'next-intl';
import { useRef, useState, type KeyboardEvent } from 'react';
import { AppLink } from '@/components/app-link';
import { cn } from '@/lib/utils';

const ITEM = 'block px-3 py-2 text-sm text-[var(--color-ink)] hover:bg-[var(--color-surface-raised)] transition-colors';

export function initialsOf(name: string): string {
  return (
    name
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? '')
      .join('') || '?'
  );
}

export function UserMenu({ displayName, onSignOut }: { displayName: string; onSignOut: () => void }) {
  const t = useTranslations('NAV');
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Escape' || !open) return;
    setOpen(false);
    trigger.current?.focus();
  };

  return (
    <div className="relative" onKeyDown={onKeyDown}>
      <button
        ref={trigger}
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full p-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:ring-offset-2"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`User menu for ${displayName || 'User'}`}
      >
        <div
          className="h-9 w-9 rounded-full avatar-gradient flex items-center justify-center text-white text-sm font-semibold select-none"
          aria-hidden="true"
        >
          {initialsOf(displayName)}
        </div>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-md border border-[var(--color-sepia)] bg-[var(--color-surface)] shadow-lg z-50 py-1" role="menu">
          <div className="px-3 py-2 text-sm font-semibold text-[var(--color-ink)]">{displayName}</div>
          <hr className="border-[var(--color-sepia)] my-1" />
          <AppLink href="/chats" onClick={() => setOpen(false)} className={ITEM} role="menuitem">
            {t('chats')}
          </AppLink>
          <AppLink href="/profile" onClick={() => setOpen(false)} className={ITEM} role="menuitem">
            {t('profile')}
          </AppLink>
          <hr className="border-[var(--color-sepia)] my-1" />
          <button
            type="button"
            data-testid="logout"
            onClick={onSignOut}
            className={cn(ITEM, 'w-full text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20')}
            role="menuitem"
          >
            {t('logout')}
          </button>
        </div>
      )}
    </div>
  );
}
