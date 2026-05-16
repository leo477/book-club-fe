import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { QuizLeaderboardEntry } from '../../../../core/models/quiz.model';
import { InitialsPipe } from '../../../../shared/pipes/initials.pipe';

@Component({
  selector: 'app-leaderboard-podium',
  host: { class: 'block' },
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgOptimizedImage, InitialsPipe],
  templateUrl: './leaderboard-podium.component.html',
})
export class LeaderboardPodiumComponent {
  readonly first  = input<QuizLeaderboardEntry | null>(null);
  readonly second = input<QuizLeaderboardEntry | null>(null);
  readonly third  = input<QuizLeaderboardEntry | null>(null);
}
