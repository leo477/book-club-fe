import { afterEach, describe, expect, it, vi } from 'vitest';
import { hardNavigate } from './navigate';

afterEach(() => vi.unstubAllGlobals());

describe('hardNavigate', () => {
  it.each(['/login', '/clubs?x=1', '/'])('navigates to the local path %s', (path) => {
    const loc = { href: '' };
    vi.stubGlobal('location', loc);
    hardNavigate(path);
    expect(loc.href).toBe(path);
  });

  it.each(['//evil.com', '/\\evil.com', 'javascript:alert(1)', 'https://evil.com', 'login', ''])('refuses %j', (path) => {
    const loc = { href: '/here' };
    vi.stubGlobal('location', loc);
    expect(() => hardNavigate(path)).toThrow(/refusing/);
    expect(loc.href).toBe('/here');
  });
});
