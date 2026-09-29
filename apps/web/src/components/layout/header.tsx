'use client';

import { useTranslations } from 'next-intl';
import { AppLink } from '@/components/app-link';
import { Button } from '@/components/ui/button';
import { useSession } from '@/features/clubs/use-session';
import { api } from '@/lib/api';
import { hardNavigate } from '@/lib/navigate';
import { LocaleSwitch, useLocaleSwitch } from './locale-switch';
import { MobileNav } from './mobile-nav';
import { NavLinks } from './nav-links';
import { ThemeSwitch, useTheme } from './theme-switch';
import { UserMenu } from './user-menu';

export function Header({ initialDark }: { initialDark: boolean }) {
  const t = useTranslations('NAV');
  const { user, isPending } = useSession();
  const { isDark, toggle } = useTheme(initialDark);
  const { locale, switchLocale } = useLocaleSwitch();

  const signOut = async () => {
    try {
      await api.auth.logout();
    } catch {
      // logout must complete even if the request fails
    }
    hardNavigate('/login');
  };

  return (
    <header
      className="sticky top-0 z-50 bg-[var(--color-surface)]/90 dark:bg-[var(--color-surface)]/95 backdrop-blur-[10px] border-b border-[var(--color-sepia)] shadow-[0_2px_12px_rgba(92,45,10,0.10)] dark:shadow-[0_2px_16px_rgba(0,0,0,0.40)]"
      role="banner"
    >
      <div className="page-max-w px-6">
        <div className="flex items-center justify-between h-16">
          <AppLink
            href="/"
            className="font-fantasy text-xl font-bold tracking-widest text-[var(--color-primary-600)] dark:text-[#fbbf24] hover:text-[var(--color-primary-500)] dark:hover:text-[#fcd34d] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:ring-offset-2 rounded"
            aria-label="BookClub home"
          >
            BookClub
          </AppLink>

          <NavLinks isAuthenticated={user !== null} />

          <div className="hidden md:flex items-center gap-1">
            <ThemeSwitch isDark={isDark} toggle={toggle} />
            <LocaleSwitch locale={locale} switchLocale={switchLocale} />
            {user ? (
              <UserMenu displayName={user.displayName} onSignOut={signOut} />
            ) : (
              // reserves the auth area's space so a signed-in user's avatar does not shift the header when the session resolves
              <div className={isPending ? 'invisible flex items-center gap-1' : 'flex items-center gap-1'} aria-hidden={isPending || undefined}>
                <Button asChild variant="outline" size="sm">
                  <AppLink href="/login" tabIndex={isPending ? -1 : undefined}>
                    {t('login')}
                  </AppLink>
                </Button>
                <Button asChild size="sm" className="bg-gradient-fantasy! text-white border-0 hover:opacity-90">
                  <AppLink href="/register" tabIndex={isPending ? -1 : undefined}>
                    {t('join_free')}
                  </AppLink>
                </Button>
              </div>
            )}
          </div>

          <MobileNav
            isAuthenticated={user !== null}
            displayName={user?.displayName ?? null}
            isDark={isDark}
            locale={locale}
            onToggleTheme={toggle}
            onSwitchLocale={switchLocale}
            onSignOut={signOut}
          />
        </div>
      </div>
    </header>
  );
}
