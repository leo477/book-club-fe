import { ChangeDetectionStrategy, Component, OnInit, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../core/auth/auth.service';
import { SupportService } from '../../../core/services/support.service';
import { SeoService } from '../../../core/services/seo.service';
import { Submission, SubmissionStatus } from '../../../core/models/support.model';
import { SubmissionCardComponent } from '../submission-card/submission-card.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { HlmSpinner } from '../../../shared/spartan/spinner/src';

type KanbanStatus = Extract<SubmissionStatus, 'pending' | 'approved' | 'in_progress' | 'done' | 'rejected'>;

@Component({
  selector: 'app-support-board',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslateModule, SubmissionCardComponent, EmptyStateComponent, HlmSpinner],
  templateUrl: './support-board.component.html',
})
export class SupportBoardComponent implements OnInit {
  protected readonly support = inject(SupportService);
  protected readonly auth = inject(AuthService);
  private readonly seo = inject(SeoService);

  readonly columns: KanbanStatus[] = ['pending', 'approved', 'in_progress', 'done', 'rejected'];

  readonly complaints = computed<Submission[]>(() =>
    this.support.submissions().filter(s => s.type === 'complaint'),
  );

  readonly comments = computed<Submission[]>(() =>
    this.support.submissions().filter(s => s.type === 'comment'),
  );

  readonly suggestions = computed<Submission[]>(() =>
    this.support.submissions().filter(s => s.type === 'suggestion'),
  );

  readonly suggestionsByStatus = computed<Record<KanbanStatus, Submission[]>>(() => {
    const groups: Record<KanbanStatus, Submission[]> = {
      pending: [], approved: [], in_progress: [], done: [], rejected: [],
    };
    for (const s of this.suggestions()) {
      if (s.status in groups) groups[s.status as KanbanStatus].push(s);
    }
    return groups;
  });

  constructor() {
    this.seo.setPageI18n('SUPPORT.title');
  }

  async ngOnInit(): Promise<void> {
    await this.support.loadSubmissions();
  }

  async onApprove(s: Submission): Promise<void> {
    await this.runStatus(s, 'approved');
  }

  async onReject(s: Submission): Promise<void> {
    await this.runStatus(s, 'rejected');
  }

  async onAdvance(s: Submission): Promise<void> {
    const next = s.status === 'approved' ? 'in_progress' : s.status === 'in_progress' ? 'done' : null;
    if (next) await this.runStatus(s, next);
  }

  private async runStatus(s: Submission, status: 'approved' | 'rejected' | 'in_progress' | 'done'): Promise<void> {
    try {
      await this.support.updateStatus(s.id, status);
    } catch {
      // interceptor surfaces the error toast
    }
  }
}
