'use client';
'use no memo';

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { PAGE_SIZE, flatten, nextSkip } from '@/features/club-shared/paged-list';

const noRefocus = { refetchOnWindowFocus: false } as const;

export const statsKey = (clubId: string) => ['club', clubId, 'stats'] as const;
export const bansKey = (clubId: string) => ['club', clubId, 'bans'] as const;
export const requestsKey = (clubId: string) => ['club', clubId, 'join-requests'] as const;

export const useClubStats = (clubId: string) =>
  useQuery({ queryKey: statsKey(clubId), queryFn: ({ signal }) => api.clubs.stats(clubId, { signal }), retry: false, ...noRefocus });

export const useBans = (clubId: string) =>
  useInfiniteQuery({
    queryKey: bansKey(clubId),
    queryFn: ({ pageParam, signal }) => api.members.bans(clubId, { skip: pageParam, limit: PAGE_SIZE }, { signal }),
    initialPageParam: 0,
    getNextPageParam: nextSkip,
    select: flatten,
    retry: false,
    ...noRefocus,
  });

export const useJoinRequests = (clubId: string) =>
  useInfiniteQuery({
    queryKey: requestsKey(clubId),
    queryFn: ({ pageParam, signal }) => api.members.joinRequests(clubId, { skip: pageParam, limit: PAGE_SIZE }, { signal }),
    initialPageParam: 0,
    getNextPageParam: nextSkip,
    select: flatten,
    retry: false,
    ...noRefocus,
  });

