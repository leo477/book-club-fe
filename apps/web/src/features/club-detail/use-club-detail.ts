'use client';
'use no memo';

import { useQuery } from '@tanstack/react-query';
import type { ClubEvent } from '@book-club/contracts';
import { LIST_LIMIT } from '@/features/club-shared/list-limit';
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

export interface ClubRef {
  id: string;
  organizerId?: string | undefined;
}

export const clubKey = (clubId: string) => ['club', clubId, 'detail'] as const;

/** Who the viewer is relative to this club; `ready` is false until the session and (when signed in) /clubs/my resolve. */
export function useClubRole(club: ClubRef) {
  const { user, isPending } = useSession();
  const mine = useMyClubs(user !== null);
  const isOwner = user !== null && club.organizerId !== undefined && user.id === club.organizerId;
  const isMember = user !== null && (mine.data?.some((c) => c.id === club.id) ?? false);
  const ready = !isPending && (user === null || !mine.isPending);
  return { user, isAuthenticated: user !== null, ready, isOwner, isMember };
}

/** `fresh` is for gates: no retry delay on failure, and a cached answer is re-checked on mount. */
export function useMyMembership(clubId: string, enabled: boolean, fresh = false) {
  return useQuery({
    queryKey: membershipKey(clubId),
    queryFn: () => api.clubs.myMembership(clubId),
    enabled,
    ...(fresh ? { retry: false, staleTime: 0, refetchOnMount: 'always' as const } : {}),
    ...noRefocus,
  });
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
    queryFn: ({ signal }) => api.members.list(clubId, { limit: LIST_LIMIT }, { skipAuthRedirect: true, signal }),
    enabled,
    retry: false,
    ...noRefocus,
  });
}
