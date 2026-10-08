'use client';

import { lazy } from 'react';
import { LazyPage } from '@/components/lazy-page';

const CreateSubmission = lazy(() => import('./create-submission').then((m) => ({ default: m.CreateSubmission })));

export function LazyCreateSubmission() {
  return (
    <LazyPage>
      <CreateSubmission />
    </LazyPage>
  );
}
