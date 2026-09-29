'use client';

import { MoonIcon, SunIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useSyncExternalStore } from 'react';
import { Button } from '@/components/ui/button';
import { persistPreference } from '@/lib/cookie';

const root = () => document.documentElement;

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(root(), { attributes: true, attributeFilter: ['class'] });
  return () => observer.disconnect();
}

/** The `dark` class on <html> is the source of truth (server cookie, inline system-theme script, or a toggle). */
export function useTheme(initialDark: boolean) {
  const isDark = useSyncExternalStore(subscribe, () => root().classList.contains('dark'), () => initialDark);
  const toggle = () => {
    const next = isDark ? 'light' : 'dark';
    root().classList.toggle('dark', next === 'dark');
    persistPreference('theme', next);
  };
  return { isDark, toggle };
}

/** Icon and accessible name follow the `dark` class through CSS only, so a system-theme page never flips them after hydration. */
export function ThemeSwitch({ toggle }: { toggle: () => void }) {
  const t = useTranslations('NAV');
  return (
    <Button variant="ghost" size="icon" type="button" data-testid="theme-toggle" onClick={toggle}>
      <MoonIcon className="dark:hidden" aria-hidden="true" />
      <SunIcon className="hidden dark:block" aria-hidden="true" />
      <span className="sr-only dark:hidden">{t('theme_toggle_dark')}</span>
      <span className="sr-only hidden dark:inline">{t('theme_toggle_light')}</span>
    </Button>
  );
}
