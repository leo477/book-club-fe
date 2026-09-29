import {
  quiz,
  quizAttempt,
  quizLeaderboard,
  quizQuestion,
  quizSession,
  type AddQuestionRequest,
  type CreateQuizRequest,
  type UpdateQuestionRequest,
  type UpdateQuizRequest,
} from '@book-club/contracts';
import { z } from 'zod';
import type { ApiClient } from '../client';

export const quizApi = (c: ApiClient) => ({
  listForClub: (clubId: string, page: { skip?: number; limit?: number } = {}) =>
    c.get(`/clubs/${clubId}/quizzes`, z.array(quiz), { query: { ...page } }),
  create: (clubId: string, body: CreateQuizRequest) => c.post(`/clubs/${clubId}/quizzes`, quiz, body),
  get: (quizId: string) => c.get(`/quizzes/${quizId}`, quiz),
  update: (quizId: string, body: UpdateQuizRequest) => c.patch(`/quizzes/${quizId}`, quiz, body),
  setActive: (quizId: string, isActive: boolean) => c.patch(`/quizzes/${quizId}/active`, quiz, { isActive }),
  questions: (quizId: string) => c.get(`/quizzes/${quizId}/questions`, z.array(quizQuestion)),
  addQuestion: (quizId: string, body: AddQuestionRequest) =>
    c.post(`/quizzes/${quizId}/questions`, quizQuestion, body),
  updateQuestion: (quizId: string, questionId: string, body: UpdateQuestionRequest) =>
    c.patch(`/quizzes/${quizId}/questions/${questionId}`, quizQuestion, body),
  deleteQuestion: (quizId: string, questionId: string) =>
    c.delete(`/quizzes/${quizId}/questions/${questionId}`, z.void()),
  reorderQuestions: (quizId: string, order: string[]) =>
    c.put(`/quizzes/${quizId}/questions/order`, z.void(), { order }),
  submitAttempt: (quizId: string, answers: number[]) =>
    c.post(`/quizzes/${quizId}/attempts`, quizAttempt, { answers }),
  createSession: (quizId: string, eventId?: string) =>
    c.post(`/quizzes/${quizId}/sessions`, quizSession, { eventId: eventId ?? null }),
  activeSession: (quizId: string) => c.get(`/quizzes/${quizId}/sessions/active`, quizSession),
  leaderboard: (quizId: string, sessionId: string) =>
    c.get(`/quizzes/${quizId}/sessions/${sessionId}/leaderboard`, quizLeaderboard),
  closeSession: (quizId: string, sessionId: string) =>
    c.patch(`/quizzes/${quizId}/sessions/${sessionId}/close`, z.void(), {}),
});
