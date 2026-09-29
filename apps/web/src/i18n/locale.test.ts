import { describe, expect, it } from 'vitest';
import { nest, parseLocale, parseTheme } from './locale';

describe('locale helpers', () => {
  it('falls back to uk for missing or unknown locales', () => {
    expect(parseLocale(undefined)).toBe('uk');
    expect(parseLocale('fr')).toBe('uk');
    expect(parseLocale('en')).toBe('en');
  });

  it('falls back to system theme', () => {
    expect(parseTheme('dark')).toBe('dark');
    expect(parseTheme('x')).toBe('system');
  });

  it('nests dotted ICU keys without clobbering conflicts', () => {
    expect(nest({ 'A.b': 'x', 'A.c.d': 'y', 'A.b.z': 'skipped', E: 'e' })).toEqual({ A: { b: 'x', c: { d: 'y' } }, E: 'e' });
  });
});
