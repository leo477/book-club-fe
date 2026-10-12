import { describe, expect, it } from 'vitest';
import { assertLegacyFallbackAllowed, fallbackRewrites, flaggedBuildOnProduction, legacyFallbackDisabled } from './legacy-fallback';

const on = { DISABLE_LEGACY_FALLBACK: '1' };

describe('legacyFallbackDisabled', () => {
  it.each([
    [{ ...on, VERCEL_ENV: 'preview', NODE_ENV: 'production' }, true],
    [{ DISABLE_LEGACY_FALLBACK: 'true', VERCEL_ENV: 'preview' }, true],
    [{ ...on, NODE_ENV: 'development' }, true],
    [{ ...on, VERCEL_ENV: 'production', NODE_ENV: 'production' }, false],
    [{ ...on, VERCEL_ENV: 'development' }, false],
    [{ ...on, NODE_ENV: 'production' }, false],
    [{ VERCEL_ENV: 'preview' }, false],
    [{ DISABLE_LEGACY_FALLBACK: '0', VERCEL_ENV: 'preview' }, false],
    [{ DISABLE_LEGACY_FALLBACK: 'yes', VERCEL_ENV: 'preview' }, false],
  ])('%j -> %s', (env, expected) => {
    expect(legacyFallbackDisabled(env)).toBe(expected);
  });
});

describe('assertLegacyFallbackAllowed', () => {
  it('throws for production and for a bare production build', () => {
    expect(() => assertLegacyFallbackAllowed({ ...on, VERCEL_ENV: 'production', NODE_ENV: 'production' })).toThrow(/preview-only/);
    expect(() => assertLegacyFallbackAllowed({ ...on, NODE_ENV: 'production' })).toThrow(/preview-only/);
  });

  it('passes for preview, dev and when the flag is unset', () => {
    expect(() => assertLegacyFallbackAllowed({ ...on, VERCEL_ENV: 'preview', NODE_ENV: 'production' })).not.toThrow();
    expect(() => assertLegacyFallbackAllowed({ ...on, NODE_ENV: 'development' })).not.toThrow();
    expect(() => assertLegacyFallbackAllowed({ VERCEL_ENV: 'production', NODE_ENV: 'production' })).not.toThrow();
  });
});

describe('fallbackRewrites', () => {
  it('proxies everything to legacy unless disabled or unconfigured', () => {
    expect(fallbackRewrites('https://l.example', false)).toEqual([{ source: '/:path*', destination: 'https://l.example/:path*' }]);
    expect(fallbackRewrites('https://l.example', true)).toEqual([]);
    expect(fallbackRewrites(null, false)).toEqual([]);
  });
});

describe('flaggedBuildOnProduction', () => {
  it.each([
    ['1', { VERCEL_ENV: 'production' }, null, true],
    ['1', { VERCEL_ENV: 'preview', VERCEL_PROJECT_PRODUCTION_URL: 'p.example.com' }, 'P.example.com', true],
    ['1', { VERCEL_ENV: 'preview', VERCEL_PROJECT_PRODUCTION_URL: 'p.example.com' }, 'x.vercel.app', false],
    ['1', { VERCEL_ENV: 'preview' }, 'p.example.com', false],
    ['1', { VERCEL_ENV: 'preview', VERCEL_PROJECT_PRODUCTION_URL: 'p.example.com' }, 'p.example.com:443', true],
    ['1', { VERCEL_ENV: 'preview', VERCEL_PROJECT_PRODUCTION_URL: 'p.example.com' }, 'p.example.com.', true],
    ['1', { VERCEL_ENV: 'preview', VERCEL_PROJECT_PRODUCTION_URL: 'p.example.com' }, 'WWW.P.example.com:3000', true],
    ['1', { VERCEL_ENV: 'preview', VERCEL_PROJECT_PRODUCTION_URL: 'www.p.example.com' }, 'p.example.com', true],
    ['1', { VERCEL_ENV: 'preview', VERCEL_PROJECT_PRODUCTION_URL: 'https://p.example.com/' }, 'p.example.com', true],
    ['1', { VERCEL_ENV: 'preview', VERCEL_PROJECT_PRODUCTION_URL: 'p.example.com' }, 'book-club-git-x-me.vercel.app', false],
    ['1', { VERCEL_ENV: 'preview', VERCEL_PROJECT_PRODUCTION_URL: 'p.example.com' }, 'notp.example.com', false],
    ['1', { VERCEL_ENV: 'preview', VERCEL_PROJECT_PRODUCTION_URL: 'p.example.com' }, 'p.example.com.evil.com', false],
    ['', { VERCEL_ENV: 'production' }, null, false],
    [undefined, { VERCEL_ENV: 'production' }, null, false],
  ])('marker=%s %j host=%s -> %s', (marker, env, host, expected) => {
    expect(flaggedBuildOnProduction(marker, env, host)).toBe(expected);
  });
});
