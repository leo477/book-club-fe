'use client';

import { MoonIcon, SunIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ReactNode, RefObject } from 'react';
import { AppLink } from '@/components/app-link';
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { localeLabel } from './locale-switch';

const ROW_BASE = 'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 w-full text-left';
const ROW = `${ROW_BASE} text-[var(--color-ink)] hover:bg-[var(--color-surface-raised)]`;
const REGISTER_ROW = `${ROW_BASE} bg-gradient-fantasy text-white hover:opacity-90`;

export interface MobileNavProps {
  isAuthenticated: boolean;
  displayName: string | null;
  isDark: boolean;
  locale: string;
  onToggleTheme: () => void;
  onSwitchLocale: () => void;
  onSignOut: () => void;
}

interface SheetProps extends MobileNavProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: RefObject<HTMLButtonElement | null>;
}

export default function MobileNavSheet({ isAuthenticated, displayName, isDark, locale, onToggleTheme, onSwitchLocale, onSignOut, open, onOpenChange, trigger }: SheetProps) {
  const t = useTranslations('NAV');
  const tErrors = useTranslations('ERRORS');
  const themeLabel = isDark ? t('theme_toggle_light') : t('theme_toggle_dark');
  const link = (href: string, label: ReactNode, extra?: { testId?: string; className?: string }) => (
    <SheetClose asChild>
      <AppLink href={href} data-testid={extra?.testId} className={extra?.className ?? ROW}>
        {label}
      </AppLink>
    </SheetClose>
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        closeLabel={tErrors('dismiss')}
        aria-describedby={undefined}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          trigger.current?.focus();
        }}
      >
        <SheetHeader>
          <SheetTitle className="font-fantasy font-bold tracking-widest text-[var(--color-primary-600)] dark:text-[#fbbf24]">BookClub</SheetTitle>
        </SheetHeader>

        <nav className="flex flex-col gap-1 px-4 py-2" aria-label="Mobile navigation">
          {link('/events', t('events'))}
          {link('/clubs', t('clubs'))}
          {isAuthenticated && link('/support', t('support'), { testId: 'nav-support-mobile' })}

          <button type="button" data-testid="theme-toggle" onClick={onToggleTheme} aria-pressed={isDark} aria-label={themeLabel} className={ROW}>
            {isDark ? <SunIcon className="size-4" /> : <MoonIcon className="size-4" />}
            <span>{themeLabel}</span>
          </button>

          <button type="button" onClick={onSwitchLocale} aria-label={localeLabel(locale)} className={ROW}>
            <span>{locale === 'uk' ? '🇬🇧 EN' : '🇺🇦 UK'}</span>
          </button>

          <div className="pt-2 mt-2 border-t border-[var(--color-sepia)] flex flex-col gap-1">
            {isAuthenticated ? (
              <>
                <div className="px-4 py-2">
                  <p className="text-xs font-semibold text-[var(--color-ink-muted)] uppercase tracking-wide">{t('signed_in_as')}</p>
                  <p className="text-sm font-medium text-[var(--color-ink)] mt-0.5">{displayName}</p>
                </div>
                {link('/profile', t('profile'))}
                <SheetClose asChild>
                  <button
                    type="button"
                    data-testid="logout"
                    onClick={onSignOut}
                    className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                  >
                    {t('logout')}
                  </button>
                </SheetClose>
              </>
            ) : (
              <>
                {link('/login', t('login'))}
                {link('/register', t('join_free'), { className: REGISTER_ROW })}
              </>
            )}
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
