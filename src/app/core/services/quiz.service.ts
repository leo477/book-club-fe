import { Injectable, inject, signal, computed } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Quiz, QuizAttempt, QuizQuestion } from '../models/quiz.model';
import { MOCK_QUIZZES, MOCK_QUESTIONS } from '../mocks';

let nextQuizId = MOCK_QUIZZES.length + 1;
let nextQuestionId = MOCK_QUESTIONS.length + 1;
let nextAttemptId = 1;

@Injectable({ providedIn: 'root' })
export class QuizService {
  private readonly auth = inject(AuthService);

  private readonly _allQuizzes = signal<Quiz[]>([...MOCK_QUIZZES]);
  private readonly _allQuestions = signal<QuizQuestion[]>([...MOCK_QUESTIONS]);
  private readonly _currentClubId = signal<string | null>(null);
  private readonly _currentQuizId = signal<string | null>(null);
  private readonly _activeQuiz = signal<Quiz | null>(null);
  private readonly _isLoading = signal(false);

  readonly quizzes = computed(() =>
    this._allQuizzes().filter(q => q.clubId === this._currentClubId()),
  );
  readonly activeQuiz = this._activeQuiz.asReadonly();
  readonly questions = computed(() =>
    this._allQuestions().filter(q => q.quizId === this._currentQuizId()),
  );
  readonly isLoading = this._isLoading.asReadonly();

  async loadQuizzes(clubId: string): Promise<void> {
    this._isLoading.set(true);
    await Promise.resolve();
    this._currentClubId.set(clubId);
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

    this._allQuizzes.update(prev => [quiz, ...prev]);
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
    this._allQuestions.update(prev => [...prev, question]);
  }

  async loadQuestions(quizId: string): Promise<void> {
    await Promise.resolve();
    this._currentQuizId.set(quizId);
  }

  async submitAttempt(quizId: string, answers: number[]): Promise<QuizAttempt> {
    const user = this.auth.currentUser();
    if (!user) throw new Error('Not authenticated');

    await this.loadQuestions(quizId);
    const questions = this.questions();

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
    this._allQuizzes.update(prev =>
      prev.map(q => (q.id === quizId ? { ...q, isActive } : q)),
    );
  }
}
