import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { IntlMessageFormat } from 'intl-messageformat';
import { describe, expect, it } from 'vitest';
import { buildIcu, toIcuBody, toNgx } from '../scripts/icu.ts';

const load = (locale: string): Record<string, string> =>
  JSON.parse(readFileSync(resolve(__dirname, '../locales', `${locale}.json`), 'utf8'));

const messages = { en: load('en'), uk: load('uk') };

describe('locale parity', () => {
  it('has exactly the same keys in en and uk', () => {
    expect(Object.keys(messages.en).sort()).toEqual(Object.keys(messages.uk).sort());
  });

  it('has no empty values', () => {
    for (const locale of Object.values(messages)) {
      for (const [key, value] of Object.entries(locale)) expect(value.trim(), key).not.toBe('');
    }
  });
});

describe.each(['en', 'uk'] as const)('%s ICU source', (locale) => {
  const source = messages[locale];

  it('parses every message', () => {
    for (const [key, message] of Object.entries(source)) {
      expect(() => new IntlMessageFormat(message, locale), key).not.toThrow();
    }
  });

  it('formats every message with placeholder values', () => {
    for (const [key, message] of Object.entries(source)) {
      const args = Object.fromEntries(
        [...message.matchAll(/\{(\w+)(?:,|\})/g)].map((m) => [m[1], m[1] === 'count' ? 1 : 'x']),
      );
      expect(() => new IntlMessageFormat(message, locale).format(args), key).not.toThrow();
    }
  });

  it('round-trips through the ngx-translate format used by the Angular app', () => {
    expect(buildIcu(toNgx(source)).messages).toEqual(source);
  });
});

describe('conversion rules', () => {
  it('converts interpolation and escapes ICU syntax', () => {
    expect(toIcuBody('Hi {{ name }}, it\'s {x}')).toBe("Hi {name}, it''s '{'x'}'");
  });

  it('keeps the source free of ngx-translate interpolation', () => {
    for (const locale of Object.values(messages)) {
      expect(Object.values(locale).some((m) => m.includes('{{'))).toBe(false);
    }
  });

  it('emits ngx-translate plural suffixes and interpolation for Angular', () => {
    expect(toNgx({ 'A.n': '{count, plural, one {x} other {{count} y}}', 'A.hi': 'Hi {name}' })).toEqual({
      A: { n_one: 'x', n_other: '{{ count }} y', hi: 'Hi {{ name }}' },
    });
  });

  it('builds ICU plurals with a valid other branch', () => {
    expect(messages.en['BOOK_VOTE.votes']).toBe('{count, plural, one {vote} other {votes}}');
    expect(messages.en['QUIZ.create_questions_count']).toBe(
      '{count, plural, one {question} many {questions} other {questions}}',
    );
  });

  it('selects the correct uk forms for votes', () => {
    const fmt = new IntlMessageFormat(messages.uk['BOOK_VOTE.votes'] as string, 'uk');
    const forms = Object.fromEntries([1, 2, 5, 21, 22, 11].map((n) => [n, fmt.format({ count: n })]));
    expect(forms).toEqual({ 1: 'голос', 2: 'голоси', 5: 'голосів', 21: 'голос', 22: 'голоси', 11: 'голосів' });
  });
});
