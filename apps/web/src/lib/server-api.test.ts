import { afterEach, describe, expect, it, vi } from 'vitest';
import { serverApi } from './server-api';

afterEach(() => vi.unstubAllGlobals());

describe('serverApi', () => {
  it('calls the absolute backend URL anonymously with the given Next cache options', async () => {
    const spy = vi.fn(async () => Response.json([]));
    vi.stubGlobal('fetch', spy);
    await serverApi({ revalidate: 300, tags: ['clubs'] }).clubs.list();

    const [url, init] = spy.mock.calls[0] as unknown as [string, RequestInit & { next: unknown }];
    expect(url).toBe('https://book-club-be.onrender.com/api/v1/clubs');
    expect(init.next).toEqual({ revalidate: 300, tags: ['clubs'] });
    expect(init.credentials).toBeUndefined();
    expect(init.headers).not.toHaveProperty('Authorization');
    expect(init.headers).not.toHaveProperty('Cookie');
  });

  it('does not refresh or redirect on 401: guests stay guests', async () => {
    const spy = vi.fn(async () => Response.json({ detail: 'no' }, { status: 401 }));
    vi.stubGlobal('fetch', spy);
    await expect(serverApi({ revalidate: 1 }).clubs.list()).rejects.toMatchObject({ status: 401 });
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
