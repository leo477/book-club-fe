import {
  Directive,
  OnDestroy,
  computed,
  inject,
  input,
  resource,
  signal,
} from '@angular/core';
import { QuizService } from '../../../core/services/quiz.service';
import { QuizSession, QuizLeaderboardEntry } from '../../../core/models/quiz.model';

@Directive()
export abstract class LeaderboardBaseComponent implements OnDestroy {
  protected readonly quizService = inject(QuizService);

  readonly id = input<string>('');
  readonly quizId = input<string>('');

  readonly session = signal<QuizSession | null>(null);
  readonly isLoadingSession = signal(true);
  protected readonly _refreshTick = signal(0);

  private readonly _leaderboardResource = resource({
    params: () => ({
      quizId: this.quizId(),
      sessionId: this.session()?.id,
      tick: this._refreshTick(),
    }),
    loader: ({ params }) =>
      params.sessionId && params.quizId
        ? this.quizService.getLeaderboard(params.quizId, params.sessionId)
        : Promise.resolve<QuizLeaderboardEntry[]>([]),
  });

  readonly leaderboard = computed(() => this._leaderboardResource.value() ?? []);
  readonly isLeaderboardLoading = computed(() => this._leaderboardResource.isLoading());
  readonly podiumFirst = computed(() => this.leaderboard()[0] ?? null);
  readonly podiumSecond = computed(() => this.leaderboard()[1] ?? null);
  readonly podiumThird = computed(() => this.leaderboard()[2] ?? null);
  readonly rest = computed(() => this.leaderboard().slice(3));

  private _refreshInterval?: ReturnType<typeof setInterval>;

  protected startPolling(intervalMs: number): void {
    this._refreshInterval = setInterval(
      () => this._refreshTick.update(n => n + 1),
      intervalMs,
    );
  }

  ngOnDestroy(): void {
    clearInterval(this._refreshInterval);
  }
}
