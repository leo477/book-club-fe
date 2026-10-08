import { afterEach, describe, expect, it, vi } from 'vitest';
import { serverApi } from './server-api';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

type Init = RequestInit & { next: unknown };

describe('serverApi', () => {
  it('calls the absolute backend URL anonymously with the given Next cache options', async () => {
    const spy = vi.fn(async () => Response.json([]));
    vi.stubGlobal('fetch', spy);
    await serverApi({ revalidate: 300, tags: ['clubs'] }).clubs.list();

    const [url, init] = spy.mock.calls[0] as unknown as [string, Init];
    expect(url).toBe('https://book-club-be.onrender.com/api/v1/clubs');
    expect(init.next).toEqual({ revalidate: 300, tags: ['clubs'] });
    expect(init.credentials).toBeUndefined();
  });

  it('sends no Cookie or Authorization header in any casing', async () => {
    const spy = vi.fn(async () => Response.json([]));
    vi.stubGlobal('fetch', spy);
    await serverApi({ revalidate: 300 }).clubs.list();

    const [, init] = spy.mock.calls[0] as unknown as [string, Init];
    const names = [...new Headers(init.headers).keys()];
    expect(names).not.toContain('authorization');
    expect(names).not.toContain('cookie');
  });

  it('follows BACKEND_ORIGIN', async () => {
    vi.stubEnv('BACKEND_ORIGIN', 'https://api.example.com');
    const spy = vi.fn(async () => Response.json([]));
    vi.stubGlobal('fetch', spy);
    await serverApi({ revalidate: 1 }).clubs.list();
    expect((spy.mock.calls[0] as unknown as [string])[0]).toBe('https://api.example.com/api/v1/clubs');
  });

  it('aborts after 3 s so the caller can fall back to a client fetch', async () => {
    const timeout = vi.spyOn(AbortSignal, 'timeout');
    const spy = vi.fn(async (_url: string, init: Init) => {
      expect(init.signal).toBeInstanceOf(AbortSignal);
      return Response.json([]);
    });
    vi.stubGlobal('fetch', spy);
    await serverApi({ revalidate: 1 }).clubs.list();
    expect(timeout).toHaveBeenCalledWith(3000);
  });

  it('surfaces a hung backend as a rejection once the signal aborts', async () => {
    const hang = vi.fn((_url: string, init: Init) => new Promise<Response>((_, reject) => {
      if (init.signal?.aborted) reject(init.signal.reason);
      else init.signal?.addEventListener('abort', () => reject(init.signal?.reason));
    }));
    vi.stubGlobal('fetch', hang);
    vi.spyOn(AbortSignal, 'timeout').mockImplementation(() => AbortSignal.abort(new DOMException('timeout', 'TimeoutError')));
    await expect(serverApi({ revalidate: 1 }).clubs.list()).rejects.toBeInstanceOf(Error);
  });

  it('does not refresh or redirect on 401: guests stay guests', async () => {
    const spy = vi.fn(async () => Response.json({ detail: 'no' }, { status: 401 }));
    vi.stubGlobal('fetch', spy);
    await expect(serverApi({ revalidate: 1 }).clubs.list()).rejects.toMatchObject({ status: 401 });
    expect(spy).toHaveBeenCalledTimes(1);
  });
  describe('per-call timeout', () => {
    const slow = (ms: number) =>
      vi.fn(
        (_url: string, init: Init) =>
          new Promise<Response>((resolve, reject) => {
            const timer = setTimeout(() => resolve(Response.json([])), ms);
            init.signal?.addEventListener('abort', () => {
              clearTimeout(timer);
              reject(init.signal?.reason);
            });
          }),
      );

    it('honours a longer timeout for a slow backend', async () => {
      vi.stubGlobal('fetch', slow(80));
      await expect(serverApi({ revalidate: 1 }, { timeoutMs: 1000 }).clubs.list()).resolves.toEqual([]);
    });

    it('still aborts once the given timeout elapses', async () => {
      vi.stubGlobal('fetch', slow(500));
      await expect(serverApi({ revalidate: 1 }, { timeoutMs: 20 }).clubs.list()).rejects.toSatisfy((e: { status?: number }) => e.status !== 404 && e.status !== 422);
    });

    it('keeps 3 s for callers that pass no override', async () => {
      const timeout = vi.spyOn(AbortSignal, 'timeout');
      vi.stubGlobal('fetch', vi.fn(async () => Response.json([])));
      await serverApi({ revalidate: 1 }).clubs.list();
      expect(timeout).toHaveBeenCalledWith(3000);
    });
  });
});
