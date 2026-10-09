'use client';

import { lazy } from 'react';
import { LazyPage } from '@/components/lazy-page';

const RegisterView = lazy(() => import('./register-form').then((m) => ({ default: m.RegisterView })));

export function LazyRegister() {
  return (
    <LazyPage>
      <RegisterView />
    </LazyPage>
  );
}
