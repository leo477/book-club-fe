'use client';

import { useEffect, useState } from 'react';
import { reportJsError } from '@/lib/analytics';

type Copy = { message: string; retry: string };
const FALLBACK: Record<'uk' | 'en', Copy> = {
  en: { message: 'Something went wrong. Please try again.', retry: 'Try again' },
  uk: { message: 'Щось пішло не так. Спробуйте ще раз.', retry: 'Спробувати ще раз' },
};
const loaders = {
  uk: () => import('@book-club/i18n/uk.icu.json'),
  en: () => import('@book-club/i18n/en.icu.json'),
};

const cookieLocale = (): 'uk' | 'en' => (/(?:^|;\s*)lang=en(?:;|$)/.test(document.cookie) ? 'en' : 'uk');

/** Replaces the root layout, so it has no providers: the locale comes from the cookie and the message from the shared ICU file. */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const [locale] = useState<'uk' | 'en'>(() => (typeof document === 'undefined' ? 'uk' : cookieLocale()));
  const [copy, setCopy] = useState<Copy>(FALLBACK[locale]);

  useEffect(() => reportJsError(error, 'boundary'), [error]);
  useEffect(() => {
    let live = true;
    loaders[locale]()
      .then((m) => {
        const flat = m.default as Record<string, string>;
        if (live && flat['ERRORS.unexpected'] && flat['ERRORS.retry']) setCopy({ message: flat['ERRORS.unexpected'], retry: flat['ERRORS.retry'] });
      })
      .catch(() => {
        // the built-in copy stays
      });
    return () => {
      live = false;
    };
  }, [locale]);

  return (
    <html lang={locale}>
      <body style={{ fontFamily: 'system-ui, sans-serif', textAlign: 'center', padding: '6rem 1rem' }}>
        <div role="alert">
          <p style={{ fontSize: '1.125rem' }}>{copy.message}</p>
          <button type="button" onClick={reset} style={{ padding: '0.5rem 1rem', marginTop: '1rem' }}>
            {copy.retry}
          </button>
        </div>
      </body>
    </html>
  );
}
