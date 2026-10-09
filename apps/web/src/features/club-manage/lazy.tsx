'use client';

import { lazy } from 'react';
import { LazyPage } from '@/components/lazy-page';

const ClubManage = lazy(() => import('./club-manage').then((m) => ({ default: m.ClubManage })));

/** The dashboard, moderation and settings code loads on demand, after the role gate has admitted the user. */
export const LazyClubManage = ({ id }: { id: string }) => (
  <LazyPage>
    <ClubManage id={id} />
  </LazyPage>
);
