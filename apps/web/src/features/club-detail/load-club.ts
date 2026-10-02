import 'server-only';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { isClubStub, type ClubEvent, type ClubOrStub } from '@book-club/contracts';
import { serverApi } from '@/lib/server-api';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const CLUB_REVALIDATE_SECONDS = 600;
// the club page has no client fallback for a failed fetch, and a cold Render backend needs 30-60 s to wake
export const CLUB_FETCH_TIMEOUT_MS = 9000;

const isMissing = (err: unknown): boolean => {
  const status = (err as { status?: unknown } | null)?.status;
  return status === 404 || status === 422;
};

export interface ClubDetailData {
  club: ClubOrStub;
  events: ClubEvent[];
}

/**
 * Anonymous and ISR-cached, so the backend's answer for a guest is what every visitor's HTML contains.
 * 404 is the only "missing" answer (Angular shows its not-found panel for any failure; here a transient failure
 * throws to the error boundary instead of being cached as a missing club).
 * A private club the anonymous caller cannot view comes back as a stub (name and member count only) with no events.
 * Events are best-effort, as in Angular: a failed list renders as empty.
 */
export const loadClub = cache(async (id: string): Promise<ClubDetailData> => {
  if (!UUID.test(id)) notFound();
  const key = id.toLowerCase();
  const api = serverApi({ revalidate: CLUB_REVALIDATE_SECONDS, tags: [`club:${key}`] }, { timeoutMs: CLUB_FETCH_TIMEOUT_MS });
  const [club, events] = await Promise.allSettled([api.clubs.get(key), api.clubs.events(key)]);
  if (club.status === 'rejected') {
    if (isMissing(club.reason)) notFound();
    throw club.reason;
  }
  // an older backend may answer an anonymous caller with the full record of a private club: never let it reach the page
  if (!isClubStub(club.value) && !club.value.isPublic) {
    const { id: clubId, name, memberCount } = club.value;
    return { club: { id: clubId, name, isPublic: false, memberCount }, events: [] };
  }
  return { club: club.value, events: events.status === 'fulfilled' ? events.value : [] };
});
