import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import {
  BackendHttpError,
  RequestTimeoutError,
  bearerTransport,
  cookieTransport,
  createApiClient,
  type ApiClientConfig,
} from '../src';

const BASE = 'http://api.test/api/v1';
const ok = z.object({ ok: z.boolean() });
const tokens = { accessToken: 'new-access', refreshToken: 'new-refresh' };

interface Seen {
  method: string;
  path: string;
  authorization: string | null;
  body: unknown;
}
let seen: Seen[] = [];
const server = setupServer();

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));
afterEach(() => {
  server.resetHandlers();
  vi.useRealTimers();
});
afterAll(() => server.close());
beforeEach(() => {
  seen = [];
});

server.events.on('request:start', async ({ request }) => {
  const clone = request.clone();
  const text = await clone.text();
  seen.push({
    method: request.method,
    path: new URL(request.url).pathname.replace('/api/v1', ''),
    authorization: request.headers.get('authorization'),
    body: text && request.headers.get('content-type')?.includes('json') ? JSON.parse(text) : undefined,
  });
});

const count = (path: string) => seen.filter((s) => s.path === path).length;

function makeClient(cfg: Partial<ApiClientConfig> = {}) {
  const onUnauthenticated = vi.fn();
  const onForbidden = vi.fn();
  const onError = vi.fn();
  const client = createApiClient({
    baseUrl: BASE,
    transport: cookieTransport({ hasSession: () => true }),
    onUnauthenticated,
    onForbidden,
    onError,
    ...cfg,
  });
  return { client, onUnauthenticated, onForbidden, onError };
}

const hang = () => new Promise<Response>(() => undefined);

describe('single-flight refresh', () => {
  it('5 concurrent 401s trigger exactly 1 refresh and 5 replays', async () => {
    let refreshed = false;
    server.use(
      http.post(`${BASE}/auth/refresh`, () => {
        refreshed = true;
        return HttpResponse.json(tokens);
      }),
      http.get(`${BASE}/items/:id`, () => (refreshed ? HttpResponse.json({ ok: true }) : HttpResponse.json({ detail: 'expired' }, { status: 401 }))),
    );
    const { client, onUnauthenticated } = makeClient();
    const results = await Promise.all([1, 2, 3, 4, 5].map((i) => client.get(`/items/${i}`, ok)));
    expect(results).toEqual(Array(5).fill({ ok: true }));
    expect(count('/auth/refresh')).toBe(1);
    expect(seen.filter((s) => s.path.startsWith('/items/'))).toHaveLength(10);
    expect(onUnauthenticated).not.toHaveBeenCalled();
  });

  it('a later 401 after a completed refresh starts a new refresh', async () => {
    let phase = 0;
    server.use(
      http.post(`${BASE}/auth/refresh`, () => {
        phase++;
        return HttpResponse.json(tokens);
      }),
      http.get(`${BASE}/x`, () => (phase % 2 === 0 ? HttpResponse.json({}, { status: 401 }) : HttpResponse.json({ ok: true }))),
    );
    const { client } = makeClient();
    await client.get('/x', ok);
    phase = 2;
    await client.get('/x', ok);
    expect(count('/auth/refresh')).toBe(2);
  });

  it('refresh failure signs out once with no retry loop', async () => {
    server.use(
      http.post(`${BASE}/auth/refresh`, () => HttpResponse.json({ detail: 'nope' }, { status: 401 })),
      http.get(`${BASE}/x`, () => HttpResponse.json({ detail: 'expired' }, { status: 401 })),
    );
    const { client, onUnauthenticated } = makeClient();
    await expect(client.get('/x', ok)).rejects.toMatchObject({ status: 401, detail: 'expired' });
    expect(onUnauthenticated).toHaveBeenCalledTimes(1);
    expect(count('/auth/refresh')).toBe(1);
    expect(count('/x')).toBe(1);
  });

  it('concurrent callers report unauthenticated once per failed refresh', async () => {
    server.use(
      http.post(`${BASE}/auth/refresh`, () => HttpResponse.json({}, { status: 401 })),
      http.get(`${BASE}/x`, () => HttpResponse.json({}, { status: 401 })),
    );
    const { client, onUnauthenticated } = makeClient();
    await Promise.allSettled([1, 2, 3, 4, 5].map(() => client.get('/x', ok)));
    expect(count('/auth/refresh')).toBe(1);
    expect(onUnauthenticated).toHaveBeenCalledTimes(1);
  });

  it('a malformed refresh body is treated as a failed refresh', async () => {
    server.use(
      http.post(`${BASE}/auth/refresh`, () => HttpResponse.json({ accessToken: 1 })),
      http.get(`${BASE}/x`, () => HttpResponse.json({}, { status: 401 })),
    );
    const { client, onUnauthenticated } = makeClient();
    await expect(client.get('/x', ok)).rejects.toMatchObject({ status: 401 });
    expect(onUnauthenticated).toHaveBeenCalledTimes(1);
  });

  it('a replay that is still 401 signs out without a second refresh', async () => {
    server.use(
      http.post(`${BASE}/auth/refresh`, () => HttpResponse.json(tokens)),
      http.get(`${BASE}/x`, () => HttpResponse.json({}, { status: 401 })),
    );
    const { client, onUnauthenticated } = makeClient();
    await expect(client.get('/x', ok)).rejects.toMatchObject({ status: 401 });
    expect(count('/auth/refresh')).toBe(1);
    expect(count('/x')).toBe(2);
    expect(onUnauthenticated).toHaveBeenCalledTimes(1);
  });
});

describe('retry on 503', () => {
  beforeEach(() => vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] }));

  it('retries once after 5s and returns the second response', async () => {
    let n = 0;
    server.use(http.get(`${BASE}/x`, () => (++n === 1 ? new HttpResponse(null, { status: 503 }) : HttpResponse.json({ ok: true }))));
    const { client } = makeClient();
    const p = client.get('/x', ok);
    await vi.advanceTimersByTimeAsync(4_999);
    expect(count('/x')).toBe(1);
    await vi.advanceTimersByTimeAsync(1);
    await expect(p).resolves.toEqual({ ok: true });
    expect(count('/x')).toBe(2);
  });

  it('gives up after one retry', async () => {
    server.use(http.get(`${BASE}/x`, () => new HttpResponse(null, { status: 503 })));
    const { client, onError } = makeClient();
    const p = client.get('/x', ok).catch((e: unknown) => e);
    await vi.advanceTimersByTimeAsync(10_000);
    expect(await p).toMatchObject({ status: 503, translationKey: 'ERRORS.serverError' });
    expect(count('/x')).toBe(2);
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('retries mutations on 503 too', async () => {
    let n = 0;
    server.use(http.post(`${BASE}/x`, () => (++n === 1 ? new HttpResponse(null, { status: 503 }) : HttpResponse.json({ ok: true }))));
    const { client } = makeClient();
    const p = client.post('/x', ok, { a: 1 });
    await vi.advanceTimersByTimeAsync(5_000);
    await expect(p).resolves.toEqual({ ok: true });
    expect(seen.map((s) => s.body)).toEqual([{ a: 1 }, { a: 1 }]);
  });

  it.each([500, 502])('does not retry %i', async (status) => {
    server.use(http.get(`${BASE}/x`, () => new HttpResponse(null, { status })));
    const { client, onError } = makeClient();
    await expect(client.get('/x', ok)).rejects.toMatchObject({ status });
    expect(count('/x')).toBe(1);
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('waits the default 5s before replaying a 503', async () => {
    let n = 0;
    server.use(http.get(`${BASE}/x`, () => (++n === 1 ? new HttpResponse(null, { status: 503 }) : HttpResponse.json({ ok: true }))));
    const { client } = makeClient();
    const p = client.get('/x', ok);
    await vi.advanceTimersByTimeAsync(4_999);
    expect(count('/x')).toBe(1);
    await vi.advanceTimersByTimeAsync(1);
    await expect(p).resolves.toEqual({ ok: true });
  });

  it('aborting during the 503 wait rejects immediately without a replay', async () => {
    server.use(http.get(`${BASE}/x`, () => new HttpResponse(null, { status: 503 })));
    const { client } = makeClient();
    const ctrl = new AbortController();
    const p = client.get('/x', ok, { signal: ctrl.signal }).catch((e: unknown) => e);
    await vi.advanceTimersByTimeAsync(1_000);
    ctrl.abort(new Error('user'));
    expect(await p).toMatchObject({ message: 'user' });
    await vi.advanceTimersByTimeAsync(10_000);
    expect(count('/x')).toBe(1);
  });
});

describe('timeouts', () => {
  beforeEach(() => vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] }));

  it('GET times out at 15s', async () => {
    server.use(http.get(`${BASE}/x`, hang));
    const { client, onError } = makeClient();
    const p = client.get('/x', ok).catch((e: unknown) => e);
    await vi.advanceTimersByTimeAsync(14_999);
    expect(onError).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    const err = await p;
    expect(err).toBeInstanceOf(RequestTimeoutError);
    expect(err).toMatchObject({ translationKey: 'ERRORS.timeout', message: 'ERRORS.timeout' });
    expect(onError).toHaveBeenCalledWith(err, { suppress: false, path: '/x', method: 'GET' });
  });

  it('POST times out at 30s', async () => {
    server.use(http.post(`${BASE}/x`, hang));
    const { client, onError } = makeClient();
    const p = client.post('/x', ok, {}).catch((e: unknown) => e);
    await vi.advanceTimersByTimeAsync(29_999);
    expect(onError).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(await p).toBeInstanceOf(RequestTimeoutError);
    expect(onError).toHaveBeenCalledWith(expect.any(RequestTimeoutError), { suppress: false, path: '/x', method: 'POST' });
  });

  it.each(['put', 'patch', 'delete'] as const)('%s uses the mutation timeout', async (verb) => {
    server.use(http.all(`${BASE}/x`, hang));
    const { client } = makeClient();
    const p = (verb === 'delete' ? client.delete('/x', ok) : client[verb]('/x', ok, {})).catch((e: unknown) => e);
    await vi.advanceTimersByTimeAsync(15_000);
    let settled = false;
    void p.then(() => (settled = true));
    await vi.advanceTimersByTimeAsync(0);
    expect(settled).toBe(false);
    await vi.advanceTimersByTimeAsync(15_000);
    expect(await p).toBeInstanceOf(RequestTimeoutError);
  });

  it('timeout is reported with suppress=true for background requests', async () => {
    server.use(http.get(`${BASE}/x`, hang));
    const { client, onError } = makeClient();
    const p = client.get('/x', ok, { suppressErrorToast: true }).catch((e: unknown) => e);
    await vi.advanceTimersByTimeAsync(15_000);
    await p;
    expect(onError).toHaveBeenCalledWith(expect.any(RequestTimeoutError), expect.objectContaining({ suppress: true }));
  });

  it('a timed-out refresh is a failed refresh and signs out', async () => {
    server.use(
      http.post(`${BASE}/auth/refresh`, hang),
      http.get(`${BASE}/x`, () => HttpResponse.json({}, { status: 401 })),
    );
    const { client, onUnauthenticated } = makeClient();
    const p = client.get('/x', ok).catch((e: unknown) => e);
    await vi.advanceTimersByTimeAsync(30_000);
    expect(await p).toMatchObject({ status: 401 });
    expect(onUnauthenticated).toHaveBeenCalledTimes(1);
  });
});

describe('flags', () => {
  it('skipAuthRedirect suppresses refresh and onUnauthenticated on 401', async () => {
    server.use(http.post(`${BASE}/auth/login`, () => HttpResponse.json({ detail: 'Invalid credentials' }, { status: 401 })));
    const { client, onUnauthenticated } = makeClient();
    await expect(client.post('/auth/login', ok, {}, { skipAuthRedirect: true })).rejects.toMatchObject({ status: 401, detail: 'Invalid credentials' });
    expect(onUnauthenticated).not.toHaveBeenCalled();
    expect(count('/auth/refresh')).toBe(0);
  });

  it('skipAuthRedirect suppresses onForbidden; without it 403 is reported', async () => {
    server.use(http.get(`${BASE}/x`, () => HttpResponse.json({ detail: 'no' }, { status: 403 })));
    const a = makeClient();
    await expect(a.client.get('/x', ok, { skipAuthRedirect: true })).rejects.toMatchObject({ status: 403 });
    expect(a.onForbidden).not.toHaveBeenCalled();
    const b = makeClient();
    await expect(b.client.get('/x', ok)).rejects.toMatchObject({ status: 403 });
    expect(b.onForbidden).toHaveBeenCalledTimes(1);
  });

  it('suppressErrorToast reaches onError as suppress=true; default is false', async () => {
    server.use(http.get(`${BASE}/x`, () => HttpResponse.json({ detail: 'boom' }, { status: 500 })));
    const { client, onError } = makeClient();
    await client.get('/x', ok, { suppressErrorToast: true }).catch(() => undefined);
    await client.get('/x', ok).catch(() => undefined);
    expect(onError.mock.calls.map((c) => c[1])).toEqual([
      { suppress: true, path: '/x', method: 'GET' },
      { suppress: false, path: '/x', method: 'GET' },
    ]);
  });

  it('4xx other than 401/403 never reaches onError', async () => {
    server.use(http.get(`${BASE}/x`, () => HttpResponse.json({ detail: 'bad' }, { status: 422 })));
    const { client, onError } = makeClient();
    await expect(client.get('/x', ok)).rejects.toBeInstanceOf(BackendHttpError);
    expect(onError).not.toHaveBeenCalled();
  });

  it('network errors map to status 0 and are not reported', async () => {
    server.use(http.get(`${BASE}/x`, () => HttpResponse.error()));
    const { client, onError } = makeClient();
    await expect(client.get('/x', ok)).rejects.toMatchObject({ status: 0, translationKey: 'ERRORS.network' });
    expect(onError).not.toHaveBeenCalled();
  });

  it('an already-aborted external signal is rethrown untouched', async () => {
    server.use(http.get(`${BASE}/x`, hang));
    const { client } = makeClient();
    const controller = new AbortController();
    controller.abort();
    await expect(client.get('/x', ok, { signal: controller.signal })).rejects.toMatchObject({ name: 'AbortError' });
  });

  it('serialises query and skips null/undefined', async () => {
    server.use(http.get(`${BASE}/x`, ({ request }) => HttpResponse.json({ ok: new URL(request.url).search === '?a=1&b=false' })));
    const { client } = makeClient();
    await expect(client.get('/x', ok, { query: { a: 1, b: false, c: null, d: undefined } })).resolves.toEqual({ ok: true });
  });

  it('sends FormData without a JSON content type', async () => {
    server.use(
      http.post(`${BASE}/upload/cover`, async ({ request }) => {
        const form = await request.formData();
        return HttpResponse.json({ ok: form.get('file') instanceof Blob && !request.headers.get('content-type')?.includes('json') });
      }),
    );
    const { client } = makeClient();
    const form = new FormData();
    form.set('file', new Blob(['x']), 'a.png');
    await expect(client.post('/upload/cover', ok, form)).resolves.toEqual({ ok: true });
  });

  it('204 and empty bodies resolve to undefined, non-JSON error text becomes the detail', async () => {
    server.use(
      http.delete(`${BASE}/x`, () => new HttpResponse(null, { status: 204 })),
      http.get(`${BASE}/plain`, () => new HttpResponse('Bad gateway text', { status: 400 })),
    );
    const { client } = makeClient();
    await expect(client.delete('/x', z.void())).resolves.toBeUndefined();
    await expect(client.get('/plain', ok)).rejects.toMatchObject({ detail: 'Bad gateway text' });
  });
});

describe('cookie transport', () => {
  it.each([true, false])('never sends Authorization and always includes credentials (hasSession=%s)', async (hasSession) => {
    server.use(http.all(`${BASE}/x`, () => HttpResponse.json({ ok: true })));
    const inits: (RequestInit | undefined)[] = [];
    const { client } = makeClient({
      transport: cookieTransport({ hasSession: () => hasSession }),
      fetch: (input, init) => {
        inits.push(init);
        return fetch(input, init);
      },
    });
    await client.get('/x', ok);
    await client.post('/x', ok, { a: 1 });
    expect(seen).toHaveLength(2);
    expect(seen.every((s) => s.authorization === null)).toBe(true);
    expect(inits.map((i) => i?.credentials)).toEqual(['include', 'include']);
    expect(inits.every((i) => !('Authorization' in ((i?.headers as Record<string, string>) ?? {})))).toBe(true);
  });

  it('never sends Authorization on the replay after refresh', async () => {
    let refreshed = false;
    server.use(
      http.post(`${BASE}/auth/refresh`, () => {
        refreshed = true;
        return HttpResponse.json(tokens);
      }),
      http.get(`${BASE}/x`, () => (refreshed ? HttpResponse.json({ ok: true }) : HttpResponse.json({}, { status: 401 }))),
    );
    const { client } = makeClient();
    await client.get('/x', ok);
    expect(seen.every((s) => s.authorization === null)).toBe(true);
    expect(seen.find((s) => s.path === '/auth/refresh')?.body).toEqual({});
  });

  it('with hasSession=false a 401 is a guest response: no refresh, no sign-out', async () => {
    server.use(http.get(`${BASE}/x`, () => HttpResponse.json({ detail: 'x' }, { status: 401 })));
    const { client, onUnauthenticated } = makeClient({ transport: cookieTransport({ hasSession: () => false }) });
    await expect(client.get('/x', ok)).rejects.toMatchObject({ status: 401 });
    expect(count('/auth/refresh')).toBe(0);
    expect(onUnauthenticated).not.toHaveBeenCalled();
  });
});

describe('refresh failures', () => {
  it('reports a refresh 500 to onError and still signs out', async () => {
    server.use(
      http.post(`${BASE}/auth/refresh`, () => HttpResponse.json({ detail: 'db down' }, { status: 500 })),
      http.get(`${BASE}/x`, () => HttpResponse.json({}, { status: 401 })),
    );
    const { client, onError, onUnauthenticated } = makeClient();
    await expect(client.get('/x', ok)).rejects.toMatchObject({ status: 401 });
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(expect.objectContaining({ status: 500 }), { suppress: false, path: '/auth/refresh', method: 'POST' });
    expect(onUnauthenticated).toHaveBeenCalledTimes(1);
    expect(count('/auth/refresh')).toBe(1);
  });

  it('reports a refresh timeout to onError and still signs out', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    server.use(
      http.post(`${BASE}/auth/refresh`, hang),
      http.get(`${BASE}/x`, () => HttpResponse.json({}, { status: 401 })),
    );
    const { client, onError, onUnauthenticated } = makeClient();
    const p = client.get('/x', ok).catch((e: unknown) => e);
    // The refresh timer only exists once /auth/refresh is in flight; advancing earlier would trip the GET's own timeout.
    await vi.waitFor(() => expect(count('/auth/refresh')).toBe(1));
    await vi.advanceTimersByTimeAsync(30_000);
    expect(await p).toMatchObject({ status: 401 });
    expect(onError).toHaveBeenCalledWith(expect.any(RequestTimeoutError), expect.objectContaining({ path: '/auth/refresh' }));
    expect(onUnauthenticated).toHaveBeenCalledTimes(1);
  });

  it.each([3, 5])('%i concurrent 401s with a failing refresh sign out exactly once, and a later cycle signs out again', async (n) => {
    // Hold every 401 until all n requests arrived, so none can observe the failure after the refresh cycle has ended.
    let arrived = 0;
    let release!: () => void;
    const allArrived = new Promise<void>((resolve) => (release = resolve));
    server.use(
      http.post(`${BASE}/auth/refresh`, () => HttpResponse.json({ detail: 'no' }, { status: 401 })),
      http.get(`${BASE}/x`, async () => {
        if (++arrived >= n) release();
        await allArrived;
        return HttpResponse.json({}, { status: 401 });
      }),
    );
    const clear = vi.fn();
    const transport = { ...cookieTransport({ hasSession: () => true }), clear };
    const { client, onUnauthenticated } = makeClient({ transport });
    const results = await Promise.allSettled(Array.from({ length: n }, () => client.get('/x', ok)));
    expect(results.every((r) => r.status === 'rejected')).toBe(true);
    expect(count('/auth/refresh')).toBe(1);
    expect(clear).toHaveBeenCalledTimes(1);
    expect(onUnauthenticated).toHaveBeenCalledTimes(1);
    await expect(client.get('/x', ok)).rejects.toMatchObject({ status: 401 });
    expect(onUnauthenticated).toHaveBeenCalledTimes(2);
    expect(clear).toHaveBeenCalledTimes(2);
  });

  it('concurrent replayed 401s after a successful refresh sign out once', async () => {
    server.use(
      http.post(`${BASE}/auth/refresh`, () => HttpResponse.json(tokens)),
      http.get(`${BASE}/x`, () => HttpResponse.json({}, { status: 401 })),
    );
    const { client, onUnauthenticated } = makeClient();
    await Promise.allSettled([1, 2, 3].map(() => client.get('/x', ok)));
    expect(onUnauthenticated).toHaveBeenCalledTimes(1);
  });

  it('still fires onUnauthenticated when transport.clear throws', async () => {
    server.use(
      http.post(`${BASE}/auth/refresh`, () => HttpResponse.json({}, { status: 401 })),
      http.get(`${BASE}/x`, () => HttpResponse.json({}, { status: 401 })),
    );
    const transport = { ...cookieTransport({ hasSession: () => true }), clear: () => { throw new Error('storage'); } };
    const { client, onUnauthenticated } = makeClient({ transport });
    await expect(client.get('/x', ok)).rejects.toMatchObject({ status: 401 });
    expect(onUnauthenticated).toHaveBeenCalledTimes(1);
  });

  it('a throwing onError cannot replace the real error', async () => {
    server.use(http.get(`${BASE}/x`, () => HttpResponse.json({ detail: 'boom' }, { status: 500 })));
    const { client } = makeClient({ onError: () => { throw new Error('reporter'); } });
    await expect(client.get('/x', ok)).rejects.toMatchObject({ status: 500 });
  });

  it('a guest 401 (hasSession false) triggers no refresh and no sign-out', async () => {
    server.use(http.get(`${BASE}/x`, () => HttpResponse.json({}, { status: 401 })));
    const { client, onUnauthenticated } = makeClient({ transport: cookieTransport({ hasSession: () => false }) });
    await expect(client.get('/x', ok)).rejects.toMatchObject({ status: 401 });
    expect(count('/auth/refresh')).toBe(0);
    expect(onUnauthenticated).not.toHaveBeenCalled();
  });

  it('skips the refresh and replays when the access token changed during the request', async () => {
    let access = 'old';
    const clear = vi.fn();
    const transport = bearerTransport({ getToken: () => access, getRefreshToken: () => 'r', setTokens: vi.fn(), clearTokens: clear });
    server.use(
      http.get(`${BASE}/x`, ({ request }) => {
        if (request.headers.get('authorization') === 'Bearer old') {
          access = 'rotated';
          return HttpResponse.json({}, { status: 401 });
        }
        return HttpResponse.json({ ok: true });
      }),
    );
    const { client } = makeClient({ transport });
    await expect(client.get('/x', ok)).resolves.toEqual({ ok: true });
    expect(count('/auth/refresh')).toBe(0);
    expect(seen.map((s) => s.authorization)).toEqual(['Bearer old', 'Bearer rotated']);
  });
});

describe('bearer transport', () => {
  function bearer() {
    let access: string | null = 'old-access';
    let refresh: string | null = 'old-refresh';
    const setTokens = vi.fn((t: { accessToken: string; refreshToken: string }) => {
      access = t.accessToken;
      refresh = t.refreshToken;
    });
    const clearTokens = vi.fn(() => {
      access = null;
      refresh = null;
    });
    const transport = bearerTransport({ getToken: () => access, getRefreshToken: () => refresh, setTokens, clearTokens });
    return { transport, setTokens, clearTokens, peek: () => ({ access, refresh }) };
  }

  it('attaches Bearer without credentials, rotates tokens via {refreshToken} and replays with the new token', async () => {
    server.use(
      http.post(`${BASE}/auth/refresh`, () => HttpResponse.json(tokens)),
      http.get(`${BASE}/x`, ({ request }) =>
        request.headers.get('authorization') === 'Bearer new-access' ? HttpResponse.json({ ok: true }) : HttpResponse.json({}, { status: 401 }),
      ),
    );
    const b = bearer();
    const { client } = makeClient({ transport: b.transport });
    await expect(client.get('/x', ok)).resolves.toEqual({ ok: true });
    expect(seen.map((s) => [s.path, s.authorization])).toEqual([
      ['/x', 'Bearer old-access'],
      ['/auth/refresh', null],
      ['/x', 'Bearer new-access'],
    ]);
    expect(seen[1]?.body).toEqual({ refreshToken: 'old-refresh' });
    expect(b.setTokens).toHaveBeenCalledWith(tokens);
    expect(b.peek()).toEqual({ access: 'new-access', refresh: 'new-refresh' });
  });

  it('5 concurrent 401s share one refresh and store tokens once', async () => {
    server.use(
      http.post(`${BASE}/auth/refresh`, () => HttpResponse.json(tokens)),
      http.get(`${BASE}/x`, ({ request }) =>
        request.headers.get('authorization') === 'Bearer new-access' ? HttpResponse.json({ ok: true }) : HttpResponse.json({}, { status: 401 }),
      ),
    );
    const b = bearer();
    const { client } = makeClient({ transport: b.transport });
    await Promise.all([1, 2, 3, 4, 5].map(() => client.get('/x', ok)));
    expect(count('/auth/refresh')).toBe(1);
    expect(b.setTokens).toHaveBeenCalledTimes(1);
  });

  it('clears tokens and signs out when refresh is rejected', async () => {
    server.use(
      http.post(`${BASE}/auth/refresh`, () => HttpResponse.json({}, { status: 401 })),
      http.get(`${BASE}/x`, () => HttpResponse.json({}, { status: 401 })),
    );
    const b = bearer();
    const { client, onUnauthenticated } = makeClient({ transport: b.transport });
    await expect(client.get('/x', ok)).rejects.toMatchObject({ status: 401 });
    expect(b.clearTokens).toHaveBeenCalledTimes(1);
    expect(onUnauthenticated).toHaveBeenCalledTimes(1);
    expect(b.peek()).toEqual({ access: null, refresh: null });
  });

  it('without a stored refresh token there is no refresh request', async () => {
    server.use(http.get(`${BASE}/x`, () => HttpResponse.json({}, { status: 401 })));
    let access: string | null = 'a';
    const transport = bearerTransport({
      getToken: () => access,
      getRefreshToken: () => null,
      setTokens: () => undefined,
      clearTokens: () => {
        access = null;
      },
    });
    const { client, onUnauthenticated } = makeClient({ transport });
    await expect(client.get('/x', ok)).rejects.toMatchObject({ status: 401 });
    expect(count('/auth/refresh')).toBe(0);
    expect(onUnauthenticated).toHaveBeenCalledTimes(1);
  });

  it('with no access token a 401 is a guest response', async () => {
    server.use(http.get(`${BASE}/x`, () => HttpResponse.json({}, { status: 401 })));
    const transport = bearerTransport({ getToken: () => null, getRefreshToken: () => 'r', setTokens: () => undefined, clearTokens: () => undefined });
    const { client, onUnauthenticated } = makeClient({ transport });
    await expect(client.get('/x', ok)).rejects.toMatchObject({ status: 401 });
    expect(seen[0]?.authorization).toBeNull();
    expect(count('/auth/refresh')).toBe(0);
    expect(onUnauthenticated).not.toHaveBeenCalled();
  });
});
