import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
  resource,
  signal,
} from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { QuizService } from '../../../core/services/quiz.service';
import { QuizQuestion } from '../../../core/models/quiz.model';
import { HlmFieldImports } from '../../../shared/spartan/field/src';
import { HlmInput } from '../../../shared/spartan/input/src';
import { HlmButton } from '../../../shared/spartan/button/src';
import { HlmCardImports } from '../../../shared/spartan/card/src';

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

type EditableQuestion = {
  id?: string;
  question: string;
  options: string[];
  correctIndex: number;
};

@Component({
  selector: 'app-quiz-edit',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, ...HlmFieldImports, HlmInput, HlmButton, ...HlmCardImports],
  templateUrl: './quiz-edit.component.html',
})
export class QuizEditComponent {
  private readonly quizService = inject(QuizService);
  private readonly router = inject(Router);

  readonly id = input<string>('');
  readonly quizId = input<string>('');

  private readonly _quizResource = resource({
    params: () => this.quizId(),
    loader: ({ params: qId }) =>
      qId ? this.quizService.getQuiz(qId) : Promise.resolve(null),
  });

  private readonly _questionsResource = resource({
    params: () => this.quizId(),
    loader: ({ params: qId }) =>
      qId ? this.quizService.getQuestions(qId) : Promise.resolve([]),
  });

  readonly quiz = computed(() => this._quizResource.value() ?? null);
  readonly isLoading = computed(
    () => this._quizResource.isLoading() || this._questionsResource.isLoading(),
  );
  readonly isDraft = computed(() => (this.quiz()?.status ?? 'draft') === 'draft');

  readonly localQuestions = linkedSignal<EditableQuestion[]>(
    () =>
      (this._questionsResource.value() ?? []).map(q => ({
        id: q.id,
        question: q.question,
        options: [...q.options],
        correctIndex: q.correctIndex,
      })),
  );

  private readonly _deletedIds = signal<string[]>([]);

  readonly currentStep = signal<1 | 2>(1);
  readonly isSaving = signal(false);
  readonly errorMessage = signal('');
  readonly canSave = computed(
    () => this.localQuestions().length > 0 && !this.isSaving() && this.isDraft(),
  );

  readonly optionIndices: readonly number[] = [0, 1, 2, 3];

  readonly metaForm = new FormGroup<MetaForm>({
    title: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3), Validators.maxLength(100)],
    }),
    description: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(500)],
    }),
  });

  readonly questionForm = new FormGroup<QuestionForm>({
    question: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(5), Validators.maxLength(500)],
    }),
    option0: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(200)],
    }),
    option1: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(200)],
    }),
    option2: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(200)],
    }),
    option3: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(200)],
    }),
    correctIndex: new FormControl<number>(0, { nonNullable: true }),
  });

  private readonly _syncEffect = effect(() => {
    const quiz = this._quizResource.value();
    if (quiz) {
      this.metaForm.patchValue({
        title: quiz.title,
        description: quiz.description ?? '',
      });
      if (quiz.status !== 'draft') {
        this.metaForm.disable();
      }
    }
  });

  protected isInvalidTouched(ctrl: AbstractControl): boolean {
    return ctrl.invalid && ctrl.touched;
  }

  protected optionLabel(index: number): string {
    return String.fromCodePoint(65 + index);
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

    this.localQuestions.update(prev => [
      ...prev,
      {
        question: question.trim(),
        options: [option0.trim(), option1.trim(), option2.trim(), option3.trim()],
        correctIndex,
      },
    ]);
    this.questionForm.reset({ correctIndex: 0 });
  }

  protected removeQuestion(index: number): void {
    const q = this.localQuestions()[index];
    if (q.id) {
      this._deletedIds.update(ids => [...ids, q.id!]);
    }
    this.localQuestions.update(prev => prev.filter((_, i) => i !== index));
  }

  protected saveChanges(): void {
    if (!this.canSave()) return;
    this.isSaving.set(true);
    this.errorMessage.set('');

    const qId = this.quizId();
    const { title, description } = this.metaForm.getRawValue();

    (async () => {
      await this.quizService.updateQuiz(qId, {
        title: title.trim(),
        description: description.trim(),
      });
      for (const id of this._deletedIds()) {
        await this.quizService.deleteQuestion(qId, id);
      }
      for (const q of this.localQuestions()) {
        if (q.id) {
          await this.quizService.updateQuestion(qId, q.id, {
            question: q.question,
            options: q.options,
            correctIndex: q.correctIndex,
          });
        } else {
          await this.quizService.addQuestion(qId, {
            question: q.question,
            options: q.options,
            correctIndex: q.correctIndex,
          });
        }
      }
      this.isSaving.set(false);
      this.router.navigate(['/clubs', this.id(), 'quizzes']);
    })().catch(err => {
      this.isSaving.set(false);
      this.errorMessage.set((err as Error).message);
    });
  }
}
