import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideBookOpen, lucideBrain, lucideTrophy, lucideHeart, lucideBook } from '@ng-icons/lucide';
import { UserStats } from '../../../core/models/user.model';

@Component({
  selector: 'app-profile-stats',
  standalone: true,
  imports: [TranslateModule, NgIcon],
  providers: [provideIcons({ lucideBookOpen, lucideBrain, lucideTrophy, lucideHeart, lucideBook })],
  templateUrl: './profile-stats.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileStatsComponent {
  readonly stats = input<UserStats | null | undefined>(null);
}
