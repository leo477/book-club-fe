import { Injectable, inject, signal } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Quiz, QuizAttempt, QuizQuestion } from '../models/quiz.model';
import { MOCK_QUIZZES, MOCK_QUESTIONS } from '../mocks/mock-data';

let nextQuizId = MOCK_QUIZZES.length + 1;
let nextQuestionId = MOCK_QUESTIONS.length + 1;
let nextAttemptId = 1;

/** In-memory stores (mutable copies so new items can be pushed) */
const inMemoryQuizzes: Quiz[] = [...MOCK_QUIZZES];
const inMemoryQuestions: QuizQuestion[] = [...MOCK_QUESTIONS];


@Injectable({ providedIn: 'root' })
export class QuizService {
  private readonly auth = inject(AuthService);

  private readonly _quizzes = signal<Quiz[]>([]);
  private readonly _activeQuiz = signal<Quiz | null>(null);
  private readonly _questions = signal<QuizQuestion[]>([]);
  private readonly _isLoading = signal(false);

  readonly quizzes = this._quizzes.asReadonly();
  readonly activeQuiz = this._activeQuiz.asReadonly();
  readonly questions = this._questions.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();

  async loadQuizzes(clubId: string): Promise<void> {
    this._isLoading.set(true);
    await Promise.resolve();
    this._quizzes.set(inMemoryQuizzes.filter(q => q.clubId === clubId));
    this._isLoading.set(false);
  }

  async createQuiz(data: {
    clubId: string;
    title: string;
    description: string;
  }): Promise<Quiz> {
    const user = this.auth.currentUser();
    if (!user) throw new Error('Not authenticated');

    const quiz: Quiz = {
      id: `quiz-${++nextQuizId}`,
      clubId: data.clubId,
      createdBy: user.id,
      title: data.title,
      description: data.description || null,
      isActive: false,
    };

    inMemoryQuizzes.push(quiz);
    this._quizzes.update(prev => [quiz, ...prev]);
    return quiz;
  }

  async addQuestion(
    quizId: string,
    q: Omit<QuizQuestion, 'id' | 'quizId'>,
  ): Promise<void> {
    const question: QuizQuestion = {
      id: `q-${++nextQuestionId}`,
      quizId,
      ...q,
    };
    inMemoryQuestions.push(question);
  }

  async loadQuestions(quizId: string): Promise<void> {
    await Promise.resolve();
    this._questions.set(inMemoryQuestions.filter(q => q.quizId === quizId));
  }

  async submitAttempt(quizId: string, answers: number[]): Promise<QuizAttempt> {
    const user = this.auth.currentUser();
    if (!user) throw new Error('Not authenticated');

    await this.loadQuestions(quizId);
    const questions = this._questions();

    const score = answers.reduce((acc, answer, i) => {
      return questions[i]?.correctIndex === answer ? acc + 1 : acc;
    }, 0);

    const attempt: QuizAttempt = {
      id: `attempt-${++nextAttemptId}`,
      quizId,
      userId: user.id,
      score,
      total: questions.length,
      answers,
    };

    return attempt;
  }

  async toggleActive(quizId: string, isActive: boolean): Promise<void> {
    const quiz = inMemoryQuizzes.find(q => q.id === quizId);
    if (quiz) quiz.isActive = isActive;

    this._quizzes.update(prev =>
      prev.map(q => (q.id === quizId ? { ...q, isActive } : q)),
    );
  }
}
