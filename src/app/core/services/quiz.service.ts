import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal, computed } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { extractApiError } from '../api/api-error.util';
import { Quiz, QuizAttempt, QuizQuestion, QuizStatus, QuizSession, QuizLeaderboardEntry } from '../models/quiz.model';
import { ClubEvent } from '../models/event.model';

// ── API shapes ───────────────────────────────────────────────────────────────

interface ApiQuiz {
  id: string;
  clubId: string;
  createdBy: string;
  title: string;
  description: string | null;
  isActive: boolean;
  status: string;
}

interface ApiQuizQuestion {
  id: string;
  quizId: string;
  question: string;
  options: string[];
  correctIndex: number;
}

interface ApiAttemptResponse {
  id: string;
  quizId: string;
  userId: string;
  score: number;
  total: number;
  answers: number[];
}

interface ApiQuizSession {
  id: string;
  quizId: string;
  eventId: string;
  startedBy: string;
  startedAt: string;
  closedAt: string | null;
  participantCount: number;
}

interface ApiLeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  score: number;
  totalQuestions: number;
  hasAttempted: boolean;
}

// ── Mappers ──────────────────────────────────────────────────────────────────

function mapQuiz(raw: ApiQuiz): Quiz {
  return {
    id: raw.id,
    clubId: raw.clubId,
    createdBy: raw.createdBy,
    title: raw.title,
    description: raw.description,
    status: (raw.status as QuizStatus) ?? 'draft',
    isActive: raw.isActive,
  };
}

function mapQuestion(raw: ApiQuizQuestion): QuizQuestion {
  return {
    id: raw.id,
    quizId: raw.quizId,
    question: raw.question,
    options: raw.options,
    correctIndex: raw.correctIndex,
  };
}

function mapAttempt(raw: ApiAttemptResponse): QuizAttempt {
  return {
    id: raw.id,
    quizId: raw.quizId,
    userId: raw.userId,
    score: raw.score,
    total: raw.total,
    answers: raw.answers,
  };
}

function mapSession(raw: ApiQuizSession): QuizSession {
  return { ...raw };
}

function mapLeaderboardEntry(raw: ApiLeaderboardEntry): QuizLeaderboardEntry {
  return { ...raw };
}

// ── Service ──────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class QuizService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  private readonly _quizzes = signal<Quiz[]>([]);
  private readonly _questions = signal<QuizQuestion[]>([]);
  private readonly _isLoading = signal(false);
  private readonly _session = signal<QuizSession | null>(null);
  private readonly _leaderboard = signal<QuizLeaderboardEntry[]>([]);

  readonly quizzes = this._quizzes.asReadonly();
  readonly questions = this._questions.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly session = this._session.asReadonly();
  readonly leaderboard = this._leaderboard.asReadonly();

  readonly activeQuiz = computed(() => this._quizzes().find(q => q.isActive) ?? null);

  async loadQuizzes(clubId: string): Promise<void> {
    this._isLoading.set(true);
    try {
      const raw = await firstValueFrom(
        this.http.get<ApiQuiz[]>(`${this.api}/clubs/${clubId}/quizzes`),
      );
      this._quizzes.set(raw.map(mapQuiz));
    } catch (err) {
      throw new Error(extractApiError(err));
    } finally {
      this._isLoading.set(false);
    }
  }

  async createQuiz(data: {
    clubId: string;
    title: string;
    description: string;
  }): Promise<Quiz> {
    try {
      const raw = await firstValueFrom(
        this.http.post<ApiQuiz>(`${this.api}/clubs/${data.clubId}/quizzes`, {
          title: data.title,
          description: data.description || null,
        }),
      );
      const quiz = mapQuiz(raw);
      this._quizzes.update(prev => [quiz, ...prev]);
      return quiz;
    } catch (err) {
      throw new Error(extractApiError(err));
    }
  }

  async addQuestion(
    quizId: string,
    q: Omit<QuizQuestion, 'id' | 'quizId'>,
  ): Promise<void> {
    try {
      const raw = await firstValueFrom(
        this.http.post<ApiQuizQuestion>(`${this.api}/quizzes/${quizId}/questions`, {
          question: q.question,
          options: q.options,
          correctIndex: q.correctIndex,
        }),
      );
      this._questions.update(prev => [...prev, mapQuestion(raw)]);
    } catch (err) {
      throw new Error(extractApiError(err));
    }
  }

  async loadQuestions(quizId: string): Promise<void> {
    this._isLoading.set(true);
    try {
      const raw = await firstValueFrom(
        this.http.get<ApiQuizQuestion[]>(`${this.api}/quizzes/${quizId}/questions`),
      );
      this._questions.set(raw.map(mapQuestion));
    } catch (err) {
      throw new Error(extractApiError(err));
    } finally {
      this._isLoading.set(false);
    }
  }

  async submitAttempt(quizId: string, answers: number[]): Promise<QuizAttempt> {
    try {
      const raw = await firstValueFrom(
        this.http.post<ApiAttemptResponse>(`${this.api}/quizzes/${quizId}/attempts`, { answers }),
      );
      return mapAttempt(raw);
    } catch (err) {
      throw new Error(extractApiError(err));
    }
  }

  async toggleActive(quizId: string, isActive: boolean): Promise<void> {
    try {
      await firstValueFrom(
        this.http.patch(`${this.api}/quizzes/${quizId}/active`, { isActive }),
      );
      this._quizzes.update(prev =>
        prev.map(q => (q.id === quizId ? { ...q, isActive } : q)),
      );
    } catch (err) {
      throw new Error(extractApiError(err));
    }
  }

  async getQuiz(quizId: string): Promise<Quiz> {
    try {
      const raw = await firstValueFrom(
        this.http.get<ApiQuiz>(`${this.api}/quizzes/${quizId}`),
      );
      return mapQuiz(raw);
    } catch (err) {
      throw new Error(extractApiError(err));
    }
  }

  async getQuestions(quizId: string): Promise<QuizQuestion[]> {
    try {
      const raw = await firstValueFrom(
        this.http.get<ApiQuizQuestion[]>(`${this.api}/quizzes/${quizId}/questions`),
      );
      return raw.map(mapQuestion);
    } catch (err) {
      throw new Error(extractApiError(err));
    }
  }

  async updateQuiz(
    quizId: string,
    data: { title: string; description: string },
  ): Promise<Quiz> {
    try {
      const raw = await firstValueFrom(
        this.http.patch<ApiQuiz>(`${this.api}/quizzes/${quizId}`, data),
      );
      const quiz = mapQuiz(raw);
      this._quizzes.update(prev => prev.map(q => (q.id === quizId ? quiz : q)));
      return quiz;
    } catch (err) {
      throw new Error(extractApiError(err));
    }
  }

  async updateQuestion(
    quizId: string,
    questionId: string,
    q: Partial<Omit<QuizQuestion, 'id' | 'quizId'>>,
  ): Promise<void> {
    try {
      await firstValueFrom(
        this.http.patch(
          `${this.api}/quizzes/${quizId}/questions/${questionId}`,
          q,
        ),
      );
    } catch (err) {
      throw new Error(extractApiError(err));
    }
  }

  async deleteQuestion(quizId: string, questionId: string): Promise<void> {
    try {
      await firstValueFrom(
        this.http.delete(
          `${this.api}/quizzes/${quizId}/questions/${questionId}`,
        ),
      );
    } catch (err) {
      throw new Error(extractApiError(err));
    }
  }

  async reorderQuestions(quizId: string, orderedIds: string[]): Promise<void> {
    try {
      await firstValueFrom(
        this.http.put(`${this.api}/quizzes/${quizId}/questions/order`, {
          order: orderedIds,
        }),
      );
    } catch (err) {
      throw new Error(extractApiError(err));
    }
  }

  async startSession(quizId: string, eventId: string): Promise<QuizSession> {
    try {
      const raw = await firstValueFrom(
        this.http.post<ApiQuizSession>(
          `${this.api}/quizzes/${quizId}/sessions`,
          { eventId },
        ),
      );
      const session = mapSession(raw);
      this._session.set(session);
      return session;
    } catch (err) {
      throw new Error(extractApiError(err));
    }
  }

  async getActiveSession(quizId: string): Promise<QuizSession | null> {
    try {
      const raw = await firstValueFrom(
        this.http.get<ApiQuizSession>(
          `${this.api}/quizzes/${quizId}/sessions/active`,
        ),
      );
      return mapSession(raw);
    } catch {
      return null;
    }
  }

  async getLeaderboard(
    quizId: string,
    sessionId: string,
  ): Promise<QuizLeaderboardEntry[]> {
    try {
      const raw = await firstValueFrom(
        this.http.get<{ entries: ApiLeaderboardEntry[] }>(
          `${this.api}/quizzes/${quizId}/sessions/${sessionId}/leaderboard`,
        ),
      );
      return raw.entries.map(mapLeaderboardEntry);
    } catch (err) {
      throw new Error(extractApiError(err));
    }
  }

  async endSession(quizId: string, sessionId: string): Promise<void> {
    try {
      await firstValueFrom(
        this.http.patch(
          `${this.api}/quizzes/${quizId}/sessions/${sessionId}/close`,
          {},
        ),
      );
      this._session.set(null);
    } catch (err) {
      throw new Error(extractApiError(err));
    }
  }

  async getClubQuizzes(clubId: string): Promise<Quiz[]> {
    try {
      const raw = await firstValueFrom(
        this.http.get<ApiQuiz[]>(`${this.api}/clubs/${clubId}/quizzes`),
      );
      return raw.map(mapQuiz);
    } catch (err) {
      throw new Error(extractApiError(err));
    }
  }

  async loadClubEvents(clubId: string): Promise<ClubEvent[]> {
    try {
      return await firstValueFrom(
        this.http.get<ClubEvent[]>(`${this.api}/clubs/${clubId}/events`),
      );
    } catch (err) {
      throw new Error(extractApiError(err));
    }
  }
}
