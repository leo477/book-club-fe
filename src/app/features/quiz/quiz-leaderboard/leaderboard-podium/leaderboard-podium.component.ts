import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { QuizLeaderboardEntry } from '../../../../core/models/quiz.model';

@Component({
  selector: 'app-leaderboard-podium',
  host: { class: 'block' },
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './leaderboard-podium.component.html',
})
export class LeaderboardPodiumComponent {
  readonly first  = input<QuizLeaderboardEntry | null>(null);
  readonly second = input<QuizLeaderboardEntry | null>(null);
  readonly third  = input<QuizLeaderboardEntry | null>(null);

  protected initials(name: string | null | undefined): string {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase();
  }
}
