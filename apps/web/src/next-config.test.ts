// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';

const load = async (env: Record<string, string>) => {
  vi.resetModules();
  for (const [k, v] of Object.entries(env)) vi.stubEnv(k, v);
  const mod = await import('../next.config');
  return mod.default('phase-development-server');
};

const base = { NODE_ENV: 'development', LEGACY_ORIGIN: 'https://legacy.example.com' };

afterEach(() => vi.unstubAllEnvs());

describe('next.config rewrites', () => {
  it('keeps the legacy fallback by default', async () => {
    const rewrites = await (await load(base)).rewrites!();
    expect(rewrites).toMatchObject({ fallback: [{ source: '/:path*', destination: 'https://legacy.example.com/:path*' }] });
  });

  it('drops the fallback with DISABLE_LEGACY_FALLBACK on a preview, keeping the /api proxy', async () => {
    const rewrites = (await (await load({ ...base, DISABLE_LEGACY_FALLBACK: '1', VERCEL_ENV: 'preview' })).rewrites!()) as {
      beforeFiles: { source: string }[];
      fallback: unknown[];
    };
    expect(rewrites.fallback).toEqual([]);
    expect(rewrites.beforeFiles.map((r) => r.source)).toEqual(['/api/:path*']);
  });

  it('refuses to load when the flag is set for production', async () => {
    await expect(load({ ...base, BACKEND_ORIGIN: 'https://api.example.com', DISABLE_LEGACY_FALLBACK: '1', VERCEL_ENV: 'production', NODE_ENV: 'production' })).rejects.toThrow(/preview-only/);
  });
});
