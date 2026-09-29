import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { UserSocials } from '../../../core/models/user.model';

@Component({
  selector: 'app-social-badges',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './social-badges.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SocialBadgesComponent {
  readonly socials = input.required<UserSocials>();
}
