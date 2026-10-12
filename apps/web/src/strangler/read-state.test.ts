// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';
import { parseConfig } from './config';

vi.mock('next/headers', () => ({ headers: async () => ({ get: () => null }) }));
vi.mock('./edge-config', () => ({ readStranglerConfig: async () => parseConfig({ version: 1, enabled: false, routes: {} }) }));

import { readState } from './server';

afterEach(() => vi.unstubAllEnvs());

describe('readState', () => {
  it('follows the config by default', async () => {
    expect((await readState(5, ['shell.chatWidget'])).routes.every((r) => !r.enabled)).toBe(true);
  });

  it('enables every manifest route on a preview with the legacy fallback disabled, leaving shell flags to the config', async () => {
    vi.stubEnv('DISABLE_LEGACY_FALLBACK', '1');
    vi.stubEnv('VERCEL_ENV', 'preview');
    const { routes } = await readState(5, ['shell.chatWidget']);
    expect(routes.find((r) => r.pattern === '/clubs/:id')?.enabled).toBe(true);
    expect(routes.find((r) => r.pattern === 'shell.chatWidget')?.enabled).toBe(false);
  });

  it('ignores the flag on production', async () => {
    vi.stubEnv('DISABLE_LEGACY_FALLBACK', '1');
    vi.stubEnv('VERCEL_ENV', 'production');
    expect((await readState(5)).routes.every((r) => !r.enabled)).toBe(true);
  });
});
