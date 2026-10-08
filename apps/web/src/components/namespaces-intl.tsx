import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import type { ReactNode } from 'react';

/** Ships only the named namespaces to the client; the nested provider replaces the shell's, so list the shell's too when a page needs them. */
export async function NamespacesIntl({ namespaces, children }: { namespaces: readonly string[]; children: ReactNode }) {
  const [all, locale] = await Promise.all([getMessages(), getLocale()]);
  const messages = Object.fromEntries(namespaces.map((ns) => [ns, all[ns]]));
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
