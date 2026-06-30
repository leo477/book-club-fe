import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Submission, SubmissionStatus } from '../../../core/models/support.model';
import { HlmCardImports } from '../../../shared/spartan/card/src';
import { HlmBadge, BadgeVariants } from '../../../shared/spartan/badge/src';

const STATUS_VARIANT: Record<SubmissionStatus, BadgeVariants['variant']> = {
  pending: 'secondary',
  approved: 'default',
  done: 'default',
  rejected: 'destructive',
  in_progress: 'secondary',
  open: 'outline',
};

@Component({
  selector: 'app-submission-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule, ...HlmCardImports, HlmBadge],
  templateUrl: './submission-card.component.html',
})
export class SubmissionCardComponent {
  readonly submission = input.required<Submission>();
  readonly isAdmin = input<boolean>(false);

  readonly approve = output<Submission>();
  readonly reject = output<Submission>();
  readonly advance = output<Submission>();

  readonly statusVariant = computed<BadgeVariants['variant']>(
    () => STATUS_VARIANT[this.submission().status],
  );

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
