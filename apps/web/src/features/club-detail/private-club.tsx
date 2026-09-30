'use client';
'use no memo';

import { useQuery } from '@tanstack/react-query';
import type { Club, ClubOrStub, ClubStub } from '@book-club/contracts';
import { lazy, Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { LazyBoundary } from '@/components/lazy-boundary';
import { useSession } from '@/features/clubs/use-session';
import { api } from '@/lib/api';
import { ActionError, JoinCta } from './membership';
import { Hero, PrivateBadge } from './sections';
import { clubKey } from './use-club-detail';

const ClubView = lazy(() => import('./club-view').then((m) => ({ default: m.ClubView })));

const isFull = (club: ClubOrStub): club is Club => club.organizerId !== undefined;

/**
 * The ISR page only ever holds the anonymous answer, which for a private club is the stub. A signed-in viewer asks again
 * with their own credentials: members, organizers and admins get the full club and the page swaps to the full view.
 */
export function PrivateClub({ stub }: { stub: ClubStub }) {
  const { user } = useSession();
  const query = useQuery({
    queryKey: clubKey(stub.id),
    queryFn: () => api.clubs.get(stub.id, { skipAuthRedirect: true, suppressErrorToast: true }),
    enabled: user !== null,
    retry: false,
    refetchOnWindowFocus: false,
  });
  const current = query.data ?? stub;
  if (!isFull(current)) return <StubView stub={current} />;
  const fallback = <StubView stub={stub} />;
  return (
    <LazyBoundary fallback={fallback}>
      <Suspense fallback={fallback}>
        <ClubView club={current} events={[]} />
      </Suspense>
    </LazyBoundary>
  );
}

function StubView({ stub }: { stub: ClubStub }) {
  const t = useTranslations('CLUB_DETAIL');
  return (
    <section className="min-h-screen">
      <Hero club={{ name: stub.name, coverUrl: null }} />
      <div className="page-max-w px-6 py-8">
        <div className="mx-auto flex max-w-3xl flex-col gap-6">
          <div className="flex items-center gap-3 flex-wrap">
            <PrivateBadge club={stub} />
          </div>
          <ActionError />
          <div data-testid="private-stub" className="parchment-card-sunken flex flex-col gap-6 px-6 py-6 text-sm">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">{t('private_stub_title')}</h2>
            <p className="text-gray-700 dark:text-gray-300">{t('private_stub_desc')}</p>
            <p className="text-[var(--color-ink-muted)]">{t('private_stub_members', { count: stub.memberCount })}</p>
          </div>
          <JoinCta club={stub} />
        </div>
      </div>
    </section>
  );
}
