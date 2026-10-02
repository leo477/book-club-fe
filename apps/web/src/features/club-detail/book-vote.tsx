'use client';
'use no memo';

import type { Club } from '@book-club/contracts';
import { lazy, Suspense } from 'react';
import { LazyBoundary } from '@/components/lazy-boundary';
import { useClubRole } from './use-club-detail';

// only members and the organizer vote, so this code is fetched after the session resolves, not with the page
const BookVoteSection = lazy(() => import('./book-vote-section').then((m) => ({ default: m.BookVoteSection })));

/** Visible to members and the organizer; the organizer also runs the rounds. */
export function BookVote({ club }: { club: Pick<Club, 'id' | 'organizerId'> }) {
  const role = useClubRole(club);
  if (!role.ready || (!role.isMember && !role.isOwner)) return null;
  return (
    <LazyBoundary fallback={null}>
      <Suspense fallback={null}>
        <BookVoteSection clubId={club.id} isOwner={role.isOwner} isMember={role.isMember} />
      </Suspense>
    </LazyBoundary>
  );
}
