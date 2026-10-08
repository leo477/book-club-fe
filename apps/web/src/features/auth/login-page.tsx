'use client';

import { lazy } from 'react';
import { LazyPage } from '@/components/lazy-page';

const LoginView = lazy(() => import('./login-form').then((m) => ({ default: m.LoginView })));

export function LazyLogin() {
  return (
    <LazyPage>
      <LoginView />
    </LazyPage>
  );
}
