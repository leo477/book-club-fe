'use client';

import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { writeCookie } from '@/lib/cookie';

export function useLocaleSwitch() {
  const locale = useLocale();
  const router = useRouter();
  const switchLocale = () => {
    const next = locale === 'uk' ? 'en' : 'uk';
    localStorage.setItem('lang', next);
    writeCookie('lang', next);
    router.refresh();
  };
  return { locale, switchLocale };
}

export const localeLabel = (locale: string) => (locale === 'uk' ? 'Switch to English' : 'Перейти на українську');

export function LocaleSwitch({ locale, switchLocale }: { locale: string; switchLocale: () => void }) {
  return (
    <Button variant="ghost" size="sm" type="button" onClick={switchLocale} aria-label={localeLabel(locale)}>
      {locale === 'uk' ? 'EN' : 'UK'}
    </Button>
  );
}
