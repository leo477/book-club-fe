import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal, computed } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { extractApiError } from '../api/api-error.util';
import { Quiz, QuizAttempt, QuizQuestion } from '../models/quiz.model';

// ── API shapes (snake_case) ──────────────────────────────────────────────────

interface ApiQuiz {
  id: string;
  club_id: string;
  created_by: string;
  title: string;
  description: string | null;
  is_active: boolean;
}

interface ApiQuizQuestion {
  id: string;
  quiz_id: string;
  question: string;
  options: string[];
  correct_index: number;
}

interface ApiAttemptResponse {
  id: string;
  quiz_id: string;
  user_id: string;
  score: number;
  total: number;
  answers: number[];
}

// ── Mappers ──────────────────────────────────────────────────────────────────

function mapQuiz(raw: ApiQuiz): Quiz {
  return {
    id: raw.id,
    clubId: raw.club_id,
    createdBy: raw.created_by,
    title: raw.title,
    description: raw.description,
    isActive: raw.is_active,
  };
}

function mapQuestion(raw: ApiQuizQuestion): QuizQuestion {
  return {
    id: raw.id,
    quizId: raw.quiz_id,
    question: raw.question,
    options: raw.options,
    correctIndex: raw.correct_index,
  };
}

function mapAttempt(raw: ApiAttemptResponse): QuizAttempt {
  return {
    id: raw.id,
    quizId: raw.quiz_id,
    userId: raw.user_id,
    score: raw.score,
    total: raw.total,
    answers: raw.answers,
  };
}

// ── Service ──────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class QuizService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  private readonly _quizzes = signal<Quiz[]>([]);
  private readonly _questions = signal<QuizQuestion[]>([]);
  private readonly _isLoading = signal(false);

  readonly quizzes = this._quizzes.asReadonly();
  readonly questions = this._questions.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();

  // activeQuiz kept for backwards-compatibility; derived from loaded quizzes
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
          correct_index: q.correctIndex,
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
        this.http.patch(`${this.api}/quizzes/${quizId}/active`, { is_active: isActive }),
      );
      this._quizzes.update(prev =>
        prev.map(q => (q.id === quizId ? { ...q, isActive } : q)),
      );
    } catch (err) {
      throw new Error(extractApiError(err));
    }
  }
}
