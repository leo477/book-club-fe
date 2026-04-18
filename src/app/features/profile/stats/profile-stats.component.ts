import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { UserStats } from '../../../core/models/user.model';

@Component({
  selector: 'app-profile-stats',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './profile-stats.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileStatsComponent {
  readonly stats = input<UserStats | null | undefined>(null);
}
