import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { cookies, headers } from 'next/headers';
import type { ReactNode } from 'react';
import { AnalyticsEvents } from '@/components/analytics-events';
import { cn } from '@/lib/utils';
import { Providers } from '@/providers/providers';
import { parseTheme, THEME_COOKIE } from '@/i18n/locale';
import { readState, requestBucket } from '@/strangler/server';
import { fontVariables } from './fonts';
import './globals.css';

export const metadata: Metadata = { title: 'Book Club', robots: { index: false } };

const THEME_SCRIPT = `try{if(matchMedia('(prefers-color-scheme: dark)').matches)document.documentElement.classList.add('dark')}catch(e){}`;

export default async function RootLayout({ children }: { children: ReactNode }) {
  const [locale, jar, h, bucket, messages] = await Promise.all([getLocale(), cookies(), headers(), requestBucket(), getMessages()]);
  const theme = parseTheme(jar.get(THEME_COOKIE)?.value);
  const nonce = h.get('x-nonce') ?? undefined;
  const state = await readState(bucket ?? 100);
  const enabledRoutes = state.routes.filter((r) => r.enabled).map((r) => r.pattern);

  return (
    <html lang={locale} className={cn(fontVariables, theme === 'dark' && 'dark')} suppressHydrationWarning>
      <head>
        {theme === 'system' && <script nonce={nonce} dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />}
      </head>
      <body>
        {/* only ERRORS (for app/error.tsx): keeps the rest of the i18n bundle out of the client payload until a page needs it */}
        <NextIntlClientProvider messages={{ ERRORS: messages['ERRORS'] }}>
          <Providers enabledRoutes={enabledRoutes} theme={theme}>
            {children}
          </Providers>
        </NextIntlClientProvider>
        <Analytics />
        <SpeedInsights />
        <AnalyticsEvents />
      </body>
    </html>
  );
}
