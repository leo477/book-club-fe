import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { HlmButton } from '../../../shared/spartan/button/src';
import { HlmCardImports } from '../../../shared/spartan/card/src';
import { QuizDetailBaseComponent } from '../quiz-detail-base.component';

@Component({
  selector: 'app-quiz-preview',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslateModule, ...HlmCardImports, HlmButton],
  templateUrl: './quiz-preview.component.html',
})
export class QuizPreviewComponent extends QuizDetailBaseComponent {
  private readonly router = inject(Router);

  readonly currentIndex = signal(0);
  readonly currentQuestion = computed(() => this.questions()[this.currentIndex()] ?? null);
  readonly isFirstQuestion = computed(() => this.currentIndex() === 0);
  readonly isLastQuestion = computed(
    () => this.currentIndex() === this.questions().length - 1,
  );
  readonly isActivating = signal(false);
  readonly errorMessage = signal('');

  protected readonly optionIndices: readonly number[] = [0, 1, 2, 3];

  protected optionLabel(index: number): string {
    return String.fromCodePoint(65 + index);
  }

  protected prev(): void {
    if (!this.isFirstQuestion()) this.currentIndex.update(i => i - 1);
  }

  protected next(): void {
    if (!this.isLastQuestion()) this.currentIndex.update(i => i + 1);
  }

  protected activateQuiz(): void {
    this.isActivating.set(true);
    this.quizService
      .toggleActive(this.quizId(), true)
      .then(() => {
        this.isActivating.set(false);
        this.router.navigate(['/clubs', this.id(), 'quizzes']);
      })
      .catch(err => {
        this.isActivating.set(false);
        this.errorMessage.set((err as Error).message);
      });
  }
}
