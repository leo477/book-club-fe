import { beforeEach, describe, expect, it, vi } from 'vitest';
import { hasSessionHint, resetSessionHint } from './session-hint';

const respond = (body: unknown, ok = true) => vi.fn(async () => ({ ok, json: async () => body }) as Response);

beforeEach(resetSessionHint);

describe('hasSessionHint', () => {
  it('is true only for hasSession: true and caches within the TTL', async () => {
    const f = respond({ hasSession: true });
    expect(await hasSessionHint(f, () => 0)).toBe(true);
    expect(await hasSessionHint(f, () => 10_000)).toBe(true);
    expect(f).toHaveBeenCalledTimes(1);
    expect(f).toHaveBeenCalledWith('/api/v1/auth/session-status', { credentials: 'include' });
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
});
