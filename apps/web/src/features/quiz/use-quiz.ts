'use client';
'use no memo';

import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { isClubStub, type Quiz, type QuizQuestion, type QuizSession, type UpdateQuestionRequest } from '@book-club/contracts';
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
    /** everything needed is loaded; a failed refetch after that must not take the page down */
    ready: quiz.data !== undefined && (!withQuestions || questions.data !== undefined),
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
  /** stable identity of the draft entry, saved or not */
  key: string;
  /** absent on a question that is not saved yet */
  id?: string;
  question: string;
  options: string[];
  /** null when the backend did not reveal it; such a question is sent without it, so the stored answer stays */
  correctIndex: number | null;
}

let draftSeq = 0;
export const newDraftKey = (): string => `new-${(draftSeq += 1)}`;

export const draftsOf = (questions: readonly QuizQuestion[]): DraftQuestion[] =>
  questions.map((q) => ({ key: q.id, id: q.id, question: q.question, options: [...q.options], correctIndex: q.correctIndex ?? null }));

const body = (q: DraftQuestion): UpdateQuestionRequest => ({
  question: q.question,
  options: q.options,
  ...(q.correctIndex === null ? {} : { correctIndex: q.correctIndex }),
});

interface SyncState {
  /** draft key -> server id, for questions this hook added */
  created: Map<string, string>;
  deleted: Set<string>;
  /** server id -> what the server holds for it, as far as this hook knows */
  held: Map<string, QuestionFields>;
}

type QuestionFields = Pick<DraftQuestion, 'question' | 'options' | 'correctIndex'>;

const newSync = (): SyncState => ({ created: new Map(), deleted: new Set(), held: new Map() });

const fieldsOf = (q: DraftQuestion): QuestionFields => ({ question: q.question, options: [...q.options], correctIndex: q.correctIndex });

/** An answer the backend did not reveal (null) is sent without one, so it cannot make a question differ. */
const unchanged = (q: DraftQuestion, held: QuestionFields | undefined) =>
  held !== undefined &&
  q.question === held.question &&
  q.options.length === held.options.length &&
  q.options.every((o, i) => o === held.options[i]) &&
  (q.correctIndex === null || q.correctIndex === held.correctIndex);

const addDraft = async (quizId: string, q: DraftQuestion, state: SyncState) => {
  const { id } = await api.quiz.addQuestion(quizId, { question: q.question, options: q.options, correctIndex: q.correctIndex ?? 0 });
  state.created.set(q.key, id);
  state.held.set(id, fieldsOf(q));
};

const deleteOnce = async (quizId: string, id: string, state: SyncState) => {
  if (state.deleted.has(id)) return;
  try {
    await api.quiz.deleteQuestion(quizId, id);
  } catch (err) {
    if (statusOf(err) !== 404) throw err;
  }
  state.deleted.add(id);
};

/**
 * Make the server's questions match the draft, safe to repeat after any failure: what was removed is deleted (a 404 means it is gone),
 * what an earlier attempt added is updated rather than added again, and what the draft no longer holds is deleted.
 */
async function syncQuestions(quizId: string, questions: readonly DraftQuestion[], removedIds: readonly string[], state: SyncState) {
  for (const id of removedIds) await deleteOnce(quizId, id, state);
  const keys = new Set(questions.map((q) => q.key));
  for (const [key, id] of state.created) {
    if (keys.has(key)) continue;
    await deleteOnce(quizId, id, state);
    state.created.delete(key);
  }
  for (const q of questions) {
    const id = state.created.get(q.key) ?? q.id;
    if (!id) {
      await addDraft(quizId, q, state);
      continue;
    }
    if (unchanged(q, state.held.get(id))) continue;
    try {
      await api.quiz.updateQuestion(quizId, id, body(q));
      state.held.set(id, fieldsOf(q));
    } catch (err) {
      if (statusOf(err) !== 404) throw err;
      // deleted elsewhere while still in the draft: add it again (what the draft dropped was already deleted above)
      await addDraft(quizId, q, state);
    }
  }
}

/**
 * Create, then add every question, then activate. The backend has no transaction for this, so a failure part-way leaves a quiz behind:
 * the retry resumes on that quiz instead of creating a second one, and reconciles it with the draft as it is now.
 */
export function usePublishQuiz(clubId: string) {
  const queryClient = useQueryClient();
  const ref = useRef<{ quizId: string | null; active: boolean; sync: SyncState } | null>(null);
  const progress = (ref.current ??= { quizId: null, active: false, sync: newSync() });
  return useMutation({
    mutationFn: async ({ title, description, questions }: { title: string; description: string; questions: readonly DraftQuestion[] }) => {
      if (progress.quizId === null) progress.quizId = (await api.quiz.create(clubId, { title, description: description || null })).id;
      else await api.quiz.update(progress.quizId, { title, description: description || null });
      const quizId = progress.quizId;
      await syncQuestions(quizId, questions, [], progress.sync);
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
export function useSaveQuiz(quizId: string, clubId: string, loaded: readonly DraftQuestion[]) {
  const queryClient = useQueryClient();
  const [sync] = useState(() => {
    const state = newSync();
    for (const q of loaded) if (q.id) state.held.set(q.id, fieldsOf(q));
    return state;
  });
  return useMutation({
    mutationFn: async ({ title, description, questions, removedIds }: { title: string; description: string; questions: readonly DraftQuestion[]; removedIds: readonly string[] }) => {
      await api.quiz.update(quizId, { title, description });
      await syncQuestions(quizId, questions, removedIds, sync);
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
