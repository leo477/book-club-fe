import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { IntlMessageFormat } from 'intl-messageformat';
import { describe, expect, it } from 'vitest';
import { applyOverrides, buildIcu, flatten, toIcuBody, type Tree } from '../scripts/icu.ts';

const load = (locale: string): Tree =>
  JSON.parse(readFileSync(resolve(__dirname, '../../../public/i18n', `${locale}.json`), 'utf8'));
const PLURAL = /^(.*)_(zero|one|two|few|many|other)$/;
const base = (key: string) => key.replace(PLURAL, '$1');

const en = load('en');
const uk = load('uk');
const overrides = {
  en: JSON.parse(readFileSync(resolve(__dirname, '../overrides/en.json'), 'utf8')) as Tree,
  uk: JSON.parse(readFileSync(resolve(__dirname, '../overrides/uk.json'), 'utf8')) as Tree,
};
const merged = { en: applyOverrides(en, overrides.en), uk: applyOverrides(uk, overrides.uk) };
const built = { en: buildIcu(merged.en.merged), uk: buildIcu(merged.uk.merged) };

describe('locale parity', () => {
  it('has the same keys in en and uk once plural forms are collapsed', () => {
    const keys = (o: Tree) => [...new Set(Object.keys(flatten(o)).map(base))].sort();
    expect(keys(en)).toEqual(keys(uk));
  });

  it('has no empty values', () => {
    for (const locale of [en, uk]) {
      for (const [key, value] of Object.entries(flatten(locale))) expect(value.trim(), key).not.toBe('');
    }
  });
});

describe('overrides', () => {
  it('only add keys the source lacks, never replace existing ones', () => {
    const { merged: m, added, redundant } = applyOverrides({ A: { x: 'src' } }, { A: { x: 'over', y: 'new' } });
    expect(flatten(m)).toEqual({ 'A.x': 'src', 'A.y': 'new' });
    expect(added).toEqual(['A.y']);
    expect(redundant).toEqual(['A.x']);
  });

  it.each(['en', 'uk'] as const)('%s overrides are all still needed (remove them once the source JSON has the keys)', (locale) => {
    expect(merged[locale].redundant).toEqual([]);
    expect(merged[locale].added.length).toBeGreaterThan(0);
  });

  it('keeps en and uk key parity after overrides', () => {
    const keys = (o: Tree) => [...new Set(Object.keys(flatten(o)).map(base))].sort();
    expect(keys(merged.en.merged)).toEqual(keys(merged.uk.merged));
  });
});

describe.each(['en', 'uk'] as const)('%s ICU output', (locale) => {
  const { messages, sourceKeyCount, pluralGroups } = built[locale];
  const source = flatten(merged[locale].merged);

  it('parses every generated message', () => {
    for (const [key, message] of Object.entries(messages)) {
      expect(() => new IntlMessageFormat(message, locale), key).not.toThrow();
    }
  });

  it('round-trips the source key count', () => {
    const pluralForms = Object.keys(source).filter((k) => PLURAL.test(k)).length;
    expect(sourceKeyCount).toBe(Object.keys(source).length);
    expect(Object.keys(messages).length + pluralForms - pluralGroups).toBe(sourceKeyCount);
  });

  it('formats every message with placeholder values', () => {
    for (const [key, message] of Object.entries(messages)) {
      const args = Object.fromEntries(
        [...message.matchAll(/\{(\w+)(?:,|\})/g)].map((m) => [m[1], m[1] === 'count' ? 1 : 'x']),
      );
      expect(() => new IntlMessageFormat(message, locale).format(args), key).not.toThrow();
    }
  });
});

describe('conversion rules', () => {
  it('converts interpolation and escapes ICU syntax', () => {
    expect(toIcuBody('Hi {{ name }}, it\'s {x}')).toBe("Hi {name}, it''s '{'x'}'");
  });

  it('keeps interpolations found in the source', () => {
    const count = (o: Record<string, string>) => Object.values(o).filter((v) => v.includes('{{')).length;
    expect(count(flatten(en))).toBe(11);
    expect(Object.values(built.en.messages).some((m) => m.includes('{{'))).toBe(false);
  });

  it('builds ICU plurals with a valid other branch', () => {
    expect(built.en.messages['BOOK_VOTE.votes']).toBe('{count, plural, one {vote} other {votes}}');
    expect(built.en.messages['QUIZ.create_questions_count']).toBe(
      '{count, plural, one {question} many {questions} other {questions}}',
    );
  });

  it('selects the correct uk forms for votes', () => {
    const fmt = new IntlMessageFormat(built.uk.messages['BOOK_VOTE.votes'] as string, 'uk');
    const forms = Object.fromEntries([1, 2, 5, 21, 22, 11].map((n) => [n, fmt.format({ count: n })]));
    expect(forms).toEqual({ 1: 'голос', 2: 'голоси', 5: 'голосів', 21: 'голос', 22: 'голоси', 11: 'голосів' });
  });
});
