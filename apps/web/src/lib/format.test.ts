import { describe, expect, it } from 'vitest';
import { formatDate, initials } from './format';

describe('formatDate', () => {
  it('formats in the locale and the fixed zone so server and browser agree', () => {
    expect(formatDate('2026-03-05T22:30:00Z', 'en')).toBe('March 6, 2026');
    expect(formatDate('2026-03-05T22:30:00Z', 'uk')).toBe('6 березня 2026 р.');
  });

  it.each([[null], [undefined], [''], ['not a date']])('returns a dash for %s', (value) => {
    expect(formatDate(value, 'uk')).toBe('—');
  });
});

describe('initials', () => {
  it.each([
    ['Ada Lovelace', 'AL'],
    ['  grace   hopper  ', 'GH'],
    ['Plato', 'PL'],
    ['', '?'],
    [null, '?'],
  ])('%s -> %s', (name, expected) => expect(initials(name)).toBe(expected));
});
