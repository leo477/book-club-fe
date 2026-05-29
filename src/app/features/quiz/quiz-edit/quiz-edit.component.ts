import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  linkedSignal,
  signal,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HlmFieldImports } from '../../../shared/spartan/field/src';
import { HlmInput } from '../../../shared/spartan/input/src';
import { HlmButton } from '../../../shared/spartan/button/src';
import { HlmCardImports } from '../../../shared/spartan/card/src';
import { QuizDetailBaseComponent } from '../quiz-detail-base.component';
import { OPTION_INDICES, buildMetaForm, buildQuestionForm } from '../quiz-form.utils';

interface EditableQuestion {
  id?: string;
  question: string;
  options: string[];
  correctIndex: number;
}

@Component({
  selector: 'app-quiz-edit',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, ...HlmFieldImports, HlmInput, HlmButton, ...HlmCardImports],
  templateUrl: './quiz-edit.component.html',
})
export class QuizEditComponent extends QuizDetailBaseComponent {
  private readonly router = inject(Router);

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

  readonly optionIndices = OPTION_INDICES;
  readonly metaForm = buildMetaForm();
  readonly questionForm = buildQuestionForm();

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
    const qId = q.id;
    if (qId) {
      this._deletedIds.update(ids => [...ids, qId]);
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
