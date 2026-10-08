'use client';
'use no memo';

import type { Club, ClubEvent } from '@book-club/contracts';
import { lazy, Suspense, useSyncExternalStore, type ReactNode } from 'react';
import { LazyBoundary } from '@/components/lazy-boundary';

// Radix Tabs, tailwind-merge and the RSVP/moderation code would not fit the first-load budget, so they load after hydration
const ClubEventsInteractive = lazy(() => import('./club-events').then((m) => ({ default: m.ClubEventsInteractive })));

interface EventsSectionProps {
  club: Pick<Club, 'id' | 'organizerId'>;
  initialEvents: readonly ClubEvent[];
  /** the server-rendered upcoming list: shown first and kept if the island cannot load */
  children: ReactNode;
}

const noSubscription = () => () => undefined;
/** false for the server render and the hydration pass, true afterwards */
const useHydrated = () => useSyncExternalStore(noSubscription, () => true, () => false);

export function EventsSection({ club, initialEvents, children }: EventsSectionProps) {
  if (!useHydrated()) return children;
  return (
    <LazyBoundary fallback={children}>
      <Suspense fallback={children}>
        <ClubEventsInteractive club={club} initialEvents={initialEvents} />
      </Suspense>
    </LazyBoundary>
  );
}
