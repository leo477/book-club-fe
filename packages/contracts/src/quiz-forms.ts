import { z } from 'zod';

export const QUIZ_OPTION_COUNT = 4;

/** Messages are i18n keys, as in the organizer forms. Values are trimmed before the length rules, as the Angular forms trimmed on submit. */
export const quizMetaForm = z.object({
  title: z.string().trim().min(1, 'QUIZ.create_title_required').min(3, 'QUIZ.create_title_min').max(100, 'QUIZ.create_title_max'),
  description: z.string().trim().max(500, 'QUIZ.create_desc_max'),
});
export type QuizMetaForm = z.input<typeof quizMetaForm>;

const option = z.string().trim().min(1, 'FORM_ERRORS.required').max(200, 'FORM_ERRORS.invalid');

export const quizQuestionForm = z.object({
  question: z.string().trim().min(1, 'QUIZ.create_question_required').min(5, 'QUIZ.create_question_min').max(500, 'FORM_ERRORS.invalid'),
  option0: option,
  option1: option,
  option2: option,
  option3: option,
  /** a radio group yields strings */
  correctIndex: z.enum(['0', '1', '2', '3']),
});
export type QuizQuestionForm = z.input<typeof quizQuestionForm>;

export const EMPTY_QUIZ_QUESTION: QuizQuestionForm = { question: '', option0: '', option1: '', option2: '', option3: '', correctIndex: '0' };
