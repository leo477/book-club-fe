'use client';

import { MoonIcon, SunIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useSyncExternalStore } from 'react';
import { Button } from '@/components/ui/button';
import { writeCookie } from '@/lib/cookie';

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
    localStorage.setItem('theme', next);
    writeCookie('theme', next);
  };
  return { isDark, toggle };
}

export function ThemeSwitch({ isDark, toggle }: { isDark: boolean; toggle: () => void }) {
  const t = useTranslations('NAV');
  const label = isDark ? t('theme_toggle_light') : t('theme_toggle_dark');
  return (
    <Button variant="ghost" size="icon" type="button" data-testid="theme-toggle" onClick={toggle} aria-pressed={isDark} aria-label={label} title={label}>
      {isDark ? <SunIcon /> : <MoonIcon />}
    </Button>
  );
}
