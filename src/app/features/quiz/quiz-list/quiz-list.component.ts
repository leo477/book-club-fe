import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  resource,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { QuizService } from '../../../core/services/quiz.service';
import { HlmCardImports } from '../../../shared/spartan/card/src';
import { HlmButton } from '../../../shared/spartan/button/src';

@Component({
  selector: 'app-quiz-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ...HlmCardImports, HlmButton],
  templateUrl: './quiz-list.component.html',
})
export class QuizListComponent {
  protected readonly quizService = inject(QuizService);
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly togglingId = signal<string | null>(null);
  protected readonly errorMessage = signal('');

  readonly id = input<string>('');

  private readonly _quizzesResource = resource({
    params: () => this.id(),
    loader: ({ params: clubId }) =>
      clubId ? this.quizService.loadQuizzes(clubId) : Promise.resolve(undefined),
  });

  readonly isLoading = computed(() => this._quizzesResource.isLoading());

  protected toggleActive(quizId: string, isActive: boolean): void {
    this.togglingId.set(quizId);
    this.errorMessage.set('');
    this.quizService
      .toggleActive(quizId, isActive)
      .then(() => this.togglingId.set(null))
      .catch(err => {
        this.togglingId.set(null);
        this.errorMessage.set((err as Error).message);
      });
  }

  protected takeQuiz(quizId: string): void {
    this.router.navigate(['/clubs', this.id(), 'quizzes', quizId]);
  }
}
