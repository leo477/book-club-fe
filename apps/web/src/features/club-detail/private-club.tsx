'use client';
'use no memo';

import { useQuery } from '@tanstack/react-query';
import type { Club, ClubOrStub, ClubStub } from '@book-club/contracts';
import { useTranslations } from 'next-intl';
import { lazy, Suspense, useEffect, type ReactNode } from 'react';
import { LazyBoundary } from '@/components/lazy-boundary';
import { useSession } from '@/features/clubs/use-session';
import { api } from '@/lib/api';
import { clubKey } from './use-club-detail';

const ClubView = lazy(() => import('./club-view').then((m) => ({ default: m.ClubView })));

const isFull = (club: ClubOrStub): club is Club => club.organizerId !== undefined;

/**
 * The ISR page only ever holds the anonymous answer, which for a private club is the stub. A signed-in viewer asks again
 * with their own credentials: members, organizers and admins get the full club and the page swaps to the full view.
 * `children` is the server-rendered stub view, kept for everyone else (and while the full view loads).
 */
export function PrivateClubGate({ stub, children }: { stub: ClubStub; children: ReactNode }) {
  const { user } = useSession();
  const tSeo = useTranslations('SEO');
  const query = useQuery({
    queryKey: clubKey(stub.id),
    queryFn: () => api.clubs.get(stub.id, { skipAuthRedirect: true, suppressErrorToast: true }),
    enabled: user !== null,
    retry: false,
    refetchOnWindowFocus: false,
  });
  const current = query.data;
  const upgradedName = current && isFull(current) ? current.name : null;
  useEffect(() => {
    if (upgradedName) document.title = tSeo('club_detail_title', { name: upgradedName });
  }, [upgradedName, tSeo]);
  if (!current || !isFull(current)) return children;
  return (
    <LazyBoundary fallback={children}>
      <Suspense fallback={children}>
        <ClubView club={current} events={[]} />
      </Suspense>
    </LazyBoundary>
  );
}
