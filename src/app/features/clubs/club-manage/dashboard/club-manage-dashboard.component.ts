import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ClubStats } from '../../../../core/models/club.model';

@Component({
  selector: 'app-club-manage-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule],
  templateUrl: './club-manage-dashboard.component.html',
})
export class ClubManageDashboardComponent {
  readonly stats = input.required<ClubStats | null>();

  maxMemberGrowth(stats: ClubStats): number {
    return Math.max(...(stats.memberGrowth ?? []).map(m => m.count), 1);
  }

  maxEventFrequency(stats: ClubStats): number {
    return Math.max(...(stats.eventFrequency ?? []).map(m => m.count), 1);
  }
}
