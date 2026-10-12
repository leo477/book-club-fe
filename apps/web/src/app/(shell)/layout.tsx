import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { cookies } from 'next/headers';
import type { ReactNode } from 'react';
import { ErrorToasts } from '@/components/layout/error-toasts';
import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { ChatProvider } from '@/features/chat/chat-provider';
import { ChatSlot } from '@/features/chat/chat-slot';
import { THEME_COOKIE } from '@/i18n/locale';

const CLIENT_NAMESPACES = ['NAV', 'CLUBS', 'CHAT', 'CHATS', 'ERRORS'] as const;

export default async function ShellLayout({ children }: { children: ReactNode }) {
  const [messages, jar] = await Promise.all([getMessages(), cookies()]);
  const clientMessages = Object.fromEntries(CLIENT_NAMESPACES.map((ns) => [ns, messages[ns]]));

  return (
    <NextIntlClientProvider messages={clientMessages}>
      <ChatProvider>
        <div className="shell-root">
          <Header initialDark={jar.get(THEME_COOKIE)?.value === 'dark'} />
          <main className="min-h-screen">{children}</main>
          <ChatSlot />
          <ErrorToasts />
          <Footer />
        </div>
      </ChatProvider>
    </NextIntlClientProvider>
  );
}
