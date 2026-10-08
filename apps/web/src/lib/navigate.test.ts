import { afterEach, describe, expect, it, vi } from 'vitest';
import { hardNavigate, replaceNavigate } from './navigate';

afterEach(() => vi.unstubAllGlobals());

describe('hardNavigate', () => {
  it.each(['/login', '/clubs?x=1', '/'])('navigates to the local path %s', (path) => {
    const loc = { href: '' };
    vi.stubGlobal('location', loc);
    hardNavigate(path);
    expect(loc.href).toBe(path);
  });

  it.each(['//evil.com', '/\\evil.com', 'javascript:alert(1)', 'https://evil.com', 'login', '', '/\t/evil.com', '/\n/evil.com', '/\r/evil.com', '/ok\u0000'])('refuses %j', (path) => {
    const loc = { href: '/here' };
    vi.stubGlobal('location', loc);
    expect(() => hardNavigate(path)).toThrow(/refusing/);
    expect(loc.href).toBe('/here');
  });
});

describe('replaceNavigate', () => {
  it('replaces the history entry for a local path', () => {
    const replace = vi.fn();
    vi.stubGlobal('location', { replace });
    replaceNavigate('/login');
    expect(replace).toHaveBeenCalledWith('/login');
  });

  it.each(['//evil.com', 'https://evil.com', '/\\evil.com', '/\t/evil.com'])('refuses %j', (path) => {
    const replace = vi.fn();
    vi.stubGlobal('location', { replace });
    expect(() => replaceNavigate(path)).toThrow(/refusing/);
    expect(replace).not.toHaveBeenCalled();
  });
});
