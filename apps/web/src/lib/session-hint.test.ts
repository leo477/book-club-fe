import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { hasSessionHint, PROBE_TIMEOUT_MS, resetSessionHint } from './session-hint';

const respond = (body: unknown, ok = true) => vi.fn(async () => ({ ok, json: async () => body }) as Response);

beforeEach(resetSessionHint);
afterEach(() => vi.useRealTimers());

describe('hasSessionHint', () => {
  it('is true only for hasSession: true and caches within the TTL', async () => {
    const f = respond({ hasSession: true });
    expect(await hasSessionHint(f, () => 0)).toBe(true);
    expect(await hasSessionHint(f, () => 10_000)).toBe(true);
    expect(f).toHaveBeenCalledTimes(1);
    expect(f).toHaveBeenCalledWith('/api/v1/auth/session-status', { credentials: 'include', signal: expect.any(AbortSignal) });
  });

  it('refetches after the TTL', async () => {
    const f = respond({ hasSession: false });
    await hasSessionHint(f, () => 0);
    await hasSessionHint(f, () => 31_000);
    expect(f).toHaveBeenCalledTimes(2);
  });

  it.each([respond({ hasSession: false }), respond({}), respond(null, false), vi.fn().mockRejectedValue(new Error('x'))])(
    'treats guests, bad payloads and failures as no session',
    async (f) => {
      expect(await hasSessionHint(f, () => 0)).toBe(false);
    },
  );

  it('resolves to guest after the timeout, aborting a hung request', async () => {
    vi.useFakeTimers();
    let signal: AbortSignal | undefined;
    const hung = vi.fn((_url: string, init?: RequestInit) => {
      signal = init?.signal ?? undefined;
      return new Promise<Response>(() => {});
    });
    const result = hasSessionHint(hung as unknown as typeof fetch, () => 0);
    await vi.advanceTimersByTimeAsync(PROBE_TIMEOUT_MS - 1);
    expect(signal?.aborted).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    expect(await result).toBe(false);
    expect(signal?.aborted).toBe(true);
  });

  it('does not cache a failure for the full TTL', async () => {
    const f = vi.fn().mockRejectedValueOnce(new Error('x')).mockResolvedValue({ ok: true, json: async () => ({ hasSession: true }) } as Response);
    expect(await hasSessionHint(f, () => 0)).toBe(false);
    expect(await hasSessionHint(f, () => 1_000)).toBe(false);
    expect(f).toHaveBeenCalledTimes(1);
    expect(await hasSessionHint(f, () => 2_500)).toBe(true);
    expect(f).toHaveBeenCalledTimes(2);
  });

  it('does not cache a timeout for the full TTL either', async () => {
    vi.useFakeTimers();
    const f = vi.fn().mockReturnValueOnce(new Promise(() => {})).mockResolvedValue({ ok: true, json: async () => ({ hasSession: false }) } as Response);
    const first = hasSessionHint(f, () => 0);
    await vi.advanceTimersByTimeAsync(PROBE_TIMEOUT_MS);
    expect(await first).toBe(false);
    expect(await hasSessionHint(f, () => 2_500)).toBe(false);
    expect(f).toHaveBeenCalledTimes(2);
  });
});
