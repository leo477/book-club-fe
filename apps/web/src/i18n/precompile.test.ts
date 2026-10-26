import compile from 'icu-minify/compile';
import format from 'icu-minify/format';
import { IntlMessageFormat } from 'intl-messageformat';
import en from '@book-club/i18n/en.icu.json';
import uk from '@book-club/i18n/uk.icu.json';
import { describe, expect, it } from 'vitest';

const options = {
  formatters: {
    getDateTimeFormat: (
      ...a: ConstructorParameters<typeof Intl.DateTimeFormat>
    ) => new Intl.DateTimeFormat(...a),
    getNumberFormat: (...a: ConstructorParameters<typeof Intl.NumberFormat>) =>
      new Intl.NumberFormat(...a),
    getPluralRules: (...a: ConstructorParameters<typeof Intl.PluralRules>) =>
      new Intl.PluralRules(...a),
  },
};
const COUNTS = [0, 1, 2, 3, 4, 5, 11, 12, 14, 21, 22, 25, 100, 101, 102];

// the build precompiles every catalog message, so the format-only runtime must render exactly what the ICU parser does
describe.each([
  ['uk', uk],
  ['en', en],
] as const)('precompiled %s catalog', (locale, catalog) => {
  it('formats every message like the ICU runtime', () => {
    for (const [key, message] of Object.entries(
      catalog as Record<string, string>,
    )) {
      const names = [...message.matchAll(/\{\s*(\w+)/g)].map((m) => m[1]!);
      const compiled = compile(message);
      for (const count of COUNTS) {
        const values = Object.fromEntries(
          names.map((name) => [name, name === 'count' ? count : `<${name}>`]),
        );
        expect(
          format(compiled, locale, values, options),
          `${locale} ${key} @${count}`,
        ).toBe(new IntlMessageFormat(message, locale).format(values));
      }
    }
  });
});

describe('uk plural categories', () => {
  const compiled = compile(
    '{count, plural, one {# книга} few {# книги} many {# книг} other {# книги}}',
  );
  it.each([
    [1, '1 книга'],
    [3, '3 книги'],
    [5, '5 книг'],
    [21, '21 книга'],
    [11, '11 книг'],
  ])('%i', (count, text) => {
    expect(format(compiled, 'uk', { count }, options)).toBe(text);
  });
  it('keeps escaped quotes and braces', () => {
    expect(
      format(compile("It''s '{'{name}'}'"), 'en', { name: 'x' }, options),
    ).toBe("It's {x}");
  });
});
