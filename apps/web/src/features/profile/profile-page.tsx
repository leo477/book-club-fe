'use client';

import { lazy } from 'react';
import { LazyPage } from '@/components/lazy-page';

const ProfileView = lazy(() => import('./profile-view').then((m) => ({ default: m.ProfileView })));

export function LazyProfile() {
  return (
    <LazyPage>
      <ProfileView />
    </LazyPage>
  );
}
