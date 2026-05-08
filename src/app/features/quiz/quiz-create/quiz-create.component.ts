import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  signal,
} from '@angular/core';
import {
  AbstractControl,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { QuizService } from '../../../core/services/quiz.service';
import { QuizQuestion } from '../../../core/models/quiz.model';
import { HlmFieldImports } from '../../../shared/spartan/field/src';
import { HlmInput } from '../../../shared/spartan/input/src';
import { HlmButton } from '../../../shared/spartan/button/src';
import { HlmCardImports } from '../../../shared/spartan/card/src';
import {
  OPTION_INDICES,
  buildMetaForm,
  buildQuestionForm,
  isInvalidTouched,
  optionLabel,
} from '../quiz-form.utils';

type LocalQuestion = Omit<QuizQuestion, 'id' | 'quizId'>;

@Component({
  selector: 'app-quiz-create',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, TranslateModule, ...HlmFieldImports, HlmInput, HlmButton, ...HlmCardImports],
  templateUrl: './quiz-create.component.html',
})
export class QuizCreateComponent {
  private readonly quizService = inject(QuizService);
  private readonly router = inject(Router);

  protected readonly currentStep = signal<1 | 2>(1);
  protected readonly localQuestions = signal<LocalQuestion[]>([]);
  protected readonly isSaving = signal(false);
  protected readonly errorMessage = signal('');

  readonly id = input<string>('');

  readonly optionIndices = OPTION_INDICES;

  protected readonly metaForm = buildMetaForm();
  protected readonly questionForm = buildQuestionForm();

  protected readonly isInvalidTouched = isInvalidTouched;
  protected readonly optionLabel = optionLabel;

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

  protected saveQuiz(): void {
    const questions = this.localQuestions();
    if (questions.length === 0) return;

    this.isSaving.set(true);
    this.errorMessage.set('');

    const { title, description } = this.metaForm.getRawValue();
    const clubId = this.id();

    this.quizService
      .createQuiz({ clubId, title: title.trim(), description: description.trim() })
      .then(async quiz => {
        for (const q of questions) {
          await this.quizService.addQuestion(quiz.id, q);
        }
        this.isSaving.set(false);
        this.router.navigate(['/clubs', clubId, 'quizzes']);
      })
      .catch(err => {
        this.isSaving.set(false);
        this.errorMessage.set((err as Error).message);
      });
  }
}
