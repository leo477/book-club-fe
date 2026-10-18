import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('client-only', () => ({}));

const showToast = vi.fn();
vi.mock('./toast', () => ({ showToast }));

const loaded = vi.fn();
const getClub = vi.fn(async (id: string) => `club:${id}`);

type TestApi = { clubs: { get: (id: string) => Promise<string> } };

const load = async (failures = 0): Promise<TestApi> => {
  let remaining = failures;
  vi.resetModules();
  vi.doMock('./api-impl', () => {
    loaded();
    if (remaining > 0) {
      remaining -= 1;
      throw new Error('chunk load failed');
    }
    return { api: { clubs: { get: getClub } } };
  });
  return (await import('./api')).api as unknown as TestApi;
};

beforeEach(() => {
  loaded.mockClear();
  showToast.mockClear();
});

describe('lazy api facade', () => {
  it('does not load the implementation until the first call', async () => {
    const api = await load();
    expect(loaded).not.toHaveBeenCalled();
    await expect(api.clubs.get('a')).resolves.toBe('club:a');
    expect(loaded).toHaveBeenCalledTimes(1);
  });

  it('shares one import between concurrent first calls', async () => {
    const api = await load();
    await Promise.all([api.clubs.get('a'), api.clubs.get('b')]);
    expect(loaded).toHaveBeenCalledTimes(1);
  });

  it('retries once on a failed load and succeeds', async () => {
    const api = await load(1);
    await expect(api.clubs.get('a')).resolves.toBe('club:a');
    expect(showToast).not.toHaveBeenCalled();
  });

  it('rejects with a network toast when the retry fails too, then recovers on a later call', async () => {
    const api = await load(2);
    await expect(api.clubs.get('a')).rejects.toThrow();
    expect(showToast).toHaveBeenCalledWith('error', 'ERRORS.network');
    await expect(api.clubs.get('b')).resolves.toBe('club:b');
  });

  it('is not thenable and keeps module proxies stable', async () => {
    const api = await load();
    expect(await api.clubs).toBe(api.clubs);
    expect(api.clubs).toBe(api.clubs);
    expect(await Promise.resolve(api)).toBe(api);
  });

  it('gives a clear error for an unknown method', async () => {
    const api = await load();
    await expect((api.clubs as unknown as { nope: () => Promise<void> }).nope()).rejects.toThrow('api.clubs.nope is not a function');
  });
});
