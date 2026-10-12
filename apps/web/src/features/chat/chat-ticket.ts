import 'client-only';
import { api } from '@/lib/api';

const statusOf = (err: unknown): number | null =>
  typeof err === 'object' && err !== null && typeof (err as { status?: unknown }).status === 'number' ? (err as { status: number }).status : null;

/** Direct to the backend (Vercel does not proxy WebSockets); the same value must be allowed by the CSP connect-src. */
export const WS_BASE_URL = (process.env.NEXT_PUBLIC_WS_URL || 'wss://book-club-be.onrender.com/api/v1').replace(/\/+$/, '');

/** A single-use ticket per connection attempt. No session means null (stop); anything else, such as offline, throws so the socket retries. */
export async function fetchWsTicket(): Promise<string | null> {
  try {
    return (await api.auth.wsTicket({ suppressErrorToast: true })).ticket;
  } catch (err) {
    const status = statusOf(err);
    if (status === 401 || status === 403) return null;
    throw err;
  }
}
