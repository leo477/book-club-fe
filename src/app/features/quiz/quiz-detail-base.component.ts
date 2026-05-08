import {
  Directive,
  computed,
  inject,
  input,
  resource,
} from '@angular/core';
import { QuizService } from '../../core/services/quiz.service';
import { isInvalidTouched, optionLabel } from './quiz-form.utils';

@Directive()
export abstract class QuizDetailBaseComponent {
  protected readonly quizService = inject(QuizService);

  readonly id = input<string>('');
  readonly quizId = input<string>('');

  protected readonly _quizResource = resource({
    params: () => this.quizId(),
    loader: ({ params: qId }) =>
      qId ? this.quizService.getQuiz(qId) : Promise.resolve(null),
  });

  protected readonly _questionsResource = resource({
    params: () => this.quizId(),
    loader: ({ params: qId }) =>
      qId ? this.quizService.getQuestions(qId) : Promise.resolve([]),
  });

  readonly quiz = computed(() => this._quizResource.value() ?? null);
  readonly questions = computed(() => this._questionsResource.value() ?? []);
  readonly isLoading = computed(
    () => this._quizResource.isLoading() || this._questionsResource.isLoading(),
  );

  protected readonly isInvalidTouched = isInvalidTouched;
  protected readonly optionLabel = optionLabel;
}
