import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { QuizService } from '../../../core/services/quiz.service';
import { QuizQuestion } from '../../../core/models/quiz.model';

interface MetaForm {
  title: FormControl<string>;
  description: FormControl<string>;
}

interface QuestionForm {
  question: FormControl<string>;
  option0: FormControl<string>;
  option1: FormControl<string>;
  option2: FormControl<string>;
  option3: FormControl<string>;
  correctIndex: FormControl<number>;
}

type LocalQuestion = Omit<QuizQuestion, 'id' | 'quizId'>;

@Component({
  selector: 'app-quiz-create',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 sm:p-8">
      <div class="max-w-2xl mx-auto space-y-6">

        <!-- ── Header ── -->
        <div class="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 class="font-display text-2xl font-bold text-gray-900 dark:text-white">
              📝 Create Quiz
            </h1>
            <p class="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
              Step {{ currentStep() }} of 2 —
              {{ currentStep() === 1 ? 'Quiz details' : 'Add questions' }}
            </p>
          </div>
          <a
            [routerLink]="['..']"
            class="text-gray-500 hover:text-gray-900 dark:hover:text-white text-sm
                   transition-colors"
          >
            ✕ Cancel
          </a>
        </div>

        <!-- ── Step indicator ── -->
        <div class="flex items-center gap-0">
          @for (step of [1, 2]; track step) {
            <div
              class="flex-1 h-1.5 rounded-full transition-all duration-300"
              [class.bg-primary-500]="currentStep() >= step"
              [class.bg-gray-200]="currentStep() < step"
              [class.dark:bg-gray-700]="currentStep() < step"
            ></div>
            @if (step < 2) {
              <div class="w-3"></div>
            }
          }
        </div>

        <!-- ──────────────────────────────────────────
             Step 1: Quiz metadata
        ─────────────────────────────────────────── -->
        @if (currentStep() === 1) {
          <form
            [formGroup]="metaForm"
            (ngSubmit)="nextStep()"
            novalidate
            class="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200
                   dark:border-gray-800 shadow-sm space-y-5"
          >
            <!-- Title -->
            <div class="space-y-1">
              <label
                for="quiz-title"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Quiz title <span class="text-red-500">*</span>
              </label>
              <input
                id="quiz-title"
                formControlName="title"
                placeholder="e.g. The Midnight Library — Chapter 1 Quiz"
                class="w-full rounded-lg border px-4 py-2.5 text-sm text-gray-900 dark:text-white
                       bg-white dark:bg-gray-800 placeholder-gray-400 focus:outline-none
                       focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                [class.border-red-400]="isInvalidTouched(metaForm.controls.title)"
                [class.border-gray-300]="!isInvalidTouched(metaForm.controls.title)"
                [class.dark:border-gray-600]="!isInvalidTouched(metaForm.controls.title)"
              />
              @if (isInvalidTouched(metaForm.controls.title)) {
                <p class="text-red-500 text-xs">Title is required.</p>
              }
            </div>

            <!-- Description -->
            <div class="space-y-1">
              <label
                for="quiz-desc"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Description
              </label>
              <textarea
                id="quiz-desc"
                formControlName="description"
                rows="3"
                placeholder="A brief description of the quiz…"
                class="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2.5
                       text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800
                       placeholder-gray-400 resize-none focus:outline-none focus:ring-2
                       focus:ring-primary-500 focus:border-transparent transition-colors"
              ></textarea>
            </div>

            <div class="flex justify-end">
              <button
                type="submit"
                [disabled]="metaForm.invalid"
                class="bg-primary-600 hover:bg-primary-500 disabled:opacity-40
                       disabled:cursor-not-allowed text-white rounded-xl px-6 py-2.5
                       font-medium transition-colors text-sm"
              >
                Continue →
              </button>
            </div>
          </form>
        }

        <!-- ──────────────────────────────────────────
             Step 2: Add questions
        ─────────────────────────────────────────── -->
        @if (currentStep() === 2) {
          <div class="space-y-6">

            <!-- Existing questions list -->
            @if (localQuestions().length > 0) {
              <div class="space-y-3">
                <h2 class="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase
                           tracking-widest">
                  Questions ({{ localQuestions().length }})
                </h2>
                @for (q of localQuestions(); track $index) {
                  <div
                    class="bg-white dark:bg-gray-900 rounded-xl px-5 py-4 border border-gray-200
                           dark:border-gray-800 shadow-sm flex items-start gap-3"
                  >
                    <span
                      class="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900/40
                             text-primary-700 dark:text-primary-300 text-xs font-bold flex
                             items-center justify-center flex-shrink-0"
                    >
                      {{ $index + 1 }}
                    </span>
                    <div class="min-w-0">
                      <p class="text-gray-900 dark:text-white text-sm font-medium">
                        {{ q.question }}
                      </p>
                      <p class="text-green-600 dark:text-green-400 text-xs mt-1">
                        ✓ {{ q.options[q.correctIndex] }}
                      </p>
                    </div>
                    <button
                      (click)="removeQuestion($index)"
                      class="text-gray-400 hover:text-red-500 transition-colors text-lg
                             flex-shrink-0 ml-auto leading-none"
                      aria-label="Remove question {{ $index + 1 }}"
                    >
                      ✕
                    </button>
                  </div>
                }
              </div>
            }

            <!-- Add question form -->
            <form
              [formGroup]="questionForm"
              (ngSubmit)="addQuestion()"
              novalidate
              class="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200
                     dark:border-gray-800 shadow-sm space-y-5"
            >
              <h2 class="font-semibold text-gray-900 dark:text-white">
                {{ localQuestions().length === 0 ? 'Add your first question' : 'Add another question' }}
              </h2>

              <!-- Question text -->
              <div class="space-y-1">
                <label
                  for="q-text"
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Question <span class="text-red-500">*</span>
                </label>
                <textarea
                  id="q-text"
                  formControlName="question"
                  rows="2"
                  placeholder="What is the main theme of chapter 3?"
                  class="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2.5
                         text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800
                         placeholder-gray-400 resize-none focus:outline-none focus:ring-2
                         focus:ring-primary-500 focus:border-transparent transition-colors"
                  [class.border-red-400]="isInvalidTouched(questionForm.controls.question)"
                ></textarea>
              </div>

              <!-- 4 option inputs -->
              <div class="space-y-1">
                <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Answer options <span class="text-red-500">*</span>
                </p>
                <div class="space-y-2">
                  @for (idx of optionIndices; track idx) {
                    <div class="flex items-center gap-3">
                      <!-- Correct-answer radio -->
                      <label class="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          formControlName="correctIndex"
                          [value]="idx"
                          class="w-4 h-4 text-accent-600 focus:ring-accent-500 border-gray-300
                                 dark:border-gray-600 cursor-pointer"
                        />
                        <span
                          class="ml-2 w-6 h-6 rounded-full flex items-center justify-center
                                 text-xs font-bold"
                          [class.bg-accent-500]="questionForm.controls.correctIndex.value === idx"
                          [class.text-white]="questionForm.controls.correctIndex.value === idx"
                          [class.bg-gray-100]="questionForm.controls.correctIndex.value !== idx"
                          [class.dark:bg-gray-700]="questionForm.controls.correctIndex.value !== idx"
                          [class.text-gray-600]="questionForm.controls.correctIndex.value !== idx"
                          [class.dark:text-gray-400]="questionForm.controls.correctIndex.value !== idx"
                        >
                          {{ optionLabel(idx) }}
                        </span>
                      </label>
                      <input
                        [formControlName]="'option' + idx"
                        [placeholder]="'Option ' + optionLabel(idx)"
                        class="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 px-4
                               py-2 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800
                               placeholder-gray-400 focus:outline-none focus:ring-2
                               focus:ring-primary-500 focus:border-transparent transition-colors"
                      />
                    </div>
                  }
                </div>
                <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Select the radio button next to the correct answer.
                </p>
              </div>

              <button
                type="submit"
                [disabled]="questionForm.invalid"
                class="w-full border-2 border-dashed border-primary-400 dark:border-primary-600
                       text-primary-600 dark:text-primary-400 hover:bg-primary-50
                       dark:hover:bg-primary-900/20 disabled:opacity-40 disabled:cursor-not-allowed
                       rounded-xl py-2.5 font-medium transition-colors text-sm"
              >
                + Add Question
              </button>
            </form>

            <!-- Error -->
            @if (errorMessage()) {
              <div
                class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800
                       rounded-xl p-4 text-red-700 dark:text-red-400 text-sm"
              >
                ⚠️ {{ errorMessage() }}
              </div>
            }

            <!-- Publish / back actions -->
            <div class="flex justify-between items-center pb-8">
              <button
                type="button"
                (click)="previousStep()"
                class="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white
                       transition-colors"
              >
                ← Back
              </button>

              <button
                type="button"
                (click)="publishQuiz()"
                [disabled]="localQuestions().length === 0 || isPublishing()"
                class="bg-accent-600 hover:bg-accent-500 disabled:opacity-40
                       disabled:cursor-not-allowed text-white rounded-xl px-8 py-2.5
                       font-bold transition-colors text-sm"
              >
                {{ isPublishing() ? '…Publishing' : '🚀 Publish Quiz' }}
                @if (localQuestions().length > 0) {
                  ({{ localQuestions().length }}
                  {{ localQuestions().length === 1 ? 'question' : 'questions' }})
                }
              </button>
            </div>
          </div>
        }

      </div>
    </div>
  `,
})
export class QuizCreateComponent implements OnInit {
  private readonly quizService = inject(QuizService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly currentStep = signal<1 | 2>(1);
  protected readonly localQuestions = signal<LocalQuestion[]>([]);
  protected readonly isPublishing = signal(false);
  protected readonly errorMessage = signal('');

  readonly optionIndices: readonly number[] = [0, 1, 2, 3];

  protected readonly metaForm = new FormGroup<MetaForm>({
    title: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    description: new FormControl('', { nonNullable: true }),
  });

  protected readonly questionForm = new FormGroup<QuestionForm>({
    question: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    option0: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    option1: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    option2: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    option3: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    correctIndex: new FormControl<number>(0, { nonNullable: true }),
  });

  private clubId = '';

  ngOnInit(): void {
    this.clubId = this.route.snapshot.params['id'] as string;
  }

  protected isInvalidTouched(ctrl: AbstractControl): boolean {
    return ctrl.invalid && ctrl.touched;
  }

  protected optionLabel(index: number): string {
    return String.fromCharCode(65 + index);
  }

  protected nextStep(): void {
    if (this.metaForm.invalid) {
      this.metaForm.markAllAsTouched();
      return;
    }
    this.currentStep.set(2);
  }

  protected previousStep(): void {
    this.currentStep.set(1);
    this.errorMessage.set('');
  }

  protected addQuestion(): void {
    if (this.questionForm.invalid) {
      this.questionForm.markAllAsTouched();
      return;
    }
    const { question, option0, option1, option2, option3, correctIndex } =
      this.questionForm.getRawValue();

    const newQuestion: LocalQuestion = {
      question: question.trim(),
      options: [option0.trim(), option1.trim(), option2.trim(), option3.trim()],
      correctIndex,
    };

    this.localQuestions.update(prev => [...prev, newQuestion]);
    this.questionForm.reset({ correctIndex: 0 });
  }

  protected removeQuestion(index: number): void {
    this.localQuestions.update(prev => prev.filter((_, i) => i !== index));
  }

  protected publishQuiz(): void {
    const questions = this.localQuestions();
    if (questions.length === 0) return;

    this.isPublishing.set(true);
    this.errorMessage.set('');

    const { title, description } = this.metaForm.getRawValue();

    this.quizService
      .createQuiz({ clubId: this.clubId, title: title.trim(), description: description.trim() })
      .then(async quiz => {
        // Add questions sequentially to preserve sort_order
        for (const q of questions) {
          await this.quizService.addQuestion(quiz.id, q);
        }
        // Activate the quiz
        await this.quizService.toggleActive(quiz.id, true);
        this.isPublishing.set(false);
        this.router.navigate(['/clubs', this.clubId, 'quizzes']);
      })
      .catch(err => {
        this.isPublishing.set(false);
        this.errorMessage.set((err as Error).message);
      });
  }
}
