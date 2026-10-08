'use client';

import type { UserRole } from '@book-club/contracts';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, type ReactNode } from 'react';
import { useSession } from '@/features/clubs/use-session';
import { Spinner } from '@/components/ui/spinner';
import { showToast } from '@/lib/toast';
import { useReplace } from '@/lib/use-replace';

// 'admin' satisfies every guard; 'organizer' routes also admit 'admin' (roleGuard parity)
const ALLOWED: Record<UserRole, readonly UserRole[]> = {
  user: ['user', 'organizer', 'admin'],
  organizer: ['organizer', 'admin'],
  admin: ['admin'],
};

export function Pending() {
  return (
    <div className="min-h-screen flex justify-center pt-24" aria-busy="true">
      <Spinner />
    </div>
  );
}

/** authGuard: waits for the session bootstrap, then replaces the page with /login (no returnUrl, as in Angular). */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, isPending } = useSession();
  const replace = useReplace();
  const signedOut = !isPending && user === null;

  useEffect(() => {
    if (signedOut) replace('/login');
  }, [signedOut, replace]);

  return user ? children : <Pending />;
}

/** roleGuard: a signed-in user below the required role gets the "organizers only" toast and lands on /clubs. */
export function RequireRole({ role, children }: { role: UserRole; children: ReactNode }) {
  return (
    <RequireAuth>
      <RoleGate role={role}>{children}</RoleGate>
    </RequireAuth>
  );
}

function RoleGate({ role, children }: { role: UserRole; children: ReactNode }) {
  const { user } = useSession();
  const t = useTranslations('ERRORS');
  const replace = useReplace();
  const allowed = user !== null && ALLOWED[role].includes(user.role);
  const denied = useRef(false);

  useEffect(() => {
    if (allowed || denied.current) return;
    denied.current = true;
    showToast('error', t('organizers_only'));
    replace('/clubs');
  }, [allowed, replace, t]);

  return allowed ? children : <Pending />;
}
