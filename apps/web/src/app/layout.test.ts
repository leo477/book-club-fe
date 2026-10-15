import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@vercel/analytics/next', () => ({ Analytics: () => null }));
vi.mock('@vercel/speed-insights/next', () => ({ SpeedInsights: () => null }));
vi.mock('./fonts', () => ({ fontVariables: '' }));

import { metadata, viewport } from './layout';

describe('root layout head tags', () => {
  it('carries the tags Angular index.html set', () => {
    expect(metadata.keywords).toBe('книжковий клуб, читацький клуб, обговорення книг, Україна');
    expect(metadata.verification).toEqual({ google: 'hRDiW-8Es2YiXt4pzpnEGdfQmHv5w-nKNEUs0zYy4Js' });
    expect(metadata.icons).toEqual({
      icon: [
        { url: '/favicon.svg', type: 'image/svg+xml' },
        { url: '/favicon.ico', type: 'image/x-icon' },
      ],
    });
    expect(metadata.other).toEqual({ 'mobile-web-app-capable': 'yes' });
    expect(viewport.themeColor).toBe('#d97706');
  });

  it('sets no robots, so every page owns its decision', () => {
    expect(metadata.robots).toBeUndefined();
  });

  it('has every icon the metadata links in apps/web/public', () => {
    const icons = metadata.icons as { icon: { url: string }[] };
    expect(icons.icon.length).toBeGreaterThan(0);
    for (const { url } of icons.icon) {
      expect(existsSync(resolve(process.cwd(), 'public', url.slice(1))), url).toBe(true);
    }
  });
});
