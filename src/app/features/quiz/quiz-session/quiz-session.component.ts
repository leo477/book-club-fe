import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  computed,
  inject,
  input,
  resource,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { QuizService } from '../../../core/services/quiz.service';
import { QuizSession } from '../../../core/models/quiz.model';
import { ClubEvent } from '../../../core/models/event.model';
import { HlmButton } from '../../../shared/spartan/button/src';
import { HlmCardImports } from '../../../shared/spartan/card/src';
import { LeaderboardPodiumComponent } from '../quiz-leaderboard/leaderboard-podium/leaderboard-podium.component';

@Component({
  selector: 'app-quiz-session',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DatePipe, ...HlmCardImports, HlmButton, LeaderboardPodiumComponent],
  templateUrl: './quiz-session.component.html',
})
export class QuizSessionComponent implements OnInit, OnDestroy {
  private readonly quizService = inject(QuizService);
  private readonly router = inject(Router);

  readonly id = input<string>('');
  readonly quizId = input<string>('');

  readonly session = signal<QuizSession | null>(null);
  readonly clubEvents = signal<ClubEvent[]>([]);
  readonly isLoadingSession = signal(true);
  readonly selectedEventId = signal('');
  readonly isStarting = signal(false);
  readonly isEnding = signal(false);
  readonly errorMessage = signal('');

  private readonly _refreshTick = signal(0);

  private readonly _leaderboardResource = resource({
    params: () => ({
      quizId: this.quizId(),
      sessionId: this.session()?.id,
      tick: this._refreshTick(),
    }),
    loader: ({ params }) =>
      params.sessionId && params.quizId
        ? this.quizService.getLeaderboard(params.quizId, params.sessionId)
        : Promise.resolve([]),
  });

  readonly leaderboard = computed(() => this._leaderboardResource.value() ?? []);
  readonly isLeaderboardLoading = computed(() => this._leaderboardResource.isLoading());
  readonly podiumFirst = computed(() => this.leaderboard()[0] ?? null);
  readonly podiumSecond = computed(() => this.leaderboard()[1] ?? null);
  readonly podiumThird = computed(() => this.leaderboard()[2] ?? null);
  readonly leaderboardRest = computed(() => this.leaderboard().slice(3));

  private _refreshInterval?: ReturnType<typeof setInterval>;

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

    this._refreshInterval = setInterval(
      () => this._refreshTick.update(n => n + 1),
      15_000,
    );
  }

  ngOnDestroy(): void {
    clearInterval(this._refreshInterval);
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
