import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { QuizService } from '../../../core/services/quiz.service';

@Component({
  selector: 'app-quiz-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './quiz-list.component.html',
})
export class QuizListComponent implements OnInit {
  protected readonly quizService = inject(QuizService);
  protected readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly togglingId = signal<string | null>(null);
  protected readonly errorMessage = signal('');

  protected clubId = '';

  ngOnInit(): void {
    // With paramsInheritanceStrategy:'always', :id is inherited from the parent :id route
    this.clubId = this.route.snapshot.params['id'] as string;
    this.quizService.loadQuizzes(this.clubId).catch(err => {
      this.errorMessage.set((err as Error).message);
    });
  }

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
    this.router.navigate(['/clubs', this.clubId, 'quizzes', quizId]);
  }
}
