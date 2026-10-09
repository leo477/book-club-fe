import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import {
  BackendHttpError,
  RequestTimeoutError,
  bearerTransport,
  cookieTransport,
  createApi,
  createApiClient,
  extractApiError,
  translationKeyForStatus,
  type ApiClientConfig,
} from '../src';

const json = (status: number, body?: unknown) =>
  new Response(body === undefined ? null : JSON.stringify(body), { status });

const tokens = { accessToken: 'new-access', refreshToken: 'new-refresh' };
const ok = z.object({ ok: z.boolean() });

function setup(handler: (url: string, init: RequestInit) => Response | Promise<Response>, cfg: Partial<ApiClientConfig> = {}) {
  const calls: { url: string; init: RequestInit }[] = [];
  const fetchMock = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(url), init: init ?? {} });
    return handler(String(url), init ?? {});
  });
  const onUnauthenticated = vi.fn();
  const onForbidden = vi.fn();
  const onError = vi.fn();
  const client = createApiClient({
    baseUrl: '/api/v1',
    transport: cookieTransport({ hasSession: () => true }),
    fetch: fetchMock as unknown as typeof fetch,
    onUnauthenticated,
    onForbidden,
    onError,
    ...cfg,
  });
  return { client, calls, onUnauthenticated, onForbidden, onError, fetchMock };
}

const headerOf = (init: RequestInit | undefined, name: string) => (init?.headers as Record<string, string> | undefined)?.[name];

describe('createApiClient', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('builds urls with query, skipping undefined values, and parses with the schema', async () => {
    const { client, calls } = setup(() => json(200, { ok: true }));
    await expect(client.get('/x', ok, { query: { a: 1, b: undefined, c: false } })).resolves.toEqual({ ok: true });
    expect(calls[0]?.url).toBe('/api/v1/x?a=1&c=false');
  });

  it('returns undefined for 204 and rejects payloads that violate the schema', async () => {
    const empty = setup(() => json(204));
    await expect(empty.client.delete('/x', z.void())).resolves.toBeUndefined();
    const bad = setup(() => json(200, { ok: 'yes' }));
    await expect(bad.client.get('/x', ok)).rejects.toThrow(/Invalid GET \/x/);
  });

  it('cookie transport sends credentials and never an Authorization header', async () => {
    const { client, calls } = setup(() => json(200, { ok: true }));
    await client.post('/x', ok, { a: 1 });
    expect(calls[0]?.init.credentials).toBe('include');
    expect(headerOf(calls[0]?.init, 'Authorization')).toBeUndefined();
    expect(headerOf(calls[0]?.init, 'Content-Type')).toBe('application/json');
  });

  it('maps statuses to translation keys and extracts backend detail', async () => {
    expect([0, 400, 404, 499, 500, 502].map(translationKeyForStatus)).toEqual([
      'ERRORS.network',
      'ERRORS.requestFailed',
      'ERRORS.requestFailed',
      'ERRORS.requestFailed',
      'ERRORS.serverError',
      'ERRORS.serverError',
    ]);
    const nested = setup(() => json(409, { detail: { error: 'Already joined', code: 'X' } }));
    const err = await nested.client.get('/x', ok).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(BackendHttpError);
    expect(err).toMatchObject({ status: 409, detail: 'Already joined', translationKey: 'ERRORS.requestFailed' });
    expect(extractApiError(err)).toBe('Already joined');
    const plain = setup(() => new Response('boom', { status: 400 }));
    await expect(plain.client.get('/x', ok)).rejects.toMatchObject({ detail: 'boom' });
  });

  it('maps a network failure to status 0', async () => {
    const { client } = setup(() => {
      throw new TypeError('fetch failed');
    });
    await expect(client.get('/x', ok)).rejects.toMatchObject({ status: 0, translationKey: 'ERRORS.network' });
  });

  it('reports 5xx via onError (with suppress flag) and never 4xx', async () => {
    const a = setup(() => json(500, { detail: 'x' }));
    await expect(a.client.get('/x', ok, { suppressErrorToast: true })).rejects.toBeInstanceOf(BackendHttpError);
    expect(a.onError).toHaveBeenCalledWith(expect.objectContaining({ status: 500 }), expect.objectContaining({ suppress: true }));
    const b = setup(() => json(422, { detail: 'x' }));
    await expect(b.client.get('/x', ok)).rejects.toBeInstanceOf(BackendHttpError);
    expect(b.onError).not.toHaveBeenCalled();
  });

  it('retries 503 exactly once after the delay, but not 500 or 502', async () => {
    let n = 0;
    const s = setup(() => (++n === 1 ? json(503) : json(200, { ok: true })));
    const p = s.client.get('/x', ok);
    await vi.advanceTimersByTimeAsync(4_999);
    expect(s.fetchMock).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1);
    await expect(p).resolves.toEqual({ ok: true });
    expect(s.fetchMock).toHaveBeenCalledTimes(2);

    const twice = setup(() => json(503));
    const q = twice.client.get('/x', ok).catch((e: unknown) => e);
    await vi.advanceTimersByTimeAsync(10_000);
    expect(await q).toMatchObject({ status: 503 });
    expect(twice.fetchMock).toHaveBeenCalledTimes(2);

    for (const status of [500, 502]) {
      const s2 = setup(() => json(status));
      await expect(s2.client.get('/x', ok)).rejects.toMatchObject({ status });
      expect(s2.fetchMock).toHaveBeenCalledTimes(1);
    }
  });

  it('times out GET at 15s and mutations at 30s with RequestTimeoutError', async () => {
    const hang = (_url: string, init: RequestInit) =>
      new Promise<Response>((_, reject) => init.signal?.addEventListener('abort', () => reject(new DOMException('a', 'AbortError'))));
    const get = setup(hang);
    const g = get.client.get('/x', ok).catch((e: unknown) => e);
    await vi.advanceTimersByTimeAsync(14_999);
    expect(get.onError).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    const ge = await g;
    expect(ge).toBeInstanceOf(RequestTimeoutError);
    expect(ge).toMatchObject({ translationKey: 'ERRORS.timeout' });
    expect(get.onError).toHaveBeenCalledTimes(1);
    expect(get.fetchMock).toHaveBeenCalledTimes(1);

    const post = setup(hang);
    const p = post.client.post('/x', ok, {}).catch((e: unknown) => e);
    await vi.advanceTimersByTimeAsync(15_000);
    expect(post.onError).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(15_000);
    expect(await p).toBeInstanceOf(RequestTimeoutError);
  });

  it('lets an external abort through untouched', async () => {
    const controller = new AbortController();
    const s = setup(
      (_u, init) =>
        new Promise<Response>((_, reject) => {
          const abort = () => reject(new DOMException('a', 'AbortError'));
          if (init.signal?.aborted) abort();
          else init.signal?.addEventListener('abort', abort);
        }),
    );
    const p = s.client.get('/x', ok, { signal: controller.signal }).catch((e: unknown) => e);
    controller.abort();
    expect(await p).toMatchObject({ name: 'AbortError' });
  });

  describe('refresh', () => {
    it('shares one refresh across concurrent 401s and replays each request once', async () => {
      let refreshed = false;
      const s = setup((url) => {
        if (url.endsWith('/auth/refresh')) {
          refreshed = true;
          return json(200, tokens);
        }
        return refreshed ? json(200, { ok: true }) : json(401, { detail: 'expired' });
      });
      const results = await Promise.all(Array.from({ length: 5 }, () => s.client.get('/x', ok)));
      expect(results).toHaveLength(5);
      const refreshCalls = s.calls.filter((c) => c.url.endsWith('/auth/refresh'));
      expect(refreshCalls).toHaveLength(1);
      expect(refreshCalls[0]?.init.body).toBe('{}');
      expect(refreshCalls[0]?.init.method).toBe('POST');
      expect(s.calls.filter((c) => c.url.endsWith('/x'))).toHaveLength(10);
      expect(s.onUnauthenticated).not.toHaveBeenCalled();
    });

    it('logs out once on refresh failure, without looping, for all concurrent callers', async () => {
      const s = setup((url) => (url.endsWith('/auth/refresh') ? json(401, { detail: 'nope' }) : json(401, { detail: 'expired' })));
      const settled = await Promise.allSettled([s.client.get('/a', ok), s.client.get('/b', ok), s.client.get('/c', ok)]);
      expect(settled.every((r) => r.status === 'rejected')).toBe(true);
      expect(s.calls.filter((c) => c.url.endsWith('/auth/refresh'))).toHaveLength(1);
      expect(s.onUnauthenticated).toHaveBeenCalledTimes(1);
      const err = (settled[0] as PromiseRejectedResult).reason as BackendHttpError;
      expect(err).toMatchObject({ status: 401, translationKey: 'ERRORS.requestFailed', detail: 'expired' });
    });

    it('does not refresh again when the replayed request is still 401, and signs out', async () => {
      const s = setup((url) => (url.endsWith('/auth/refresh') ? json(200, tokens) : json(401)));
      await expect(s.client.get('/x', ok)).rejects.toMatchObject({ status: 401 });
      expect(s.calls.filter((c) => c.url.endsWith('/auth/refresh'))).toHaveLength(1);
      expect(s.calls.filter((c) => c.url.endsWith('/x'))).toHaveLength(2);
      expect(s.onUnauthenticated).toHaveBeenCalledTimes(1);
    });

    it('skipAuthRedirect disables refresh, logout and forbidden handling', async () => {
      const s = setup(() => json(401, { detail: 'Invalid credentials' }));
      await expect(s.client.post('/auth/login', ok, {}, { skipAuthRedirect: true })).rejects.toMatchObject({
        status: 401,
        detail: 'Invalid credentials',
      });
      expect(s.calls).toHaveLength(1);
      expect(s.onUnauthenticated).not.toHaveBeenCalled();
      const f = setup(() => json(403));
      await expect(f.client.get('/x', ok, { skipAuthRedirect: true })).rejects.toMatchObject({ status: 403 });
      expect(f.onForbidden).not.toHaveBeenCalled();
    });

    it('does not ask the transport whether a session exists for skipAuthRedirect requests', async () => {
      const hasSession = vi.fn(() => true);
      const s = setup(() => json(200, { ok: true }), { transport: cookieTransport({ hasSession }) });
      await s.client.post('/auth/oauth/exchange', ok, { code: 'c' }, { skipAuthRedirect: true });
      expect(hasSession).not.toHaveBeenCalled();
      await s.client.get('/x', ok);
      expect(hasSession).toHaveBeenCalledTimes(1);
    });

    it('calls onForbidden on 403', async () => {
      const s = setup(() => json(403, { detail: 'no' }));
      await expect(s.client.get('/x', ok)).rejects.toMatchObject({ status: 403 });
      expect(s.onForbidden).toHaveBeenCalledTimes(1);
      expect(s.onUnauthenticated).not.toHaveBeenCalled();
    });

    it('treats 401 as a guest response when the transport reports no session', async () => {
      const s = setup(() => json(401, { detail: 'x' }), { transport: cookieTransport({ hasSession: () => false }) });
      await expect(s.client.get('/x', ok)).rejects.toMatchObject({ status: 401 });
      expect(s.calls).toHaveLength(1);
      expect(s.onUnauthenticated).not.toHaveBeenCalled();
    });
  });

  describe('bearer transport', () => {
    function bearer(handler: (url: string, init: RequestInit) => Response) {
      let access: string | null = 'old-access';
      let refresh: string | null = 'old-refresh';
      const store = { setTokens: vi.fn(), clearTokens: vi.fn() };
      const transport = bearerTransport({
        getToken: () => access,
        getRefreshToken: () => refresh,
        setTokens: (t) => {
          access = t.accessToken;
          refresh = t.refreshToken;
          store.setTokens(t);
        },
        clearTokens: () => {
          access = null;
          refresh = null;
          store.clearTokens();
        },
      });
      return { ...setup(handler, { transport }), store };
    }

    it('sends the Bearer token, refreshes with {refreshToken}, stores rotated tokens and replays with the new one', async () => {
      const s = bearer((url, init) => {
        if (url.endsWith('/auth/refresh')) return json(200, tokens);
        return headerOf(init, 'Authorization') === 'Bearer new-access' ? json(200, { ok: true }) : json(401);
      });
      await expect(s.client.get('/x', ok)).resolves.toEqual({ ok: true });
      const refreshCall = s.calls.find((c) => c.url.endsWith('/auth/refresh'));
      expect(JSON.parse(refreshCall?.init.body as string)).toEqual({ refreshToken: 'old-refresh' });
      expect(headerOf(refreshCall?.init, 'Authorization')).toBeUndefined();
      expect(s.store.setTokens).toHaveBeenCalledWith(tokens);
      expect(headerOf(s.calls[0]?.init, 'Authorization')).toBe('Bearer old-access');
      expect(headerOf(s.calls.at(-1)?.init, 'Authorization')).toBe('Bearer new-access');
      expect(s.calls[0]?.init.credentials).toBeUndefined();
    });

    it('clears tokens and signs out when refresh fails or no refresh token exists', async () => {
      const s = bearer((url) => (url.endsWith('/auth/refresh') ? json(401) : json(401)));
      await expect(s.client.get('/x', ok)).rejects.toMatchObject({ status: 401 });
      expect(s.store.clearTokens).toHaveBeenCalledTimes(1);
      expect(s.onUnauthenticated).toHaveBeenCalledTimes(1);

      const anon = bearer(() => json(401));
      await anon.store.clearTokens();
      const c2 = createApiClient({
        baseUrl: '/api/v1',
        fetch: anon.fetchMock as unknown as typeof fetch,
        transport: bearerTransport({ getToken: () => null, getRefreshToken: () => null, setTokens: () => undefined, clearTokens: () => undefined }),
      });
      await expect(c2.get('/x', ok)).rejects.toMatchObject({ status: 401 });
    });
  });
});

describe('domain modules', () => {
  it('parse responses and hit the backend paths', async () => {
    const { client, calls } = setup((url) => {
      if (url.includes('/book-vote/round')) return json(200, null);
      if (url.endsWith('/config/maps-key')) return json(200, { mapsApiKey: 'k', mapsMapId: 'm' });
      return json(200, []);
    });
    const api = createApi(client);
    await expect(api.bookVote.currentRound('c1')).resolves.toBeNull();
    await expect(api.config.mapsKey()).resolves.toEqual({ mapsApiKey: 'k', mapsMapId: 'm' });
    await api.clubs.events('c1', true);
    await api.events.list({ clubId: 'c1', city: 'Kyiv' });
    await api.chat.messages('r1', { beforeId: 'm1', limit: 20 });
    expect(calls.map((c) => c.url)).toEqual([
      '/api/v1/clubs/c1/book-vote/round',
      '/api/v1/config/maps-key',
      '/api/v1/clubs/c1/events?include_past=true',
      '/api/v1/events?city=Kyiv&club_id=c1',
      '/api/v1/chat/rooms/r1/messages?before_id=m1&limit=20',
    ]);
  });

  it('sends event winner and updates with the backend snake_case bodies', async () => {
    const event = {
      id: 'e', clubId: 'c', clubName: 'n', organizerId: 'o', title: 't', description: null, date: 'd', city: 'c',
      address: null, lat: null, lng: null, status: 'held', cancelledAt: null, theme: null, durationMinutes: null,
      afterMeetingVenue: null, attendeeCount: 0, isAttending: false,
    };
    const { client, calls } = setup(() => json(200, event));
    const api = createApi(client);
    await api.events.setWinner('e', 'u1');
    expect(calls[0]?.init.body).toBe('{"winner_id":"u1"}');
    expect(calls[0]?.init.method).toBe('PATCH');
  });
});
