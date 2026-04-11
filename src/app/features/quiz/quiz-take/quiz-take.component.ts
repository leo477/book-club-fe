import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { QuizService } from '../../../core/services/quiz.service';
import { QuizAttempt } from '../../../core/models/quiz.model';

type QuizState = 'loading' | 'taking' | 'submitting' | 'results' | 'error';

@Component({
  selector: 'app-quiz-take',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './quiz-take.component.html',
})
export class QuizTakeComponent implements OnInit {
  protected readonly quizService = inject(QuizService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly state = signal<QuizState>('loading');
  protected readonly errorMessage = signal('');
  protected readonly currentIndex = signal(0);
  protected readonly selectedAnswers = signal<number[]>([]);
  protected readonly selectedOption = computed(
    () => this.selectedAnswers()[this.currentIndex()] ?? -1,
  );
  protected readonly attempt = signal<QuizAttempt | null>(null);

  protected clubId = '';

  protected readonly currentQuestion = computed(
    () => this.quizService.questions()[this.currentIndex()] ?? null,
  );
  protected readonly isLastQuestion = computed(
    () => this.currentIndex() === this.quizService.questions().length - 1,
  );
  protected readonly progressPercent = computed(() => {
    const total = this.quizService.questions().length;
    return total === 0 ? 0 : Math.round(((this.currentIndex() + 1) / total) * 100);
  });
  protected readonly scorePercent = computed(() => {
    const a = this.attempt();
    if (!a || a.total === 0) return 0;
    return Math.round((a.score / a.total) * 100);
  });
  protected readonly scoreMessage = computed(() => {
    const pct = this.scorePercent();
    if (pct === 100) return '🎉 Perfect score!';
    if (pct >= 80) return '🌟 Great job!';
    if (pct >= 60) return '👍 Good effort!';
    if (pct >= 40) return '📖 Keep reading!';
    return '💪 Better luck next time!';
  });

  ngOnInit(): void {
    // Both :id (club) and :quizId are inherited via paramsInheritanceStrategy:'always'
    this.clubId = this.route.snapshot.params['id'] as string;
    const quizId = this.route.snapshot.params['quizId'] as string;

    if (!quizId) {
      this.errorMessage.set('Quiz not found.');
      this.state.set('error');
      return;
    }

    this.quizService
      .loadQuestions(quizId)
      .then(() => {
        const count = this.quizService.questions().length;
        if (count === 0) {
          this.errorMessage.set('This quiz has no questions yet.');
          this.state.set('error');
          return;
        }
        this.selectedAnswers.set(new Array<number>(count).fill(-1));
        this.state.set('taking');
      })
      .catch(err => {
        this.errorMessage.set((err as Error).message);
        this.state.set('error');
      });
  }

  protected optionLabel(index: number): string {
    return String.fromCodePoint(65 + index);
  }

  protected selectOption(index: number): void {
    const current = this.currentIndex();
    this.selectedAnswers.update(answers => {
      const copy = [...answers];
      copy[current] = index;
      return copy;
    });
  }

  protected next(): void {
    if (this.selectedOption() === -1) return;
    this.currentIndex.update(i => i + 1);
  }

  protected previous(): void {
    if (this.currentIndex() === 0) return;
    this.currentIndex.update(i => i - 1);
  }

  protected submit(): void {
    if (this.selectedOption() === -1) return;
    this.state.set('submitting');

    const quizId = this.route.snapshot.params['quizId'] as string;
    this.quizService
      .submitAttempt(quizId, this.selectedAnswers())
      .then(result => {
        this.attempt.set(result);
        this.state.set('results');
      })
      .catch(err => {
        this.errorMessage.set((err as Error).message);
        this.state.set('error');
      });
  }
}
