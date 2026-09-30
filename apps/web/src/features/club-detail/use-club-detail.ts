'use client';
'use no memo';

import { useQuery } from '@tanstack/react-query';
import type { Club, ClubEvent } from '@book-club/contracts';
import { api } from '@/lib/api';
import { showToast } from '@/lib/toast';
import { useMyClubs } from '@/features/clubs/use-clubs';
import { useSession } from '@/features/clubs/use-session';
import { describeError, isReported } from './describe-error';

const noRefocus = { refetchOnWindowFocus: false } as const;

export const membershipKey = (clubId: string) => ['club', clubId, 'membership'] as const;
export const eventsKey = (clubId: string, authed: boolean) => ['club', clubId, 'events', authed ? 'authed' : 'public'] as const;
export const pastEventsKey = (clubId: string) => ['club', clubId, 'events', 'past'] as const;
export const membersKey = (clubId: string) => ['club', clubId, 'members'] as const;
export const voteKey = (clubId: string) => ['club', clubId, 'book-vote'] as const;

export function toastError(err: unknown, t: (key: string) => string): void {
  if (!isReported(err)) showToast('error', describeError(err, t));
}

/** Who the viewer is relative to this club; `ready` is false until the session and (when signed in) /clubs/my resolve. */
export function useClubRole(club: Pick<Club, 'id' | 'organizerId'>) {
  const { user, isPending } = useSession();
  const mine = useMyClubs(user !== null);
  const isOwner = user !== null && user.id === club.organizerId;
  const isMember = user !== null && (mine.data?.some((c) => c.id === club.id) ?? false);
  const ready = !isPending && (user === null || !mine.isPending);
  return { user, isAuthenticated: user !== null, ready, isOwner, isMember };
}

export function useMyMembership(clubId: string, enabled: boolean) {
  return useQuery({ queryKey: membershipKey(clubId), queryFn: () => api.clubs.myMembership(clubId), enabled, ...noRefocus });
}

/** `initial` is the anonymous server list; a signed-in viewer refetches once because isAttending is per user. */
export function useClubEvents(clubId: string, initial: readonly ClubEvent[], authed: boolean): readonly ClubEvent[] {
  const query = useQuery({
    queryKey: eventsKey(clubId, authed),
    queryFn: () => api.clubs.events(clubId),
    enabled: authed,
    ...noRefocus,
  });
  return authed && query.data ? query.data : initial;
}

export function useClubMembers(clubId: string, enabled: boolean) {
  return useQuery({
    queryKey: membersKey(clubId),
    // a non-member may be refused; that must neither redirect nor break the page
    queryFn: () => api.members.list(clubId, {}, { skipAuthRedirect: true }),
    enabled,
    retry: false,
    ...noRefocus,
  });
}
