import 'server-only';
import { createApi, createApiClient } from '@book-club/api-client';

const BACKEND_API_URL = process.env['BACKEND_API_URL'] ?? 'https://book-club-be.onrender.com/api/v1';

const noop = () => undefined;

/** Anonymous backend client for server code: never carries user cookies, so cached data is public-only. */
export function serverApi(next: { revalidate: number; tags?: string[] }) {
  return createApi(
    createApiClient({
      baseUrl: BACKEND_API_URL,
      transport: {
        getAccessToken: () => null,
        hasSession: () => false,
        getRefreshBody: () => null,
        storeTokens: noop,
        clear: noop,
      },
      fetch: (input, init) => fetch(input, { ...init, next }),
    }),
  );
}
