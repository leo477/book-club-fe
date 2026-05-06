import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HlmCardImports } from '../../../shared/spartan/card/src';
import { InitialsPipe } from '../../../shared/pipes/initials.pipe';
import { LeaderboardPodiumComponent } from './leaderboard-podium/leaderboard-podium.component';
import { LeaderboardRestTableComponent } from './leaderboard-rest-table/leaderboard-rest-table.component';
import { LeaderboardBaseComponent } from './leaderboard-base.component';

@Component({
  selector: 'app-quiz-leaderboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ...HlmCardImports, InitialsPipe, LeaderboardPodiumComponent, LeaderboardRestTableComponent],
  templateUrl: './quiz-leaderboard.component.html',
})
export class QuizLeaderboardComponent extends LeaderboardBaseComponent implements OnInit {
  ngOnInit(): void {
    this.quizService
      .getActiveSession(this.quizId())
      .then(s => {
        this.session.set(s);
        this.isLoadingSession.set(false);
      });

    this.startPolling(30_000);
  }
}
