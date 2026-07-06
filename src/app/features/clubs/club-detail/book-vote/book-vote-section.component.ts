import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { TranslateService } from '@ngx-translate/core';
import { toast } from '@spartan-ng/brain/sonner';
import { BookVoteService } from '../../../../core/services/book-vote.service';
import { BookOption, BookVoteRound } from '../../../../core/models/book-vote.model';
import { BackendHttpError, RequestTimeoutError } from '../../../../core/interceptors/auth.interceptor';
import { HlmButton } from '../../../../shared/spartan/button/src';

@Component({
  selector: 'app-book-vote-section',
  host: { class: 'block' },
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, HlmButton],
  templateUrl: './book-vote-section.component.html',
})
export class BookVoteSectionComponent {
  readonly clubId  = input.required<string>();
  readonly isOwner = input(false);
  readonly isMember = input(false);

  private readonly voteService = inject(BookVoteService);
  private readonly translate = inject(TranslateService);

  protected readonly newTitle  = signal('');
  protected readonly newAuthor = signal('');
  protected readonly addError  = signal('');
  protected readonly isActionLoading = signal(false);

  private readonly roundResource = rxResource<BookVoteRound | null, string>({
    params: () => this.clubId(),
    stream: ({ params: clubId }) => this.voteService.getRound$(clubId),
  });

  protected readonly round = computed(() => this.roundResource.value() ?? null);
  protected readonly isLoading = this.roundResource.isLoading;

  protected readonly sortedOptions = computed(() =>
    [...(this.round()?.options ?? [])].sort((a, b) => b.votes - a.votes),
  );

  protected getPercent(option: BookOption): number {
    const total = this.round()?.totalVotes ?? 0;
    return total > 0 ? Math.round((option.votes / total) * 100) : 0;
  }

  protected async createRound(): Promise<void> {
    await this.runAction(() => this.voteService.createRound(this.clubId()));
  }

  protected async addOption(): Promise<void> {
    const title = this.newTitle().trim();
    if (!title) { this.addError.set('Введіть назву книги'); return; }
    const round = this.round();
    if (!round) return;
    this.addError.set('');
    await this.runAction(() => this.voteService.addOption(this.clubId(), round.id, title, this.newAuthor()));
    this.newTitle.set('');
    this.newAuthor.set('');
  }

  protected async removeOption(optionId: string): Promise<void> {
    await this.runAction(() => this.voteService.removeOption(this.clubId(), optionId));
  }

  protected async toggleVote(option: BookOption): Promise<void> {
    if (option.hasVoted) {
      await this.runAction(() => this.voteService.unvote(this.clubId(), option.id));
    } else {
      await this.runAction(() => this.voteService.vote(this.clubId(), option.id));
    }
  }

  protected async closeRound(): Promise<void> {
    const round = this.round();
    if (!round) return;
    await this.runAction(() => this.voteService.closeRound(this.clubId(), round.id));
  }

  protected async newRound(): Promise<void> {
    await this.createRound();
  }

  private async runAction(action: () => Promise<void>): Promise<void> {
    this.isActionLoading.set(true);
    try {
      await action();
      this.roundResource.reload();
    } catch (err) {
      toast.error(this.formatActionError(err, 'Failed to update the vote'));
    } finally {
      this.isActionLoading.set(false);
    }
  }

  private formatActionError(err: unknown, fallback: string): string {
    if (err instanceof RequestTimeoutError) {
      return this.translate.instant('ERRORS.timeout');
    }
    if (err instanceof BackendHttpError) {
      if (err.detail) return err.detail;
      return this.translate.instant(err.translationKey);
    }
    if (err instanceof Error && err.message) return err.message;
    return fallback;
  }
}
