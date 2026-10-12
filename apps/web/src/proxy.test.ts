// @vitest-environment node
import { NextRequest } from 'next/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/strangler/edge-config', () => ({ readStranglerConfig: async () => null }));

import { proxy } from './proxy';

const call = (path: string, host = 'preview.example.com') =>
  proxy(new NextRequest(`https://${host}${path}`, { headers: { host, cookie: 'bc_bucket=1' } })) as Promise<Response> | Response;

afterEach(() => vi.unstubAllEnvs());

describe('proxy legacyDisabled wiring', () => {
  it('sends a manifest route to legacy when the flag is unset (config is null)', async () => {
    vi.stubEnv('LEGACY_ORIGIN', 'https://legacy.example.com');
    const res = await call('/privacy');
    expect(res.headers.get('x-middleware-rewrite')).toBe('https://legacy.example.com/privacy');
  });

  it('renders it on next and gives a 404 path a nonce CSP when DISABLE_LEGACY_FALLBACK is set on a preview', async () => {
    vi.stubEnv('LEGACY_ORIGIN', 'https://legacy.example.com');
    vi.stubEnv('DISABLE_LEGACY_FALLBACK', '1');
    vi.stubEnv('VERCEL_ENV', 'preview');
    expect((await call('/privacy')).headers.get('x-middleware-rewrite')).toBeNull();
    expect((await call('/nope')).headers.get('content-security-policy')).toMatch(/nonce-/);
  });

  it('ignores the flag on production', async () => {
    vi.stubEnv('LEGACY_ORIGIN', 'https://legacy.example.com');
    vi.stubEnv('DISABLE_LEGACY_FALLBACK', '1');
    vi.stubEnv('VERCEL_ENV', 'production');
    expect((await call('/privacy')).headers.get('x-middleware-rewrite')).toBe('https://legacy.example.com/privacy');
  });
});

describe('proxy refuses a flagged build serving production', () => {
  const flagged = () => vi.stubEnv('LEGACY_FALLBACK_DISABLED_AT_BUILD', '1');

  it('503s everything on VERCEL_ENV=production and logs', async () => {
    flagged();
    vi.stubEnv('VERCEL_ENV', 'production');
    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const res = await call('/privacy');
    expect(res.status).toBe(503);
    expect(res.headers.get('cache-control')).toBe('no-store');
    expect(log).toHaveBeenCalledOnce();
    log.mockRestore();
  });

  it('503s a promoted preview that keeps VERCEL_ENV=preview but is reached on the production domain', async () => {
    flagged();
    vi.stubEnv('VERCEL_ENV', 'preview');
    vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', 'book-club.example.com');
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect((await call('/nope', 'Book-Club.example.com')).status).toBe(503);
    expect((await call('/nope', 'preview.example.com')).status).not.toBe(503);
  });

  it('does nothing without the build marker', async () => {
    vi.stubEnv('VERCEL_ENV', 'production');
    vi.stubEnv('LEGACY_ORIGIN', 'https://legacy.example.com');
    expect((await call('/nope')).status).not.toBe(503);
  });
});
