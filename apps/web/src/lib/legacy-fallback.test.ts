import { describe, expect, it } from 'vitest';
import { assertLegacyFallbackAllowed, fallbackRewrites, legacyFallbackDisabled } from './legacy-fallback';

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
