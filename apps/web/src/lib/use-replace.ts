'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { replaceNavigate } from '@/lib/navigate';
import { useEnabledRoutes } from '@/strangler/context';
import { matchRoute } from '@/strangler/routes';

/** Replaces the current history entry; stays in the router for Next-owned targets, leaves it for legacy ones. */
export function useReplace(): (path: string) => void {
  const router = useRouter();
  const enabled = useEnabledRoutes();
  return useCallback(
    (path) => {
      const route = matchRoute(path.split(/[?#]/, 1)[0] ?? '');
      if (route && enabled.includes(route.pattern)) router.replace(path);
      else replaceNavigate(path);
    },
    [router, enabled],
  );
}
