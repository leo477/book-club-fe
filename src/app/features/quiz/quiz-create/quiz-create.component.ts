import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
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
import { TranslateModule } from '@ngx-translate/core';
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
  imports: [ReactiveFormsModule, RouterLink, TranslateModule],
  templateUrl: './quiz-create.component.html',
})
export class QuizCreateComponent {
  private readonly quizService = inject(QuizService);
  private readonly router = inject(Router);

  protected readonly currentStep = signal<1 | 2>(1);
  protected readonly localQuestions = signal<LocalQuestion[]>([]);
  protected readonly isPublishing = signal(false);
  protected readonly errorMessage = signal('');

  readonly id = input<string>('');

  readonly optionIndices: readonly number[] = [0, 1, 2, 3];

  protected readonly metaForm = new FormGroup<MetaForm>({
    title: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3), Validators.maxLength(100)],
    }),
    description: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(500)],
    }),
  });

  protected readonly questionForm = new FormGroup<QuestionForm>({
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

  protected async publishQuiz(): Promise<void> {
    const questions = this.localQuestions();
    if (questions.length === 0) return;

    this.isPublishing.set(true);
    this.errorMessage.set('');

    const { title, description } = this.metaForm.getRawValue();
    const clubId = this.id();

    try {
      const quiz = await this.quizService.createQuiz({ clubId, title: title.trim(), description: description.trim() });
      for (const q of questions) {
        await this.quizService.addQuestion(quiz.id, q);
      }
      await this.quizService.toggleActive(quiz.id, true);
      this.isPublishing.set(false);
      await this.router.navigate(['/clubs', clubId, 'quizzes']);
    } catch (err) {
      this.isPublishing.set(false);
      this.errorMessage.set((err as Error).message);
    }
  }
}
