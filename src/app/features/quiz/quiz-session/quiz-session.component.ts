import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ClubEvent } from '../../../core/models/event.model';
import { HlmButton } from '../../../shared/spartan/button/src';
import { HlmCardImports } from '../../../shared/spartan/card/src';
import { LeaderboardPodiumComponent } from '../quiz-leaderboard/leaderboard-podium/leaderboard-podium.component';
import { LeaderboardRestTableComponent } from '../quiz-leaderboard/leaderboard-rest-table/leaderboard-rest-table.component';
import { LeaderboardBaseComponent } from '../quiz-leaderboard/leaderboard-base.component';

@Component({
  selector: 'app-quiz-session',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DatePipe, TranslateModule, ...HlmCardImports, HlmButton, LeaderboardPodiumComponent, LeaderboardRestTableComponent],
  templateUrl: './quiz-session.component.html',
})
export class QuizSessionComponent extends LeaderboardBaseComponent implements OnInit {
  private readonly router = inject(Router);

  readonly clubEvents = signal<ClubEvent[]>([]);
  readonly selectedEventId = signal('');
  readonly isStarting = signal(false);
  readonly isEnding = signal(false);
  readonly errorMessage = signal('');

  ngOnInit(): void {
    Promise.all([
      this.quizService
        .getActiveSession(this.quizId())
        .then(s => this.session.set(s)),
      this.quizService
        .loadClubEvents(this.id())
        .then(e => this.clubEvents.set(e))
        .catch(() => undefined),
    ]).finally(() => this.isLoadingSession.set(false));

    this.startPolling(15_000);
  }

  protected startSession(): void {
    const eventId = this.selectedEventId();
    if (!eventId) return;
    this.isStarting.set(true);
    this.errorMessage.set('');
    this.quizService
      .startSession(this.quizId(), eventId)
      .then(s => {
        this.session.set(s);
        this.isStarting.set(false);
      })
      .catch(err => {
        this.errorMessage.set((err as Error).message);
        this.isStarting.set(false);
      });
  }

  protected endSession(): void {
    const s = this.session();
    if (!s) return;
    this.isEnding.set(true);
    this.errorMessage.set('');
    this.quizService
      .endSession(this.quizId(), s.id)
      .then(() => {
        this.isEnding.set(false);
        this.router.navigate(['/clubs', this.id(), 'quizzes']);
      })
      .catch(err => {
        this.errorMessage.set((err as Error).message);
        this.isEnding.set(false);
      });
  }

  protected manualRefresh(): void {
    this._refreshTick.update(n => n + 1);
  }
}
