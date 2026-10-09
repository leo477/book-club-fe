'use client';
'use no memo';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { LIST_LIMIT } from '@/features/club-shared/list-limit';

const noRefocus = { refetchOnWindowFocus: false } as const;

export const statsKey = (clubId: string) => ['club', clubId, 'stats'] as const;
export const bansKey = (clubId: string) => ['club', clubId, 'bans'] as const;
export const requestsKey = (clubId: string) => ['club', clubId, 'join-requests'] as const;

export const useClubStats = (clubId: string) =>
  useQuery({ queryKey: statsKey(clubId), queryFn: ({ signal }) => api.clubs.stats(clubId, { signal }), retry: false, ...noRefocus });

export const useBans = (clubId: string) =>
  useQuery({ queryKey: bansKey(clubId), queryFn: ({ signal }) => api.members.bans(clubId, { limit: LIST_LIMIT }, { signal }), retry: false, ...noRefocus });

export const useJoinRequests = (clubId: string) =>
  useQuery({ queryKey: requestsKey(clubId), queryFn: ({ signal }) => api.members.joinRequests(clubId, { limit: LIST_LIMIT }, { signal }), retry: false, ...noRefocus });

