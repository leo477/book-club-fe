import 'server-only';
import { createApi, createApiClient } from '@book-club/api-client';
import { backendApiUrl } from './backend-origin';

// a cold or down backend must not stall the SSR of a page that can fall back to a client fetch
const SERVER_TIMEOUT_MS = 3000;

const noop = () => undefined;

/** Anonymous backend client for server code: never carries user cookies, so cached data is public-only. */
export function serverApi(next: { revalidate: number; tags?: string[] }, options: { timeoutMs?: number } = {}) {
  const timeoutMs = options.timeoutMs ?? SERVER_TIMEOUT_MS;
  return createApi(
    createApiClient({
      baseUrl: backendApiUrl(),
      transport: {
        getAccessToken: () => null,
        hasSession: () => false,
        getRefreshBody: () => null,
        storeTokens: noop,
        clear: noop,
      },
      fetch: (input, init) => {
        const timeout = AbortSignal.timeout(timeoutMs);
        return fetch(input, { ...init, next, signal: init?.signal ? AbortSignal.any([init.signal, timeout]) : timeout });
      },
    }),
  );
}
