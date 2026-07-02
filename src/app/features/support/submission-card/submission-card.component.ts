import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Submission, SubmissionStatus } from '../../../core/models/support.model';
import { SupportService } from '../../../core/services/support.service';
import { HlmCardImports } from '../../../shared/spartan/card/src';
import { HlmBadge, BadgeVariants } from '../../../shared/spartan/badge/src';

const STATUS_VARIANT: Record<SubmissionStatus, BadgeVariants['variant']> = {
  open: 'outline',
  pending: 'warning',
  in_progress: 'secondary',
  approved: 'success',
  done: 'success',
  rejected: 'destructive',
};

@Component({
  selector: 'app-submission-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule, ...HlmCardImports, HlmBadge],
  templateUrl: './submission-card.component.html',
})
export class SubmissionCardComponent {
  private readonly support = inject(SupportService);

  readonly submission = input.required<Submission>();
  readonly isAdmin = input<boolean>(false);

  readonly approve = output<Submission>();
  readonly reject = output<Submission>();
  readonly advance = output<Submission>();

  readonly statusVariant = computed<BadgeVariants['variant']>(
    () => STATUS_VARIANT[this.submission().status],
  );

  readonly canLike = computed<boolean>(() => this.submission().type !== 'suggestion');

  readonly reactionEmoji = computed<string>(() =>
    this.submission().type === 'complaint' ? '😠' : '👍',
  );

  readonly reactionClasses = computed<string>(() =>
    this.submission().likedByMe
      ? 'border-transparent bg-[var(--color-accent-500)]/15 text-[var(--color-accent-700)] dark:text-[var(--color-accent-300)]'
      : 'border-[var(--color-ink-muted)]/30 text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-raised)]',
  );

  async onToggleLike(): Promise<void> {
    try {
      await this.support.toggleLike(this.submission().id);
    } catch {
      // interceptor surfaces the error toast; local state already rolled back
    }
  }

  /** Next status an admin can advance an approved suggestion to in the pipeline. */
  readonly nextStatus = computed<'in_progress' | 'done' | null>(() => {
    switch (this.submission().status) {
      case 'approved':
        return 'in_progress';
      case 'in_progress':
        return 'done';
      default:
        return null;
    }
  });
}
