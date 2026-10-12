import { describe, expect, it } from 'vitest';
import { EMPTY_QUIZ_QUESTION, quizMetaForm, quizQuestionForm } from '../src';

// react-hook-form shows the first failing rule per field, so the first message is the one that matters
const keys = (result: { success: boolean; error?: { issues: { message: string; path: PropertyKey[] }[] } }) => {
  const seen = new Set<string>();
  return (result.error?.issues ?? []).filter((i) => !seen.has(i.path.join('.')) && seen.add(i.path.join('.'))).map((i) => i.message);
};

describe('quizMetaForm', () => {
  it('trims and accepts a valid form', () => {
    expect(quizMetaForm.parse({ title: '  Dune  ', description: ' sand ' })).toEqual({ title: 'Dune', description: 'sand' });
  });

  it.each([
    [{ title: '' }, 'QUIZ.create_title_required'],
    [{ title: '   ' }, 'QUIZ.create_title_required'],
    [{ title: 'ab' }, 'QUIZ.create_title_min'],
    [{ title: 'x'.repeat(101) }, 'QUIZ.create_title_max'],
    [{ description: 'x'.repeat(501) }, 'QUIZ.create_desc_max'],
  ])('reports %j as %s', (patch, key) => {
    expect(keys(quizMetaForm.safeParse({ title: 'Dune', description: '', ...patch }))).toEqual([key]);
  });

  it('allows the longest title and description', () => {
    expect(quizMetaForm.safeParse({ title: 'x'.repeat(100), description: 'y'.repeat(500) }).success).toBe(true);
  });
});

const question = { question: 'Who rules?', option0: 'a', option1: 'b', option2: 'c', option3: 'd', correctIndex: '0' };

describe('quizQuestionForm', () => {
  it('accepts the starting values once filled in', () => {
    expect(quizQuestionForm.safeParse({ ...EMPTY_QUIZ_QUESTION, question: 'Who rules?', option0: 'a', option1: 'b', option2: 'c', option3: 'd' }).success).toBe(true);
  });

  it('reports every empty field', () => {
    expect(keys(quizQuestionForm.safeParse(EMPTY_QUIZ_QUESTION))).toEqual(['QUIZ.create_question_required', 'FORM_ERRORS.required', 'FORM_ERRORS.required', 'FORM_ERRORS.required', 'FORM_ERRORS.required']);
  });

  it.each([
    [{ question: 'abcd' }, 'QUIZ.create_question_min'],
    [{ question: 'x'.repeat(501) }, 'FORM_ERRORS.invalid'],
    [{ option2: '  ' }, 'FORM_ERRORS.required'],
    [{ option3: 'x'.repeat(201) }, 'FORM_ERRORS.invalid'],
  ])('reports %j as %s', (patch, key) => {
    expect(keys(quizQuestionForm.safeParse({ ...question, ...patch }))).toEqual([key]);
  });

  it.each([['0'], ['3']])('accepts correct option %s', (correctIndex) => {
    expect(quizQuestionForm.safeParse({ ...question, correctIndex }).success).toBe(true);
  });

  it.each([['4'], ['-1'], ['']])('rejects correct option %j', (correctIndex) => {
    expect(quizQuestionForm.safeParse({ ...question, correctIndex }).success).toBe(false);
  });
});
