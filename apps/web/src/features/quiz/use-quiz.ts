'use client';
'use no memo';

import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { isClubStub, type AddQuestionRequest, type Quiz, type QuizQuestion, type QuizSession, type UpdateQuestionRequest } from '@book-club/contracts';
import { eventsKey, useMyMembership } from '@/features/club-detail/use-club-detail';
import { useSession } from '@/features/clubs/use-session';
import { useClubForEdit } from '@/features/organizer/use-organizer';
import { api } from '@/lib/api';
import { useRef, useState } from 'react';

// Dropped as soon as nobody watches: a quiz, its questions or a leaderboard cached by an earlier visit must never stand in for the current one.
const live = { staleTime: 0, gcTime: 0, refetchOnWindowFocus: false } as const;

export const LEADERBOARD_POLL_MS = 30_000;
export const SESSION_POLL_MS = 15_000;

export const quizzesKey = (clubId: string) => ['club', clubId, 'quizzes'] as const;
export const quizKey = (quizId: string) => ['quiz', quizId, 'detail'] as const;
export const questionsKey = (quizId: string) => ['quiz', quizId, 'questions'] as const;
export const sessionKey = (quizId: string) => ['quiz', quizId, 'session'] as const;
export const leaderboardKey = (quizId: string, sessionId: string) => ['quiz', quizId, 'session', sessionId, 'leaderboard'] as const;

export const statusOf = (err: unknown): number | null =>
  typeof err === 'object' && err !== null && typeof (err as { status?: unknown }).status === 'number' ? (err as { status: number }).status : null;

export const useClubQuizzes = (clubId: string) =>
  useQuery({ queryKey: quizzesKey(clubId), queryFn: ({ signal }) => api.quiz.listForClub(clubId, {}, { signal }), ...live });

/** The quiz and, unless `withQuestions` is off, its questions; the backend hides the answers from everyone but organizers. */
export function useQuizDetail(quizId: string, withQuestions = true) {
  const quiz = useQuery({ queryKey: quizKey(quizId), queryFn: ({ signal }) => api.quiz.get(quizId, { signal }), retry: false, ...live });
  const questions = useQuery({ queryKey: questionsKey(quizId), queryFn: ({ signal }) => api.quiz.questions(quizId, { signal }), enabled: withQuestions, retry: false, ...live });
  return {
    quiz: quiz.data,
    questions: questions.data ?? [],
    isPending: quiz.isPending || (withQuestions && questions.isPending),
    error: quiz.error ?? questions.error,
    isError: quiz.isError || questions.isError,
    retry: () => void Promise.all([quiz.isError ? quiz.refetch() : null, questions.isError ? questions.refetch() : null]),
  };
}

/** No session is a 404, which is an answer (null), not a failure. */
export const useActiveSession = (quizId: string) =>
  useQuery({
    queryKey: sessionKey(quizId),
    queryFn: async ({ signal }): Promise<QuizSession | null> => {
      try {
        return await api.quiz.activeSession(quizId, { signal });
      } catch (err) {
        if (statusOf(err) === 404) return null;
        throw err;
      }
    },
    retry: false,
    ...live,
  });

/** Polls while the tab is visible (TanStack pauses the interval in a hidden tab) and refetches once when it comes back. */
export const useLeaderboard = (quizId: string, sessionId: string | undefined, intervalMs: number) =>
  useQuery({
    queryKey: leaderboardKey(quizId, sessionId ?? ''),
    queryFn: async ({ signal }) => (await api.quiz.leaderboard(quizId, sessionId ?? '', { signal })).entries,
    enabled: sessionId !== undefined,
    refetchInterval: intervalMs,
    retry: false,
    ...live,
    refetchOnWindowFocus: true,
  });

export const useClubEventsForSession = (clubId: string) =>
  useQuery({ queryKey: eventsKey(clubId, true), queryFn: () => api.clubs.events(clubId), staleTime: 0, refetchOnWindowFocus: false });

const putQuiz = (queryClient: QueryClient, clubId: string, quiz: Quiz) => {
  queryClient.setQueryData(quizKey(quiz.id), quiz);
  queryClient.setQueryData<Quiz[]>(quizzesKey(clubId), (list) => list?.map((q) => (q.id === quiz.id ? quiz : q)));
  void queryClient.invalidateQueries({ queryKey: quizzesKey(clubId) });
};

export function useToggleActive(clubId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ quizId, isActive }: { quizId: string; isActive: boolean }) => api.quiz.setActive(quizId, isActive),
    onSuccess: (quiz) => putQuiz(queryClient, clubId, quiz),
  });
}

export function useStartSession(quizId: string, clubId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (eventId: string) => api.quiz.createSession(quizId, eventId),
    onSuccess: (session) => {
      queryClient.setQueryData(sessionKey(quizId), session);
      void queryClient.invalidateQueries({ queryKey: quizzesKey(clubId) });
    },
  });
}

export function useEndSession(quizId: string, clubId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => api.quiz.closeSession(quizId, sessionId),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: quizzesKey(clubId) }),
  });
}

export interface DraftQuestion {
  /** absent on a question that is not saved yet */
  id?: string;
  question: string;
  options: string[];
  correctIndex: number;
}

export const draftsOf = (questions: readonly QuizQuestion[]): DraftQuestion[] =>
  questions.map((q) => ({ id: q.id, question: q.question, options: [...q.options], correctIndex: q.correctIndex ?? 0 }));

const body = (q: DraftQuestion): AddQuestionRequest & UpdateQuestionRequest => ({ question: q.question, options: q.options, correctIndex: q.correctIndex });

/**
 * Create, then add every question, then activate. The backend has no transaction for this, so a failure part-way leaves a quiz behind:
 * the retry resumes on that quiz instead of creating a second one.
 */
export function usePublishQuiz(clubId: string) {
  const queryClient = useQueryClient();
  const progress = useRef<{ quizId: string | null; added: number; active: boolean }>({ quizId: null, added: 0, active: false }).current;
  return useMutation({
    mutationFn: async ({ title, description, questions }: { title: string; description: string; questions: readonly DraftQuestion[] }) => {
      if (progress.quizId === null) progress.quizId = (await api.quiz.create(clubId, { title, description: description || null })).id;
      const quizId = progress.quizId;
      for (const q of questions.slice(progress.added)) {
        await api.quiz.addQuestion(quizId, body(q));
        progress.added += 1;
      }
      if (!progress.active) {
        await api.quiz.setActive(quizId, true);
        progress.active = true;
      }
      return quizId;
    },
    onSettled: () => void queryClient.invalidateQueries({ queryKey: quizzesKey(clubId) }),
  });
}

/** Update the quiz, delete the removed questions, then update or add the rest, in the order the editor shows them. */
export function useSaveQuiz(quizId: string, clubId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ title, description, questions, removedIds }: { title: string; description: string; questions: readonly DraftQuestion[]; removedIds: readonly string[] }) => {
      await api.quiz.update(quizId, { title, description });
      for (const id of removedIds) await api.quiz.deleteQuestion(quizId, id);
      for (const q of questions) {
        if (q.id) await api.quiz.updateQuestion(quizId, q.id, body(q));
        else await api.quiz.addQuestion(quizId, body(q));
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: quizzesKey(clubId) });
      void queryClient.invalidateQueries({ queryKey: ['quiz', quizId] });
    },
  });
}

/** Whether the viewer organizes this club (per-club role, not the global one). `pending` until the owner or membership check has run on this visit. */
export function useCanManage(clubId: string) {
  const { user } = useSession();
  const club = useClubForEdit(clubId, false);
  const [mountedAt] = useState(() => Date.now());
  const organizerId = club.data && !isClubStub(club.data) ? club.data.organizerId : undefined;
  const isOwner = user !== null && organizerId === user.id;
  const needsMembership = user !== null && !isOwner && !club.isPending;
  const membership = useMyMembership(clubId, needsMembership, true);
  const checked = membership.dataUpdatedAt >= mountedAt || membership.isError;
  const canManage = isOwner || (needsMembership && checked && membership.data?.role === 'organizer');
  return { canManage, pending: club.isPending || (needsMembership && !checked) };
}
