'use client';

import { lazy } from 'react';
import { LazyPage } from '@/components/lazy-page';

const Randomizer = lazy(() => import('./randomizer').then((m) => ({ default: m.Randomizer })));

export const LazyRandomizer = ({ clubId }: { clubId: string }) => (
  <LazyPage>
    <Randomizer clubId={clubId} />
  </LazyPage>
);
