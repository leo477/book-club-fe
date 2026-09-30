'use client';
'use no memo';

import type { Club } from '@book-club/contracts';
import { lazy, Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { LazyBoundary } from '@/components/lazy-boundary';
import { useClubRole } from './use-club-detail';

// the list, its QR and moderation code are for signed-in viewers only, so they are fetched after the session resolves
const MemberList = lazy(() => import('./member-list').then((m) => ({ default: m.MemberList })));

/** Guests (and, until the session resolves, everyone) see only the count: the member list requires a session. */
export function Members({ club }: { club: Pick<Club, 'id' | 'organizerId' | 'memberCount'> }) {
  const role = useClubRole(club);
  if (!role.isAuthenticated) return <GuestMembers count={club.memberCount} />;
  return (
    <LazyBoundary fallback={<GuestMembers count={club.memberCount} />}>
      <Suspense fallback={<MembersSkeleton />}>
        <MemberList clubId={club.id} isOwner={role.isOwner} />
      </Suspense>
    </LazyBoundary>
  );
}

function MembersSkeleton() {
  return (
    <div className="parchment-card-sunken px-6 py-8 flex flex-col gap-3" aria-busy="true">
      <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      <div className="h-20 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-3" />
    </div>
  );
}

function GuestMembers({ count }: { count: number }) {
  const t = useTranslations('CLUB_DETAIL');
  return (
    <div data-testid="guest-members-hidden" className="parchment-card-sunken px-6 py-6">
      <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">{t('members_title')}</h2>
      <p className="text-sm text-[var(--color-ink-muted)]">{t('guest_members_hidden', { count })}</p>
    </div>
  );
}

