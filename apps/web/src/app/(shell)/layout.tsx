import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { cookies } from 'next/headers';
import type { ReactNode } from 'react';
import { ChatLink } from '@/components/layout/chat-link';
import { ErrorToasts } from '@/components/layout/error-toasts';
import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { THEME_COOKIE } from '@/i18n/locale';

const CLIENT_NAMESPACES = ['NAV', 'CLUBS', 'CHAT', 'ERRORS'] as const;

export default async function ShellLayout({ children }: { children: ReactNode }) {
  const [messages, jar] = await Promise.all([getMessages(), cookies()]);
  const clientMessages = Object.fromEntries(CLIENT_NAMESPACES.map((ns) => [ns, messages[ns]]));

  return (
    <NextIntlClientProvider messages={clientMessages}>
      <div className="shell-root">
        <Header initialDark={jar.get(THEME_COOKIE)?.value === 'dark'} />
        <main className="min-h-screen">{children}</main>
        <ChatLink />
        <ErrorToasts />
        <Footer />
      </div>
    </NextIntlClientProvider>
  );
}
