'use client';

import { useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { Spinner } from '@/components/ui/spinner';
import { sessionKey } from '@/features/clubs/use-session';
import { api } from '@/lib/api';
import { setFlash } from '@/lib/flash';
import { hardNavigate } from '@/lib/navigate';
import { useReplace } from '@/lib/use-replace';
import { resetSessionHint } from '@/lib/session-hint';

// The code is single-use (60 s TTL) and is stripped from the URL on the first run, so a StrictMode or Suspense
// remount in the same tick must join this attempt instead of reading an empty URL and bouncing to /login.
let attempt: Promise<void> | null = null;

async function completeOAuth(queryClient: QueryClient, toLogin: () => void): Promise<void> {
  const code = new URLSearchParams(window.location.search).get('code');
  // Out of the URL and history before the exchange or any redirect: no Referer leak, no back-button replay.
  window.history.replaceState({}, '', '/auth/callback');
  let ok = false;
  if (code) {
    try {
      await api.auth.exchangeOAuthSession(code);
      queryClient.setQueryData(sessionKey, await api.auth.me({ skipAuthRedirect: true }));
      ok = true;
    } catch {
      // any failure of the exchange or of the profile load is the same "OAuth failed" outcome
    }
  }
  if (!ok) {
    // /login raises the message: a router replace keeps it in memory, a reload needs the one-shot flash (login reads and deletes it)
    setFlash('oauth_failed');
    toLogin();
    return;
  }
  resetSessionHint();
  hardNavigate('/events');
}

export function OAuthCallback() {
  const t = useTranslations('AUTH');
  const queryClient = useQueryClient();
  const replace = useReplace();

  useEffect(() => {
    attempt ??= completeOAuth(queryClient, () => replace('/login')).finally(() => {
      attempt = null;
    });
  }, [queryClient, replace]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <Spinner />
      <p className="text-muted-foreground">{t('signing_in')}</p>
    </div>
  );
}
