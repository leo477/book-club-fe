import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { IntlMessageFormat } from 'intl-messageformat';
import { describe, expect, it } from 'vitest';
import { flatten, buildIcu, type Tree } from '../scripts/icu.ts';

const load = (locale: string): Tree =>
  JSON.parse(readFileSync(resolve(__dirname, '../../../public/i18n', `${locale}.json`), 'utf8'));
const messages = { en: buildIcu(load('en')).messages, uk: buildIcu(load('uk')).messages };
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

describe('uk QUIZ.create_questions_count', () => {
  it.each([
    [0, 'запитань'],
    [1, 'запитання'],
    [5, 'запитань'],
    [11, 'запитань'],
    [12, 'запитань'],
    [21, 'запитання'],
  ])('%i -> %s', (count, expected) => {
    expect(render('uk', 'QUIZ.create_questions_count', count)).toBe(expected);
  });

  it('has no few form in the source, so 2 falls back to the genitive plural (known gap)', () => {
    expect(Object.keys(flatten(load('uk'))).some((k) => k === 'QUIZ.create_questions_count_few')).toBe(false);
    expect(render('uk', 'QUIZ.create_questions_count', 2)).toBe('запитань');
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
