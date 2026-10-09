'use client';
'use no memo';

import { isClubStub, type Club } from '@book-club/contracts';
import { useTranslations } from 'next-intl';
import { useState, type ReactNode } from 'react';
import { AppLink } from '@/components/app-link';
import { ErrorPanel } from '@/components/error-panel';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useMyMembership } from '@/features/club-detail/use-club-detail';
import { useSession } from '@/features/clubs/use-session';
import { useClubForEdit } from '@/features/organizer/use-organizer';

const statusOf = (err: unknown): number | null =>
  typeof err === 'object' && err !== null && typeof (err as { status?: unknown }).status === 'number' ? (err as { status: number }).status : null;

const Busy = () => (
  <div className="page-container py-16 flex justify-center" aria-busy="true">
    <Spinner />
  </div>
);

function Notice({ title, back }: { title: string; back: { href: string; label: string } }) {
  return (
    <div className="page-container py-16 text-center" role="alert">
      <p className="text-6xl mb-4" aria-hidden="true">
        😕
      </p>
      <h2 className="text-2xl font-semibold text-[var(--color-ink)] mb-2">{title}</h2>
      <Button asChild className="bg-primary-600 hover:bg-primary-700 text-white">
        <AppLink href={back.href}>← {back.label}</AppLink>
      </Button>
    </div>
  );
}

// only decides what is shown; the backend refuses everyone else
export function OrganizerOfClub({ clubId, children }: { clubId: string; children: (club: Club) => ReactNode }) {
  const tDetail = useTranslations('CLUB_DETAIL');
  const tErrors = useTranslations('ERRORS');
  const { user, isPending: sessionPending } = useSession();
  const query = useClubForEdit(clubId);
  // a cached club or role from an earlier visit is shown only after this visit has re-checked it
  const [mountedAt] = useState(() => Date.now());
  const club = query.data && !isClubStub(query.data) ? query.data : null;
  const isOwner = club !== null && user !== null && club.organizerId === user.id;
  const membership = useMyMembership(clubId, club !== null && user !== null && !isOwner, true);
  const checked = membership.dataUpdatedAt >= mountedAt;

  const missing = <Notice title={tDetail('not_found')} back={{ href: '/clubs', label: tDetail('back') }} />;
  const denied = <Notice title={tErrors('organizers_only')} back={{ href: `/clubs/${clubId}`, label: tDetail('back_short') }} />;

  if (query.isPending) return <Busy />;
  if (query.isError) {
    const status = statusOf(query.error);
    if (status === 404) return missing;
    if (status === 403) return denied;
    return <ErrorPanel onRetry={() => void query.refetch()} />;
  }
  if (query.dataUpdatedAt < mountedAt) return <Busy />;
  if (!club) return missing;
  if (user === null) return sessionPending ? <Busy /> : denied;
  if (!isOwner) {
    if (membership.isError) return <ErrorPanel onRetry={() => void membership.refetch()} />;
    if (membership.isPending || !checked) return <Busy />;
    if (membership.data?.role !== 'organizer') return denied;
  }
  return children(club);
}
