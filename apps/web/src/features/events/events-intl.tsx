import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import type { ReactNode } from 'react';

// the nested provider replaces the shell's, so it repeats the namespaces the shell already ships
const NAMESPACES = ['NAV', 'EVENTS', 'events', 'CREATE_EVENT', 'BOOK_STORES', 'ERRORS'] as const;

export async function EventsIntl({ children }: { children: ReactNode }) {
  const [all, locale] = await Promise.all([getMessages(), getLocale()]);
  const messages = Object.fromEntries(NAMESPACES.map((ns) => [ns, all[ns]]));
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
