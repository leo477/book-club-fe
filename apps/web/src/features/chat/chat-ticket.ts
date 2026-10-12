import 'client-only';
import { api } from '@/lib/api';
import { DEV_WS_BASE_URL } from '@/lib/ws-base-url';

const statusOf = (err: unknown): number | null =>
  typeof err === 'object' && err !== null && typeof (err as { status?: unknown }).status === 'number' ? (err as { status: number }).status : null;

/** Direct to the backend (Vercel does not proxy WebSockets); a production build refuses to run without NEXT_PUBLIC_WS_URL. */
export const wsBaseUrl = (): string => (process.env.NEXT_PUBLIC_WS_URL || DEV_WS_BASE_URL).replace(/\/+$/, '');

const quiet = { skipAuthRedirect: true, suppressErrorToast: true } as const;

/**
 * A single-use ticket per connection attempt. Background call: a 403 never navigates away. A 401 gets one session refresh
 * through /auth/me (which logs out if the session is really dead) and one retry. No session means null (stop);
 * anything else, such as being offline, throws so the socket retries.
 */
export async function fetchWsTicket(): Promise<string | null> {
  try {
    return (await api.auth.wsTicket(quiet)).ticket;
  } catch (err) {
    const status = statusOf(err);
    if (status === 403) return null;
    if (status !== 401) throw err;
  }
  try {
    await api.auth.me();
    return (await api.auth.wsTicket(quiet)).ticket;
  } catch (err) {
    const status = statusOf(err);
    if (status === 401 || status === 403) return null;
    throw err;
  }
}
