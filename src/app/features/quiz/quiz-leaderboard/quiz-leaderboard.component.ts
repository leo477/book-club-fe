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
import { RouterLink } from '@angular/router';
import { QuizService } from '../../../core/services/quiz.service';
import { QuizSession } from '../../../core/models/quiz.model';
import { HlmCardImports } from '../../../shared/spartan/card/src';
import { LeaderboardPodiumComponent } from './leaderboard-podium/leaderboard-podium.component';

@Component({
  selector: 'app-quiz-leaderboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ...HlmCardImports, LeaderboardPodiumComponent],
  templateUrl: './quiz-leaderboard.component.html',
})
export class QuizLeaderboardComponent implements OnInit, OnDestroy {
  private readonly quizService = inject(QuizService);

  readonly id = input<string>('');
  readonly quizId = input<string>('');

  readonly session = signal<QuizSession | null>(null);
  readonly isLoadingSession = signal(true);
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
  readonly rest = computed(() => this.leaderboard().slice(3));

  private _refreshInterval?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    this.quizService
      .getActiveSession(this.quizId())
      .then(s => {
        this.session.set(s);
        this.isLoadingSession.set(false);
      });

    this._refreshInterval = setInterval(
      () => this._refreshTick.update(n => n + 1),
      30_000,
    );
  }

  ngOnDestroy(): void {
    clearInterval(this._refreshInterval);
  }

  protected initials(name: string): string {
    const parts = name.trim().split(/\s+/);
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase();
  }
}
