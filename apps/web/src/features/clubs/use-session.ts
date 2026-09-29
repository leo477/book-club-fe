'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { hasSessionHint } from '@/lib/session-hint';

export const sessionKey = ['session'] as const;

/** Guests resolve to null without an /auth/me call; any failure means guest (no login redirect on public pages). */
export function useSession() {
  const query = useQuery({
    queryKey: sessionKey,
    queryFn: async () => ((await hasSessionHint()) ? api.auth.me({ skipAuthRedirect: true }) : null),
    refetchOnWindowFocus: false,
    retry: false,
  });
  return { user: query.data ?? null, isPending: query.isPending };
}
