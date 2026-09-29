import { describe, expect, it, vi } from 'vitest';
import { computeState, decide, loadConfig, parseConfig, validBucket } from './config';

const cfg = (routes: unknown, extra: object = {}) => parseConfig({ version: 3, enabled: true, routes, ...extra });

describe('decide', () => {
  const config = cfg({
    '/on': { target: 'next', percent: 100 },
    '/half': { target: 'next', percent: 50 },
    '/off': { target: 'legacy', percent: 100 },
    '/zero': { target: 'next', percent: 0 },
  });

  it.each([
    ['/on', 99, 'next'],
    ['/half', 49, 'next'],
    ['/half', 50, 'legacy'],
    ['/zero', 0, 'legacy'],
    ['/off', 0, 'legacy'],
    ['/missing', 0, 'legacy'],
  ] as const)('%s bucket %i -> %s', (pattern, bucket, expected) => {
    expect(decide(config, pattern, bucket)).toBe(expected);
  });

  it('goes legacy when config is missing or globally disabled', () => {
    expect(decide(null, '/on', 0)).toBe('legacy');
    expect(decide(cfg({ '/on': { target: 'next', percent: 100 } }, { enabled: false }), '/on', 0)).toBe('legacy');
  });
});

describe('parseConfig', () => {
  it('requires enabled === true', () => {
    for (const enabled of [undefined, 'true', 1, null, false]) {
      expect(parseConfig({ version: 1, enabled, routes: {} })?.enabled).toBe(false);
    }
    expect(parseConfig({ version: 1, enabled: true, routes: {} })?.enabled).toBe(true);
  });

  it('rejects non-objects and drops malformed flags', () => {
    expect(parseConfig(null)).toBeNull();
    expect(parseConfig('x')).toBeNull();
    expect(parseConfig({ routes: null })).toBeNull();
    const parsed = cfg({ '/a': { target: 'next', percent: '100' }, '/b': { target: 'bogus', percent: 1 }, '/c': 5 });
    expect(parsed?.routes).toEqual({});
  });
});

describe('validBucket', () => {
  it('accepts 0-99 only', () => {
    expect(validBucket('0')).toBe(0);
    expect(validBucket('99')).toBe(99);
    for (const bad of ['100', '-1', 'a', '', '1.5', undefined, null]) expect(validBucket(bad)).toBeNull();
  });
});

describe('loadConfig', () => {
  it('returns null when the read rejects', async () => {
    expect(await loadConfig(() => Promise.reject(new Error('down')))).toBeNull();
  });

  it('returns null when the read exceeds the timeout', async () => {
    vi.useFakeTimers();
    const pending = loadConfig(() => new Promise(() => undefined));
    await vi.advanceTimersByTimeAsync(49);
    let settled = false;
    void pending.then(() => (settled = true));
    await vi.advanceTimersByTimeAsync(0);
    expect(settled).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    expect(await pending).toBeNull();
    vi.useRealTimers();
  });
});

describe('computeState', () => {
  it('reports enabled per pattern for the bucket', () => {
    const config = cfg({ '/a': { target: 'next', percent: 10 } });
    expect(computeState(config, 5, ['/a', '/b'])).toEqual({
      version: 3,
      routes: [
        { pattern: '/a', enabled: true },
        { pattern: '/b', enabled: false },
      ],
    });
    expect(computeState(null, 5, ['/a']).routes[0]?.enabled).toBe(false);
  });
});
