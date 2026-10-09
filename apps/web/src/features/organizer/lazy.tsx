'use client';

import { lazy } from 'react';
import { LazyPage } from '@/components/lazy-page';
import { OrganizerOfClub } from '@/features/club-manage/organizer-gate';

const CreateClub = lazy(() => import('./create-club').then((m) => ({ default: m.CreateClub })));
const EditClub = lazy(() => import('./edit-club').then((m) => ({ default: m.EditClub })));
const CreateEvent = lazy(() => import('./create-event').then((m) => ({ default: m.CreateEvent })));
const EditEvent = lazy(() => import('./edit-event').then((m) => ({ default: m.EditEvent })));

/** Each route's form code (react-hook-form, zod, cmdk, popover) loads on demand, after the gate has admitted the user (the per-club gate for edit club and create event). */
export const LazyCreateClub = () => (
  <LazyPage>
    <CreateClub />
  </LazyPage>
);

export const LazyEditClub = ({ id }: { id: string }) => (
  <OrganizerOfClub clubId={id}>
    {() => (
      <LazyPage>
        <EditClub id={id} />
      </LazyPage>
    )}
  </OrganizerOfClub>
);

export const LazyCreateEvent = ({ clubId }: { clubId: string }) => (
  <OrganizerOfClub clubId={clubId}>
    {() => (
      <LazyPage>
        <CreateEvent clubId={clubId} />
      </LazyPage>
    )}
  </OrganizerOfClub>
);

export const LazyEditEvent = ({ id }: { id: string }) => (
  <LazyPage>
    <EditEvent id={id} />
  </LazyPage>
);
