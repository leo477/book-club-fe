import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BookVoteService } from '../../../../core/services/book-vote.service';
import { BookOption } from '../../../../core/models/book-vote.model';
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

  protected readonly voteService = inject(BookVoteService);

  protected readonly newTitle  = signal('');
  protected readonly newAuthor = signal('');
  protected readonly addError  = signal('');

  protected readonly round = computed(() => this.voteService.getRound(this.clubId()));

  protected readonly sortedOptions = computed(() =>
    [...(this.round()?.options ?? [])].sort((a, b) => b.votes - a.votes),
  );

  protected getPercent(option: BookOption): number {
    const total = this.round()?.totalVotes ?? 0;
    return total > 0 ? Math.round((option.votes / total) * 100) : 0;
  }

  protected createRound(): void {
    this.voteService.createRound(this.clubId());
  }

  protected addOption(): void {
    const title = this.newTitle().trim();
    if (!title) { this.addError.set('Введіть назву книги'); return; }
    this.voteService.addOption(this.clubId(), title, this.newAuthor());
    this.newTitle.set('');
    this.newAuthor.set('');
    this.addError.set('');
  }

  protected removeOption(optionId: string): void {
    this.voteService.removeOption(this.clubId(), optionId);
  }

  protected toggleVote(option: BookOption): void {
    if (option.hasVoted) {
      this.voteService.unvote(this.clubId(), option.id);
    } else {
      this.voteService.vote(this.clubId(), option.id);
    }
  }

  protected closeRound(): void {
    this.voteService.closeRound(this.clubId());
  }

  protected newRound(): void {
    this.voteService.clearRound(this.clubId());
    this.voteService.createRound(this.clubId());
  }
}
