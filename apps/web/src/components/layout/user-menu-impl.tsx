'use client';

import { useTranslations } from 'next-intl';
import { AppLink } from '@/components/app-link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { TRIGGER_CLASS, UserAvatar } from './user-avatar';

const ITEM = 'px-3 py-2 text-[var(--color-ink)] data-[highlighted]:bg-[var(--color-surface-raised)] data-[highlighted]:text-[var(--color-ink)] cursor-pointer';

export default function UserMenuImpl({ displayName, onSignOut }: { displayName: string; onSignOut: () => void }) {
  const t = useTranslations('NAV');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={TRIGGER_CLASS}
          aria-label={`User menu for ${displayName || 'User'}`}
        >
          <UserAvatar displayName={displayName} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-48 border-[var(--color-sepia)] bg-[var(--color-surface)] py-1 shadow-lg"
      >
        <DropdownMenuLabel className="px-3 py-2 font-semibold text-[var(--color-ink)]">{displayName}</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-[var(--color-sepia)]" />
        <DropdownMenuItem asChild className={ITEM}>
          <AppLink href="/chats">{t('chats')}</AppLink>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className={ITEM}>
          <AppLink href="/profile">{t('profile')}</AppLink>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-[var(--color-sepia)]" />
        <DropdownMenuItem
          data-testid="logout"
          onSelect={onSignOut}
          className={cn(ITEM, 'text-red-600 dark:text-red-400 data-[highlighted]:bg-red-50 dark:data-[highlighted]:bg-red-900/20 data-[highlighted]:text-red-600')}
        >
          {t('logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
