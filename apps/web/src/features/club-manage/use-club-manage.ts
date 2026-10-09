'use client';
'use no memo';

import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toastError } from '@/features/club-detail/use-club-detail';
import { api } from '@/lib/api';

const noRefocus = { refetchOnWindowFocus: false } as const;

export const statsKey = (clubId: string) => ['club', clubId, 'stats'] as const;
export const bansKey = (clubId: string) => ['club', clubId, 'bans'] as const;
export const requestsKey = (clubId: string) => ['club', clubId, 'join-requests'] as const;

export const useClubStats = (clubId: string) =>
  useQuery({ queryKey: statsKey(clubId), queryFn: ({ signal }) => api.clubs.stats(clubId, { signal }), retry: false, ...noRefocus });

export const useBans = (clubId: string) =>
  useQuery({ queryKey: bansKey(clubId), queryFn: ({ signal }) => api.members.bans(clubId, {}, { signal }), retry: false, ...noRefocus });

export const useJoinRequests = (clubId: string) =>
  useQuery({ queryKey: requestsKey(clubId), queryFn: ({ signal }) => api.members.joinRequests(clubId, {}, { signal }), retry: false, ...noRefocus });

export const isAbort = (err: unknown): boolean => typeof err === 'object' && err !== null && (err as { name?: unknown }).name === 'AbortError';

/** Whether the component is still on screen, for async code that must not toast or set state after it left. */
export function useMounted(): () => boolean {
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  return useCallback(() => mounted.current, []);
}

/**
 * Runs one request per key at a time. The guard is a ref, not state: a second click can arrive before the render
 * that disables the button. A failure toasts unless the request was aborted or the component is already gone.
 */
export function useGuardedRunner() {
  const tErrors = useTranslations('ERRORS');
  const isMounted = useMounted();
  const active = useRef(new Set<string>());
  const [busy, setBusy] = useState<ReadonlySet<string>>(() => new Set());

  const run = useCallback(
    async (key: string, task: () => Promise<void>): Promise<boolean> => {
      if (active.current.has(key)) return false;
      active.current.add(key);
      setBusy(new Set(active.current));
      try {
        await task();
        return true;
      } catch (err) {
        if (isMounted() && !isAbort(err)) toastError(err, tErrors);
        return false;
      } finally {
        active.current.delete(key);
        if (isMounted()) setBusy(new Set(active.current));
      }
    },
    [tErrors, isMounted],
  );

  return { run, busy, isMounted };
}
