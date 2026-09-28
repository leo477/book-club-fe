import { z } from 'zod';
import { tolerantEnum } from './tolerant';

const QUIZ_STATUSES = ['draft', 'active', 'live', 'closed'] as const;
export const quizStatus = z.enum(QUIZ_STATUSES);
export type QuizStatus = z.infer<typeof quizStatus>;

export const quiz = z.object({
  id: z.string(),
  clubId: z.string(),
  createdBy: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  isActive: z.boolean(),
  status: tolerantEnum(QUIZ_STATUSES, 'draft').default('draft'),
});
export type Quiz = z.infer<typeof quiz>;

export const quizQuestion = z.object({
  id: z.string(),
  quizId: z.string(),
  question: z.string(),
  options: z.array(z.string()),
  correctIndex: z.number().nullish(),
  position: z.number().default(0),
});
export type QuizQuestion = z.infer<typeof quizQuestion>;

export const quizAttempt = z.object({
  id: z.string(),
  quizId: z.string(),
  userId: z.string(),
  score: z.number(),
  total: z.number(),
  answers: z.array(z.number()),
});
export type QuizAttempt = z.infer<typeof quizAttempt>;

export const quizSession = z.object({
  id: z.string(),
  quizId: z.string(),
  eventId: z.string().nullable(),
  startedBy: z.string(),
  startedAt: z.string(),
  closedAt: z.string().nullable(),
  participantCount: z.number(),
});
export type QuizSession = z.infer<typeof quizSession>;

export const quizLeaderboardEntry = z.object({
  rank: z.number(),
  userId: z.string(),
  displayName: z.string(),
  avatarUrl: z.string().nullable(),
  score: z.number(),
  totalQuestions: z.number(),
  hasAttempted: z.boolean(),
});
export type QuizLeaderboardEntry = z.infer<typeof quizLeaderboardEntry>;

export const quizLeaderboard = z.object({ entries: z.array(quizLeaderboardEntry) });
export type QuizLeaderboard = z.infer<typeof quizLeaderboard>;

export const createQuizRequest = z.object({
  title: z.string().max(200),
  description: z.string().max(2000).nullish(),
});
export type CreateQuizRequest = z.input<typeof createQuizRequest>;

export const updateQuizRequest = createQuizRequest;
export type UpdateQuizRequest = z.input<typeof updateQuizRequest>;

export const addQuestionRequest = z.object({
  question: z.string().max(1000),
  options: z.array(z.string()),
  correctIndex: z.number().int(),
});
export type AddQuestionRequest = z.input<typeof addQuestionRequest>;

export const updateQuestionRequest = addQuestionRequest.partial();
export type UpdateQuestionRequest = z.input<typeof updateQuestionRequest>;
