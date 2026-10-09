'use client';

import { lazy } from 'react';
import { LazyPage } from '@/components/lazy-page';

const CreateClub = lazy(() => import('./create-club').then((m) => ({ default: m.CreateClub })));
const EditClub = lazy(() => import('./edit-club').then((m) => ({ default: m.EditClub })));
const CreateEvent = lazy(() => import('./create-event').then((m) => ({ default: m.CreateEvent })));
const EditEvent = lazy(() => import('./edit-event').then((m) => ({ default: m.EditEvent })));

/** Each route's form code (react-hook-form, zod, cmdk, popover) loads on demand, after the role gate has admitted the user. */
export const LazyCreateClub = () => (
  <LazyPage>
    <CreateClub />
  </LazyPage>
);

export const LazyEditClub = ({ id }: { id: string }) => (
  <LazyPage>
    <EditClub id={id} />
  </LazyPage>
);

export const LazyCreateEvent = ({ clubId }: { clubId: string }) => (
  <LazyPage>
    <CreateEvent clubId={clubId} />
  </LazyPage>
);

export const LazyEditEvent = ({ id }: { id: string }) => (
  <LazyPage>
    <EditEvent id={id} />
  </LazyPage>
);
