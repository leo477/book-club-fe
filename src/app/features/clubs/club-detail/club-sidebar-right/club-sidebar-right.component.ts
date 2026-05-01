import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { InitialsPipe } from '../../../../shared/pipes/initials.pipe';
import { HlmCard } from '../../../../shared/spartan/card/src';
import { Club } from '../../../../core/models/club.model';
import { ClubMemberDetail } from '../../../../core/models/club.model';
import { UserProfile } from '../../../../core/models/user.model';

@Component({
  selector: 'app-club-sidebar-right',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule, InitialsPipe, HlmCard],
  templateUrl: './club-sidebar-right.component.html',
})
export class ClubSidebarRightComponent {
  readonly club = input.required<Club>();
  readonly members = input.required<ClubMemberDetail[]>();
  readonly organizerProfile = input<UserProfile | null>(null);
}
