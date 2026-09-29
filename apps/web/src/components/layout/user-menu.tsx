'use client';

import { lazy, Suspense } from 'react';
import { LazyBoundary } from '@/components/lazy-boundary';
import { TRIGGER_CLASS, UserAvatar } from './user-avatar';

// Radix DropdownMenu (menu, popper, roving focus) stays out of the first-load bundle: it loads once the session resolves to a user
const UserMenuImpl = lazy(() => import('./user-menu-impl'));

export function UserMenu({ displayName, onSignOut }: { displayName: string; onSignOut: () => void }) {
  // inert stand-in that only reserves the avatar's space until the menu chunk arrives (or for good if it cannot load)
  const inert = (
    <button type="button" className={TRIGGER_CLASS} aria-hidden="true" tabIndex={-1} data-testid="user-menu-loading">
      <UserAvatar displayName={displayName} />
    </button>
  );
  return (
    <LazyBoundary fallback={inert}>
      <Suspense fallback={inert}>
        <UserMenuImpl displayName={displayName} onSignOut={onSignOut} />
      </Suspense>
    </LazyBoundary>
  );
}
