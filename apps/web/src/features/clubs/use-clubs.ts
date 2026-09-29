'use client';

import { useQuery } from '@tanstack/react-query';
import type { Club } from '@book-club/contracts';
import { api } from '@/lib/api';

export const clubsKey = ['clubs', 'public'] as const;
export const myClubsKey = ['clubs', 'my'] as const;

const noRefocus = { refetchOnWindowFocus: false } as const;

/** `initial` is the server-rendered public list; while it is fresh the browser skips GET /clubs. */
export function usePublicClubs(initial: readonly Club[] | null) {
  return useQuery({
    queryKey: clubsKey,
    queryFn: () => api.clubs.list(),
    ...(initial && { initialData: [...initial] }),
    ...noRefocus,
  });
}

export function useMyClubs(enabled: boolean) {
  return useQuery({ queryKey: myClubsKey, queryFn: () => api.clubs.mine(), enabled, ...noRefocus });
}

export function filterClubs(clubs: readonly Club[], query: string, city: string | null = null): Club[] {
  const q = query.toLowerCase().trim();
  return clubs.filter(
    (c) =>
      (!q || c.name.toLowerCase().includes(q) || (c.description?.toLowerCase().includes(q) ?? false)) &&
      (!city || c.city === city),
  );
}
