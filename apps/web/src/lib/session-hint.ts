const TTL_MS = 30_000;
// a failed probe is retried soon: caching "guest" for 30s would hide a signed-in user's session after a blip
const FAILURE_TTL_MS = 2_000;
export const PROBE_TIMEOUT_MS = 4_000;
const URL_PATH = '/api/v1/auth/session-status';

let cache: { value: boolean; at: number; ttl: number } | null = null;
let inflight: Promise<boolean> | null = null;

interface Probe {
  value: boolean;
  ok: boolean;
}

async function probe(doFetch: typeof fetch): Promise<Probe> {
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  // raced as well as aborted: a fetch stub (or a stalled body read) that ignores the signal must not hang the session
  const timeout = new Promise<Probe>((resolve) => {
    timer = setTimeout(() => {
      controller.abort();
      resolve({ value: false, ok: false });
    }, PROBE_TIMEOUT_MS);
  });
  const request = (async (): Promise<Probe> => {
    try {
      const res = await doFetch(URL_PATH, { credentials: 'include', signal: controller.signal });
      if (!res.ok) return { value: false, ok: false };
      const body: unknown = await res.json();
      return { value: typeof body === 'object' && body !== null && (body as { hasSession?: unknown }).hasSession === true, ok: true };
    } catch {
      return { value: false, ok: false };
    }
  })();
  try {
    return await Promise.race([request, timeout]);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Cheap client-side session hint: the unauthenticated /auth/session-status probe
 * (httpOnly refresh-cookie presence), cached in memory for 30s. Any failure or a 4s timeout means "guest",
 * so a guest never triggers refresh or a login redirect; failures are cached only briefly.
 */
export function hasSessionHint(doFetch: typeof fetch = fetch, now: () => number = Date.now): Promise<boolean> {
  if (cache && now() - cache.at < cache.ttl) return Promise.resolve(cache.value);
  inflight ??= probe(doFetch)
    .then(({ value, ok }) => {
      cache = { value, at: now(), ttl: ok ? TTL_MS : FAILURE_TTL_MS };
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
