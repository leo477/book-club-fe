// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

const h = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock('next/headers', () => ({ headers: async () => ({ get: h.get }) }));

import { requestBucket } from './server';

const withHeaders = (values: Record<string, string>) => h.get.mockImplementation((k: string) => values[k] ?? null);

describe('requestBucket', () => {
  beforeEach(() => h.get.mockReset());

  it('prefers the proxy header over the cookie', async () => {
    withHeaders({ 'x-bc-bucket': '12', cookie: 'bc_bucket=34' });
    expect(await requestBucket()).toBe(12);
  });

  it('falls back to the cookie when the header is invalid', async () => {
    withHeaders({ 'x-bc-bucket': '500', cookie: 'a=b; bc_bucket=34' });
    expect(await requestBucket()).toBe(34);
  });

  it('returns null when neither is valid', async () => {
    withHeaders({ cookie: 'bc_bucket=abc' });
    expect(await requestBucket()).toBeNull();
  });
});
