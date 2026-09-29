const TTL_MS = 30_000;
const URL_PATH = '/api/v1/auth/session-status';

let cache: { value: boolean; at: number } | null = null;
let inflight: Promise<boolean> | null = null;

/**
 * Cheap client-side session hint: the unauthenticated /auth/session-status probe
 * (httpOnly refresh-cookie presence), cached in memory for 30s. Any failure means "guest",
 * so a guest never triggers refresh or a login redirect.
 */
export function hasSessionHint(doFetch: typeof fetch = fetch, now: () => number = Date.now): Promise<boolean> {
  if (cache && now() - cache.at < TTL_MS) return Promise.resolve(cache.value);
  inflight ??= doFetch(URL_PATH, { credentials: 'include' })
    .then(async (res) => {
      const body: unknown = res.ok ? await res.json() : null;
      return typeof body === 'object' && body !== null && (body as { hasSession?: unknown }).hasSession === true;
    })
    .catch(() => false)
    .then((value) => {
      cache = { value, at: now() };
      return value;
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

export function resetSessionHint(): void {
  cache = null;
  inflight = null;
}
