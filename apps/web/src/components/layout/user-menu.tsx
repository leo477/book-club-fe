'use client';

import { lazy, Suspense } from 'react';
import { TRIGGER_CLASS, UserAvatar } from './user-avatar';

// Radix DropdownMenu (menu, popper, roving focus) stays out of the first-load bundle: it loads once the session resolves to a user
const UserMenuImpl = lazy(() => import('./user-menu-impl'));

export function UserMenu({ displayName, onSignOut }: { displayName: string; onSignOut: () => void }) {
  return (
    <Suspense
      fallback={
        // inert stand-in that only reserves the avatar's space until the menu chunk arrives
        <button type="button" className={TRIGGER_CLASS} aria-hidden="true" tabIndex={-1} data-testid="user-menu-loading">
          <UserAvatar displayName={displayName} />
        </button>
      }
    >
      <UserMenuImpl displayName={displayName} onSignOut={onSignOut} />
    </Suspense>
  );
}
