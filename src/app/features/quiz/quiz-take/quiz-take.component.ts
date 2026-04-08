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
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center p-4 sm:p-8">
      <div class="w-full max-w-2xl space-y-6">
        <!-- ── Back link ── -->
        <a
          [routerLink]="['/clubs', clubId, 'quizzes']"
          class="inline-flex items-center text-gray-500 hover:text-gray-900
                 dark:hover:text-white text-sm transition-colors"
        >
          ← Back to Quizzes
        </a>

        <!-- ── Loading ── -->
        @if (state() === 'loading') {
          <div class="flex flex-col items-center py-20 gap-4">
            <div
              class="w-12 h-12 rounded-full border-4 border-primary-500 border-t-transparent
                     animate-spin"
            ></div>
            <p class="text-gray-500 dark:text-gray-400 text-sm">Loading quiz…</p>
          </div>
        }

        <!-- ── Error ── -->
        @if (state() === 'error') {
          <div
            class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800
                   rounded-2xl p-8 text-center"
          >
            <p class="text-4xl mb-3">😞</p>
            <p class="text-red-700 dark:text-red-400 font-medium">{{ errorMessage() }}</p>
            <a
              [routerLink]="['/clubs', clubId, 'quizzes']"
              class="mt-4 inline-block text-primary-600 dark:text-primary-400
                     hover:underline text-sm"
            >
              Return to quiz list
            </a>
          </div>
        }

        <!-- ── Taking quiz ── -->
        @if (state() === 'taking' || state() === 'submitting') {
          <!-- Progress bar -->
          <div>
            <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5">
              <span>Question {{ currentIndex() + 1 }} of {{ quizService.questions().length }}</span>
              <span>{{ progressPercent() }}%</span>
            </div>
            <div class="h-2 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
              <div
                class="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full
                       transition-all duration-500"
                [style.width.%]="progressPercent()"
              ></div>
            </div>
          </div>

          <!-- Question card -->
          @if (currentQuestion(); as q) {
            <div
              class="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200
                     dark:border-gray-800 shadow-sm"
            >
              <p class="text-gray-900 dark:text-white font-semibold text-lg leading-snug mb-6">
                {{ q.question }}
              </p>

              <!-- Options -->
              <div class="space-y-3">
                @for (option of q.options; track $index) {
                  <button
                    (click)="selectOption($index)"
                    class="w-full text-left rounded-xl px-5 py-4 text-sm font-medium
                           transition-all duration-150 border-2 focus:outline-none"
                    [class.border-accent-500]="selectedOption() === $index"
                    [class.ring-2]="selectedOption() === $index"
                    [class.ring-accent-500]="selectedOption() === $index"
                    [class.bg-accent-50]="selectedOption() === $index"
                    [class.dark:bg-accent-900\/20]="selectedOption() === $index"
                    [class.text-accent-700]="selectedOption() === $index"
                    [class.dark:text-accent-300]="selectedOption() === $index"
                    [class.border-gray-200]="selectedOption() !== $index"
                    [class.dark:border-gray-700]="selectedOption() !== $index"
                    [class.bg-white]="selectedOption() !== $index"
                    [class.dark:bg-gray-800]="selectedOption() !== $index"
                    [class.text-gray-700]="selectedOption() !== $index"
                    [class.dark:text-gray-300]="selectedOption() !== $index"
                    [class.hover:border-primary-400]="selectedOption() !== $index"
                    [class.hover:bg-primary-50]="selectedOption() !== $index"
                    [class.dark:hover:bg-primary-900\/20]="selectedOption() !== $index"
                    [disabled]="state() === 'submitting'"
                  >
                    <span class="flex items-center gap-3">
                      <span
                        class="w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center
                               justify-center text-xs font-bold"
                        [class.border-accent-500]="selectedOption() === $index"
                        [class.bg-accent-500]="selectedOption() === $index"
                        [class.text-white]="selectedOption() === $index"
                        [class.border-gray-300]="selectedOption() !== $index"
                        [class.dark:border-gray-600]="selectedOption() !== $index"
                        [class.text-gray-500]="selectedOption() !== $index"
                      >
                        {{ optionLabel($index) }}
                      </span>
                      {{ option }}
                    </span>
                  </button>
                }
              </div>
            </div>

            <!-- Navigation -->
            <div class="flex justify-between items-center">
              <button
                (click)="previous()"
                [disabled]="currentIndex() === 0"
                class="px-5 py-2.5 rounded-xl text-sm font-medium border border-gray-300
                       dark:border-gray-700 text-gray-600 dark:text-gray-400
                       hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40
                       disabled:cursor-not-allowed transition-colors"
              >
                ← Previous
              </button>

              @if (isLastQuestion()) {
                <button
                  (click)="submit()"
                  [disabled]="selectedOption() === -1 || state() === 'submitting'"
                  class="px-8 py-2.5 rounded-xl text-sm font-bold bg-accent-600
                         hover:bg-accent-500 disabled:opacity-40 disabled:cursor-not-allowed
                         text-white transition-colors"
                >
                  {{ state() === 'submitting' ? '…Submitting' : 'Submit Quiz ✓' }}
                </button>
              } @else {
                <button
                  (click)="next()"
                  [disabled]="selectedOption() === -1"
                  class="px-8 py-2.5 rounded-xl text-sm font-bold bg-primary-600
                         hover:bg-primary-500 disabled:opacity-40 disabled:cursor-not-allowed
                         text-white transition-colors"
                >
                  Next →
                </button>
              }
            </div>
          }
        }

        <!-- ── Results ── -->
        @if (state() === 'results' && attempt()) {
          <div class="space-y-6">
            <!-- Score card -->
            <div
              class="bg-gradient-to-br from-primary-600 to-accent-600 rounded-2xl p-8
                     text-center text-white shadow-2xl"
            >
              <p class="text-6xl font-display font-bold">
                {{ attempt()!.score }}/{{ attempt()!.total }}
              </p>
              <p class="text-white/80 mt-2 text-lg">{{ scoreMessage() }}</p>
              <p class="text-white/60 text-sm mt-1">
                {{ scorePercent() }}% correct
              </p>
            </div>

            <!-- Question review -->
            <div class="space-y-4">
              <h2 class="text-gray-900 dark:text-white font-semibold text-lg">
                Review Answers
              </h2>
              @for (q of quizService.questions(); track q.id; let i = $index) {
                <div
                  class="bg-white dark:bg-gray-900 rounded-2xl p-5 border shadow-sm"
                  [class.border-green-200]="attempt()!.answers[i] === q.correctIndex"
                  [class.dark:border-green-800]="attempt()!.answers[i] === q.correctIndex"
                  [class.border-red-200]="attempt()!.answers[i] !== q.correctIndex"
                  [class.dark:border-red-900]="attempt()!.answers[i] !== q.correctIndex"
                >
                  <div class="flex items-start gap-2 mb-4">
                    <span class="text-xl leading-none mt-0.5">
                      {{ attempt()!.answers[i] === q.correctIndex ? '✅' : '❌' }}
                    </span>
                    <p class="text-gray-900 dark:text-white font-medium text-sm">
                      {{ q.question }}
                    </p>
                  </div>
                  <div class="space-y-2 ml-8">
                    @for (option of q.options; track $index) {
                      <div
                        class="rounded-lg px-3 py-2 text-sm flex items-center gap-2"
                        [class.bg-green-100]="$index === q.correctIndex"
                        [class.dark:bg-green-900\/30]="$index === q.correctIndex"
                        [class.text-green-800]="$index === q.correctIndex"
                        [class.dark:text-green-300]="$index === q.correctIndex"
                        [class.font-semibold]="$index === q.correctIndex"
                        [class.bg-red-100]="$index !== q.correctIndex && $index === attempt()!.answers[i]"
                        [class.dark:bg-red-900\/30]="$index !== q.correctIndex && $index === attempt()!.answers[i]"
                        [class.text-red-700]="$index !== q.correctIndex && $index === attempt()!.answers[i]"
                        [class.dark:text-red-400]="$index !== q.correctIndex && $index === attempt()!.answers[i]"
                        [class.text-gray-500]="$index !== q.correctIndex && $index !== attempt()!.answers[i]"
                        [class.dark:text-gray-500]="$index !== q.correctIndex && $index !== attempt()!.answers[i]"
                      >
                        <span class="font-bold">{{ optionLabel($index) }}.</span>
                        {{ option }}
                        @if ($index === q.correctIndex) {
                          <span class="ml-auto text-xs">Correct</span>
                        }
                        @if ($index !== q.correctIndex && $index === attempt()!.answers[i]) {
                          <span class="ml-auto text-xs">Your answer</span>
                        }
                      </div>
                    }
                  </div>
                </div>
              }
            </div>

            <div class="flex justify-center">
              <a
                [routerLink]="['/clubs', clubId, 'quizzes']"
                class="bg-primary-600 hover:bg-primary-500 text-white rounded-xl px-8
                       py-3 font-medium transition-colors text-sm"
              >
                Back to Quizzes
              </a>
            </div>
          </div>
        }
      </div>
    </div>
  `,
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
    return String.fromCharCode(65 + index);
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
