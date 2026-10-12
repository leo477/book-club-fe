import { CSP_WS_ORIGIN } from '../strangler/csp';

export const DEV_WS_BASE_URL = 'ws://localhost:8000/api/v1';

/** Validates NEXT_PUBLIC_WS_URL (inlined into the client bundle at build time); a production build must not ship without it or with a plaintext socket. */
export function checkWsBaseUrl(env: Record<string, string | undefined> = process.env): string | null {
  const raw = env['NEXT_PUBLIC_WS_URL'];
  const production = env['NODE_ENV'] === 'production' || env['VERCEL_ENV'] === 'production';
  if (!raw) {
    if (production) throw new Error('NEXT_PUBLIC_WS_URL is required for a production build (backend WebSocket base, e.g. wss://book-club-be.onrender.com/api/v1)');
    return null;
  }
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error(`NEXT_PUBLIC_WS_URL is not a valid absolute URL: ${raw}`);
  }
  if (url.protocol !== 'wss:' && !(!production && url.protocol === 'ws:')) {
    throw new Error(`NEXT_PUBLIC_WS_URL must be wss${production ? '' : ' (or ws in development)'}: ${raw}`);
  }
  if (production && url.origin !== CSP_WS_ORIGIN) {
    throw new Error(`NEXT_PUBLIC_WS_URL origin ${url.origin} is not the origin the CSP connect-src allows (${CSP_WS_ORIGIN}); update csp.ts and vercel.json together with it`);
  }
  if (url.search || url.hash || raw.endsWith('/')) throw new Error(`NEXT_PUBLIC_WS_URL must have no trailing slash, query or fragment: ${raw}`);
  return raw;
}
