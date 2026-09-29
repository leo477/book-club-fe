import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { StranglerManifestService } from './strangler-manifest.service';

const UUID = '123e4567-e89b-12d3-a456-426614174000';

describe('StranglerManifestService', () => {
  let service: StranglerManifestService;
  let fetchMock: ReturnType<typeof vi.fn>;

  const respond = (body: unknown, ok = true) =>
    fetchMock.mockResolvedValue({ ok, json: () => Promise.resolve(body) });

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    service = TestBed.inject(StranglerManifestService);
  });

  afterEach(() => vi.unstubAllGlobals());

  it('matches only enabled patterns', async () => {
    respond({ version: 1, routes: [{ pattern: '/privacy', enabled: true }, { pattern: '/terms', enabled: false }] });
    await service.load();
    expect(service.isEnabled('/privacy')).toBe(true);
    expect(service.isEnabled('/privacy/')).toBe(true);
    expect(service.isEnabled('/terms')).toBe(false);
  });

  it(':id matches a UUID only', async () => {
    respond({ version: 1, routes: [{ pattern: '/clubs/:id', enabled: true }] });
    await service.load();
    expect(service.isEnabled(`/clubs/${UUID}`)).toBe(true);
    expect(service.isEnabled('/clubs/create')).toBe(false);
    expect(service.isEnabled(`/clubs/${UUID}/x`)).toBe(false);
  });

  it('a non-UUID :id segment does not match', async () => {
    respond({ routes: [{ pattern: '/clubs/:id', enabled: true }] });
    await service.load();
    expect(service.isEnabled('/clubs/123')).toBe(false);
    expect(service.isEnabled(`/clubs/${UUID}x`)).toBe(false);
  });

  it('yields an empty manifest when fetch exceeds the 1s timeout', async () => {
    vi.useFakeTimers();
    try {
      fetchMock.mockImplementation(
        (_u: string, init: RequestInit) =>
          new Promise((_res, rej) => init.signal?.addEventListener('abort', () => rej(new Error('timeout')))),
      );
      const done = service.load();
      await vi.advanceTimersByTimeAsync(1001);
      await expect(done).resolves.toBeUndefined();
      expect(service.isEnabled('/privacy')).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });

  it('loads once', async () => {
    respond({ routes: [] });
    await Promise.all([service.load(), service.load()]);
    await service.load();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('requests /strangler.json with a 1s abort signal', async () => {
    respond({ routes: [] });
    await service.load();
    expect(fetchMock.mock.calls[0][0]).toBe('/strangler.json');
    expect(fetchMock.mock.calls[0][1].signal).toBeInstanceOf(AbortSignal);
  });

  it.each([
    ['network error', () => fetchMock.mockRejectedValue(new Error('x'))],
    ['non-ok response', () => respond({ routes: [{ pattern: '/privacy', enabled: true }] }, false)],
    ['malformed body', () => respond({ routes: 'nope' })],
    ['invalid json', () => fetchMock.mockResolvedValue({ ok: true, json: () => Promise.reject(new Error('bad')) })],
  ])('yields an empty manifest on %s', async (_n, arrange) => {
    arrange();
    await expect(service.load()).resolves.toBeUndefined();
    expect(service.isEnabled('/privacy')).toBe(false);
  });
});
