'use client';
'use no memo';

import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toastError } from '@/features/club-detail/use-club-detail';

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
