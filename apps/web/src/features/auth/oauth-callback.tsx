'use client';

import { useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { Spinner } from '@/components/ui/spinner';
import { sessionKey } from '@/features/clubs/use-session';
import { api } from '@/lib/api';
import { setFlash } from '@/lib/flash';
import { hardNavigate } from '@/lib/navigate';
import { resetSessionHint } from '@/lib/session-hint';
import { useReplace } from '@/lib/use-replace';

interface Attempt {
  code: string | null;
  /** mounted callback pages; a page that went away before the exchange settled must not navigate */
  mounts: number;
  toLogin: () => void;
  done: Promise<void>;
}

// The code is single-use (60 s TTL) and is stripped from the URL when an attempt starts, so a StrictMode remount
// must join the running attempt (the URL is empty by then) instead of bouncing to /login; a different code starts its own.
let current: Attempt | null = null;

async function exchange(queryClient: QueryClient, code: string | null): Promise<boolean> {
  if (!code) return false;
  try {
    await api.auth.exchangeOAuthSession(code);
    queryClient.setQueryData(sessionKey, await api.auth.me({ skipAuthRedirect: true }));
    return true;
  } catch {
    // any failure of the exchange or of the profile load is the same "OAuth failed" outcome
    return false;
  }
}

function begin(queryClient: QueryClient): Attempt {
  const code = new URLSearchParams(window.location.search).get('code') || null;
  if (current && (code === null || code === current.code)) return current;
  // Out of the URL and history before the exchange or any redirect: no Referer leak, no back-button replay.
  window.history.replaceState({}, '', '/auth/callback');
  const attempt: Attempt = { code, mounts: 0, toLogin: () => undefined, done: Promise.resolve() };
  attempt.done = exchange(queryClient, code)
    .then((ok) => {
      if (attempt.mounts === 0) return;
      if (ok) {
        resetSessionHint();
        hardNavigate('/events');
      } else {
        // /login raises the message: a router replace keeps it in memory, a reload needs the one-shot flash (login reads and deletes it)
        setFlash('oauth_failed');
        attempt.toLogin();
      }
    })
    .finally(() => {
      if (current === attempt) current = null;
    });
  current = attempt;
  return attempt;
}

export function OAuthCallback() {
  const t = useTranslations('AUTH');
  const queryClient = useQueryClient();
  const replace = useReplace();

  useEffect(() => {
    const attempt = begin(queryClient);
    attempt.toLogin = () => replace('/login');
    attempt.mounts += 1;
    return () => {
      attempt.mounts -= 1;
    };
  }, [queryClient, replace]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <Spinner />
      <p className="text-muted-foreground">{t('signing_in')}</p>
    </div>
  );
}
