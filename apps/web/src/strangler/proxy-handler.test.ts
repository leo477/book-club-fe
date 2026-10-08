// @vitest-environment node
import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';
import { parseConfig, type StranglerConfig } from './config';
import { handleProxy } from './proxy-handler';

const LEGACY = 'https://legacy.example.com';
const probe = '/__strangler-probe';
const config = (flag: unknown, extra: object = {}): StranglerConfig | null =>
  parseConfig({ version: 1, enabled: true, routes: { [probe]: flag }, ...extra });

const run = (
  path: string,
  cfg: () => Promise<StranglerConfig | null>,
  cookie?: string,
  extra: { headers?: Record<string, string>; legacyOrigin?: string | undefined; dev?: boolean | undefined } = {},
) =>
  handleProxy(
    new NextRequest(`https://app.example.com${path}`, {
      headers: { ...(cookie ? { cookie } : {}), ...extra.headers },
    }),
    { readConfig: cfg, legacyOrigin: 'legacyOrigin' in extra ? extra.legacyOrigin : LEGACY, dev: extra.dev },
  );

const isLegacy = (res: Response) => res.headers.get('x-middleware-rewrite') === `${LEGACY}${probe}`;

describe('handleProxy decision table', () => {
  it('passes non-manifest paths through untouched, without cookie or CSP', async () => {
    const res = await run('/login', () => Promise.reject(new Error('must not be read')));
    expect(res.headers.get('x-middleware-next')).toBe('1');
    expect(res.headers.get('content-security-policy')).toBeNull();
    expect(res.cookies.get('bc_bucket')).toBeUndefined();
  });

  it('renders next with a nonce CSP when enabled and in bucket', async () => {
    const res = await run(probe, async () => config({ target: 'next', percent: 100 }), 'bc_bucket=42');
    expect(isLegacy(res)).toBe(false);
    const csp = res.headers.get('content-security-policy')!;
    expect(csp).toMatch(/script-src 'self' 'nonce-[^']+' 'strict-dynamic'/);
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).not.toContain('require-trusted-types-for');
    expect(res.headers.get('content-security-policy-report-only')).toContain("require-trusted-types-for 'script'");
    expect(res.cookies.get('bc_bucket')).toBeUndefined();
  });

  it('uses a fresh nonce per request', async () => {
    const read = async () => config({ target: 'next', percent: 100 });
    const nonce = async () => (await run(probe, read)).headers.get('content-security-policy')!.match(/nonce-([^']+)/)![1];
    expect(await nonce()).not.toBe(await nonce());
  });

  it.each([
    ['target legacy', () => config({ target: 'legacy', percent: 100 })],
    ['percent 0', () => config({ target: 'next', percent: 0 })],
    ['route missing', () => parseConfig({ version: 1, routes: {} })],
    ['globally disabled', () => config({ target: 'next', percent: 100 }, { enabled: false })],
    ['config null', () => null],
  ])('rewrites to legacy: %s', async (_name, make) => {
    const res = await run(probe, async () => make(), 'bc_bucket=0');
    expect(isLegacy(res)).toBe(true);
    expect(res.headers.get('content-security-policy')).toBeNull();
  });

  it('rewrites to legacy when the bucket is above percent', async () => {
    const res = await run(probe, async () => config({ target: 'next', percent: 30 }), 'bc_bucket=30');
    expect(isLegacy(res)).toBe(true);
  });

  it('fail-safes to legacy when Edge Config is unavailable', async () => {
    const res = await run(probe, async () => null, 'bc_bucket=0');
    expect(isLegacy(res)).toBe(true);
  });

  it('assigns a sticky bucket cookie when missing or invalid', async () => {
    for (const cookie of [undefined, 'bc_bucket=abc', 'bc_bucket=100']) {
      const res = await run(probe, async () => config({ target: 'next', percent: 100 }), cookie);
      const set = res.cookies.get('bc_bucket')!;
      expect(Number(set.value)).toBeGreaterThanOrEqual(0);
      expect(Number(set.value)).toBeLessThan(100);
      expect(set.sameSite).toBe('lax');
      expect(set.maxAge).toBe(60 * 60 * 24 * 30);
      expect(set.httpOnly).toBeFalsy();
    }
  });

  it('sets the bucket cookie on legacy rewrites too', async () => {
    const res = await run(probe, async () => null);
    expect(isLegacy(res)).toBe(true);
    expect(res.cookies.get('bc_bucket')).toBeDefined();
  });
});

describe('handleProxy hardening', () => {
  const off = async () => config({ target: 'legacy', percent: 100 });
  const on = async () => config({ target: 'next', percent: 100 });

  it.each([undefined, '', 'not a url', 'javascript:alert(1)'])('returns 503 for legacy when LEGACY_ORIGIN is %s and not dev', async (legacyOrigin) => {
    const res = await run(probe, off, 'bc_bucket=0', { legacyOrigin, dev: false });
    expect(res.status).toBe(503);
    expect(res.headers.get('x-middleware-next')).toBeNull();
    expect(res.headers.get('x-middleware-rewrite')).toBeNull();
  });

  it('falls through to next in dev when LEGACY_ORIGIN is missing', async () => {
    const res = await run(probe, off, 'bc_bucket=0', { legacyOrigin: undefined, dev: true });
    expect(res.headers.get('x-middleware-next')).toBe('1');
  });

  it('normalizes a legacy origin that carries a path', async () => {
    const res = await run(probe, off, 'bc_bucket=0', { legacyOrigin: `${LEGACY}/some/path` });
    expect(isLegacy(res)).toBe(true);
  });

  it.each(['//evil.com', '/\\evil.com', '//evil.com/__strangler-probe', '/\\evil.com/__strangler-probe'])(
    'never rewrites %s to a foreign host',
    async (path) => {
      const res = await run(path, off, 'bc_bucket=0');
      const rewrite = res.headers.get('x-middleware-rewrite');
      if (rewrite) expect(new URL(rewrite).host).toBe(new URL(LEGACY).host);
    },
  );

  it('overwrites a client-supplied bucket header with the cookie value on next', async () => {
    const res = await run(probe, on, 'bc_bucket=7', { headers: { 'x-bc-bucket': '99' } });
    expect(res.headers.get('x-middleware-request-x-bc-bucket')).toBe('7');
  });

  it.each([
    ['legacy rewrite', probe, off],
    ['non-manifest path', '/events', off],
  ])('strips a client-supplied bucket header on %s', async (_n, path, cfg) => {
    const res = await run(path, cfg, 'bc_bucket=0', { headers: { 'x-bc-bucket': '99' } });
    expect(res.headers.get('x-middleware-request-x-bc-bucket')).toBeNull();
    expect(res.headers.get('x-middleware-override-headers') ?? '').not.toContain('x-bc-bucket');
  });

  it('marks next responses as private, no-store', async () => {
    const res = await run(probe, on, 'bc_bucket=0');
    expect(res.headers.get('cache-control')).toBe('private, no-store');
  });
});

describe('handleProxy CSP on the shell routes', () => {
  const routes = (flag: unknown) => parseConfig({ version: 1, enabled: true, routes: { '/clubs': flag, '/privacy': flag } });

  it.each(['/clubs', '/clubs/', '/privacy'])('applies the nonce CSP and report-only Trusted Types to Next-owned %s', async (path) => {
    const res = await run(path, async () => routes({ target: 'next', percent: 100 }), 'bc_bucket=1');
    const csp = res.headers.get('content-security-policy')!;
    const nonce = csp.match(/'nonce-([^']+)'/)![1];
    expect(csp).toContain("style-src 'self' 'unsafe-inline'");
    expect(csp).not.toContain('require-trusted-types-for');
    expect(res.headers.get('content-security-policy-report-only')).toContain("require-trusted-types-for 'script'");
    expect(res.headers.get('x-middleware-request-x-nonce')).toBe(nonce);
    expect(res.headers.get('x-middleware-request-content-security-policy')).toBe(csp);
  });

  it('leaves legacy-owned responses untouched: no CSP of ours on the rewrite or the forwarded request', async () => {
    const res = await run('/clubs', async () => routes({ target: 'legacy', percent: 100 }), 'bc_bucket=1');
    expect(res.headers.get('x-middleware-rewrite')).toBe(`${LEGACY}/clubs`);
    expect(res.headers.get('content-security-policy')).toBeNull();
    expect(res.headers.get('content-security-policy-report-only')).toBeNull();
    expect(res.headers.get('x-middleware-request-content-security-policy')).toBeNull();
    expect(res.headers.get('x-middleware-request-x-nonce')).toBeNull();
  });
});

describe('legacy-shadowed paths', () => {
  const UUID = '3f2b8c1e-9a4d-4e7b-8c5f-1a2b3c4d5e6f';
  const on = async () => parseConfig({ version: 1, enabled: true, routes: { '/clubs/:id': { target: 'next', percent: 100 } } });
  const rewrittenTo = (res: Response, path: string) => res.headers.get('x-middleware-rewrite') === `${LEGACY}${path}`;

  it('sends /clubs/create to legacy even with /clubs/:id fully on next', async () => {
    const res = await run('/clubs/create', on, 'bc_bucket=0');
    expect(rewrittenTo(res, '/clubs/create')).toBe(true);
    expect(res.headers.get('content-security-policy')).toBeNull();
  });

  it('does not read the flags for a shadowed path', async () => {
    const res = await run('/clubs/create', () => Promise.reject(new Error('must not be read')), 'bc_bucket=0');
    expect(rewrittenTo(res, '/clubs/create')).toBe(true);
  });

  it('still serves a UUID from next when on, and from legacy when the flag is off', async () => {
    expect(rewrittenTo(await run(`/clubs/${UUID}`, on, 'bc_bucket=0'), `/clubs/${UUID}`)).toBe(false);
    const off = async () => parseConfig({ version: 1, enabled: true, routes: { '/clubs/:id': { target: 'legacy', percent: 100 } } });
    expect(rewrittenTo(await run(`/clubs/${UUID}`, off, 'bc_bucket=0'), `/clubs/${UUID}`)).toBe(true);
  });

  it('leaves deeper legacy paths to the framework fallback', async () => {
    const res = await run(`/clubs/${UUID}/manage`, on, 'bc_bucket=0');
    expect(res.headers.get('x-middleware-next')).toBe('1');
  });

  it('returns 503 for a shadowed path when there is no legacy origin in production', async () => {
    const res = await run('/clubs/create', on, 'bc_bucket=0', { legacyOrigin: undefined, dev: false });
    expect(res.status).toBe(503);
  });
});
