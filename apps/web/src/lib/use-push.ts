'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { hardNavigate } from '@/lib/navigate';
import { useEnabledRoutes } from '@/strangler/context';
import { matchRoute } from '@/strangler/routes';

/** Pushes a history entry; stays in the router for Next-owned targets, leaves it for legacy ones. */
export function usePush(): (path: string) => void {
  const router = useRouter();
  const enabled = useEnabledRoutes();
  return useCallback(
    (path) => {
      const route = matchRoute(path.split(/[?#]/, 1)[0] ?? '');
      if (route && enabled.includes(route.pattern)) router.push(path);
      else hardNavigate(path);
    },
    [router, enabled],
  );
}
