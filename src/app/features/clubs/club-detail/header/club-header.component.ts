import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Club } from '../../../../core/models/club.model';
import { UserProfile } from '../../../../core/models/user.model';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { HlmButton } from '../../../../shared/spartan/button/src';

@Component({
  selector: 'app-club-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule, LoadingSpinnerComponent, HlmButton],
  templateUrl: './club-header.component.html',
})
export class ClubHeaderComponent {
  readonly club = input.required<Club>();
  readonly isMember = input.required<boolean>();
  readonly isOwner = input.required<boolean>();
  readonly isAuthenticated = input.required<boolean>();
  readonly isActionLoading = input.required<boolean>();
  readonly currentUser = input<UserProfile | null>(null);

  readonly join = output<void>();
  readonly leave = output<void>();
}
