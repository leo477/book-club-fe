import { Injectable, inject, signal } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { SupabaseService } from '../supabase/supabase.service';
import { Quiz, QuizAttempt, QuizQuestion } from '../models/quiz.model';

@Injectable({ providedIn: 'root' })
export class QuizService {
  private readonly supabase = inject(SupabaseService);
  private readonly auth = inject(AuthService);

  private readonly _quizzes = signal<Quiz[]>([]);
  private readonly _activeQuiz = signal<Quiz | null>(null);
  private readonly _questions = signal<QuizQuestion[]>([]);
  private readonly _isLoading = signal(false);

  // Public readonly projections — components cannot mutate service state
  readonly quizzes = this._quizzes.asReadonly();
  readonly activeQuiz = this._activeQuiz.asReadonly();
  readonly questions = this._questions.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();

  async loadQuizzes(clubId: string): Promise<void> {
    this._isLoading.set(true);
    const { data, error } = await this.supabase.client
      .from('quizzes')
      .select('*')
      .eq('club_id', clubId)
      .order('created_at', { ascending: false });

    this._isLoading.set(false);
    if (error) throw new Error(error.message);

    this._quizzes.set(
      (data ?? []).map(row => ({
        id: row.id,
        clubId: row.club_id,
        createdBy: row.created_by,
        title: row.title,
        description: row.description,
        isActive: row.is_active,
      })),
    );
  }

  async createQuiz(data: {
    clubId: string;
    title: string;
    description: string;
  }): Promise<Quiz> {
    const user = this.auth.currentUser();
    if (!user) throw new Error('Not authenticated');

    const { data: row, error } = await this.supabase.client
      .from('quizzes')
      .insert({
        club_id: data.clubId,
        created_by: user.id,
        title: data.title,
        description: data.description || null,
        is_active: false,
      })
      .select()
      .single();

    if (error || !row) throw new Error(error?.message ?? 'Failed to create quiz');

    const quiz: Quiz = {
      id: row.id,
      clubId: row.club_id,
      createdBy: row.created_by,
      title: row.title,
      description: row.description,
      isActive: row.is_active,
    };

    this._quizzes.update(prev => [quiz, ...prev]);
    return quiz;
  }

  async addQuestion(
    quizId: string,
    q: Omit<QuizQuestion, 'id' | 'quizId'>,
  ): Promise<void> {
    const { count } = await this.supabase.client
      .from('quiz_questions')
      .select('*', { count: 'exact', head: true })
      .eq('quiz_id', quizId);

    const sortOrder = count ?? 0;

    const { error } = await this.supabase.client.from('quiz_questions').insert({
      quiz_id: quizId,
      question: q.question,
      options: q.options,
      correct_index: q.correctIndex,
      sort_order: sortOrder,
    });

    if (error) throw new Error(error.message);
  }

  async loadQuestions(quizId: string): Promise<void> {
    const { data, error } = await this.supabase.client
      .from('quiz_questions')
      .select('*')
      .eq('quiz_id', quizId)
      .order('sort_order', { ascending: true });

    if (error) throw new Error(error.message);

    this._questions.set(
      (data ?? []).map(row => ({
        id: row.id,
        quizId: row.quiz_id,
        question: row.question,
        options: row.options,
        correctIndex: row.correct_index,
      })),
    );
  }

  async submitAttempt(quizId: string, answers: number[]): Promise<QuizAttempt> {
    const user = this.auth.currentUser();
    if (!user) throw new Error('Not authenticated');

    await this.loadQuestions(quizId);
    const questions = this._questions();

    const score = answers.reduce((acc, answer, i) => {
      return questions[i] && answer === questions[i].correctIndex ? acc + 1 : acc;
    }, 0);
    const total = questions.length;

    const { data: row, error } = await this.supabase.client
      .from('quiz_attempts')
      .insert({ quiz_id: quizId, user_id: user.id, score, total, answers })
      .select()
      .single();

    if (error || !row) throw new Error(error?.message ?? 'Failed to submit attempt');

    return {
      id: row.id,
      quizId: row.quiz_id,
      userId: row.user_id,
      score: row.score,
      total: row.total,
      answers: row.answers,
    };
  }

  async toggleActive(quizId: string, isActive: boolean): Promise<void> {
    const { error } = await this.supabase.client
      .from('quizzes')
      .update({ is_active: isActive })
      .eq('id', quizId);

    if (error) throw new Error(error.message);

    this._quizzes.update(prev =>
      prev.map(q => (q.id === quizId ? { ...q, isActive } : q)),
    );
  }
}
