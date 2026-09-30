import 'server-only';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import type { Club, ClubEvent } from '@book-club/contracts';
import { serverApi } from '@/lib/server-api';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const CLUB_REVALIDATE_SECONDS = 600;

const isMissing = (err: unknown): boolean => {
  const status = (err as { status?: unknown } | null)?.status;
  return status === 404 || status === 422;
};

export interface ClubDetailData {
  club: Club;
  events: ClubEvent[];
}

/**
 * Anonymous and ISR-cached, so the backend's answer for a guest is what every visitor's HTML contains.
 * 404 is the only "missing" answer (Angular shows its not-found panel for any failure; here a transient failure
 * throws to the error boundary instead of being cached as a missing club).
 * Events are best-effort, as in Angular: a failed list renders as empty.
 */
export const loadClub = cache(async (id: string): Promise<ClubDetailData> => {
  if (!UUID.test(id)) notFound();
  const api = serverApi({ revalidate: CLUB_REVALIDATE_SECONDS, tags: [`club:${id}`] });
  const [club, events] = await Promise.allSettled([api.clubs.get(id), api.clubs.events(id)]);
  if (club.status === 'rejected') {
    if (isMissing(club.reason)) notFound();
    throw club.reason;
  }
  return { club: club.value, events: events.status === 'fulfilled' ? events.value : [] };
});
