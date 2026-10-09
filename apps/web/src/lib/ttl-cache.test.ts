import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TtlCache } from './ttl-cache';

describe('TtlCache', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('returns a stored value until the TTL has passed, then drops it', () => {
    const cache = new TtlCache<string>(1000);
    cache.set('k', 'v');
    expect(cache.get('k')).toBe('v');
    vi.advanceTimersByTime(1000);
    expect(cache.get('k')).toBe('v');
    vi.advanceTimersByTime(1);
    expect(cache.get('k')).toBeNull();
  });

  it('returns null for an unknown key and forgets a deleted one', () => {
    const cache = new TtlCache<number>(1000);
    expect(cache.get('x')).toBeNull();
    cache.set('x', 1);
    cache.delete('x');
    expect(cache.get('x')).toBeNull();
  });

  it('restarts the clock when a key is set again', () => {
    const cache = new TtlCache<number>(1000);
    cache.set('x', 1);
    vi.advanceTimersByTime(900);
    cache.set('x', 2);
    vi.advanceTimersByTime(900);
    expect(cache.get('x')).toBe(2);
  });
});
