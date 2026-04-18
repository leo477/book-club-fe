import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-profile-role-selector',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './profile-role-selector.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileRoleSelectorComponent {
  readonly currentRole = input.required<string>();
  readonly roleChange = output<'user' | 'organizer'>();
}
