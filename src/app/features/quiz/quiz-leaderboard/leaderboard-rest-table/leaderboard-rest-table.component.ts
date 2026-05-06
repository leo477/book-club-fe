import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { QuizLeaderboardEntry } from '../../../../core/models/quiz.model';
import { InitialsPipe } from '../../../../shared/pipes/initials.pipe';

@Component({
  selector: 'app-leaderboard-rest-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InitialsPipe],
  templateUrl: './leaderboard-rest-table.component.html',
})
export class LeaderboardRestTableComponent {
  readonly entries = input<QuizLeaderboardEntry[]>([]);
}
