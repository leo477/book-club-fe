import type { QueryClient } from '@tanstack/react-query';
import { invalidateClub } from './invalidate-club';

const open = new WeakMap<QueryClient, Map<string, number>>();

const count = (queryClient: QueryClient, clubId: string): number => open.get(queryClient)?.get(clubId) ?? 0;

/** Whether any member, ban or join-request action of this club is still waiting for the backend. */
export const clubActionsInFlight = (queryClient: QueryClient, clubId: string): boolean => count(queryClient, clubId) > 0;

function adjust(queryClient: QueryClient, clubId: string, by: 1 | -1): number {
  const perClub = open.get(queryClient) ?? new Map<string, number>();
  open.set(queryClient, perClub);
  const next = count(queryClient, clubId) + by;
  if (next === 0) perClub.delete(clubId);
  else perClub.set(clubId, next);
  return next;
}

/**
 * Runs one club action and counts it for every component of the club. The cache is refreshed only when the last
 * open action ends: a refetch earlier returns the server's older view and would undo an optimistic change of another action.
 */
export async function trackClubAction<T>(queryClient: QueryClient, clubId: string, task: () => Promise<T>): Promise<T> {
  adjust(queryClient, clubId, 1);
  try {
    return await task();
  } finally {
    if (adjust(queryClient, clubId, -1) === 0) void invalidateClub(queryClient, clubId);
  }
}
