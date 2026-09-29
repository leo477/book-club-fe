import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { IntlMessageFormat } from 'intl-messageformat';
import { describe, expect, it } from 'vitest';
import { applyOverrides, buildIcu, type Tree } from '../scripts/icu.ts';

const load = (locale: string): Tree =>
  JSON.parse(readFileSync(resolve(__dirname, '../../../public/i18n', `${locale}.json`), 'utf8'));
const loadOverrides = (locale: string): Tree =>
  JSON.parse(readFileSync(resolve(__dirname, '../overrides', `${locale}.json`), 'utf8'));
const built = (locale: string) => buildIcu(applyOverrides(load(locale), loadOverrides(locale)).merged);
const messages = { en: built('en').messages, uk: built('uk').messages };
const render = (locale: 'en' | 'uk', key: string, count: number) =>
  new IntlMessageFormat(messages[locale][key] as string, locale).format({ count });

describe('uk BOOK_VOTE.votes', () => {
  it.each([
    [0, 'голосів'],
    [1, 'голос'],
    [2, 'голоси'],
    [5, 'голосів'],
    [11, 'голосів'],
    [12, 'голосів'],
    [21, 'голос'],
    [22, 'голоси'],
  ])('%i -> %s', (count, expected) => {
    expect(render('uk', 'BOOK_VOTE.votes', count)).toBe(expected);
  });
});

describe('uk QUIZ.create_questions_count (override adds few and other)', () => {
  it.each([
    [0, 'запитань'],
    [1, 'запитання'],
    [2, 'запитання'],
    [3, 'запитання'],
    [4, 'запитання'],
    [5, 'запитань'],
    [11, 'запитань'],
    [12, 'запитань'],
    [21, 'запитання'],
    [22, 'запитання'],
  ])('%i -> %s', (count, expected) => {
    expect(render('uk', 'QUIZ.create_questions_count', count)).toBe(expected);
  });
});

describe('plural groups', () => {
  it.each(['en', 'uk'] as const)('%s: every plural group has at least 2 forms', (locale) => {
    const msgs = messages[locale];
    const groups = Object.entries(msgs).filter(([, m]) => m.includes(', plural,'));
    expect(groups.length).toBeGreaterThan(0);
    for (const [key, message] of groups) {
      const forms = [...message.matchAll(/\b(zero|one|two|few|many|other) \{/g)];
      expect(forms.length, key).toBeGreaterThanOrEqual(2);
    }
  });
});

describe('en plurals', () => {
  it.each([
    ['BOOK_VOTE.votes', 1, 'vote'],
    ['BOOK_VOTE.votes', 2, 'votes'],
    ['QUIZ.create_questions_count', 1, 'question'],
    ['QUIZ.create_questions_count', 2, 'questions'],
  ])('%s with %i -> %s', (key, count, expected) => {
    expect(render('en', key, count)).toBe(expected);
  });
});
