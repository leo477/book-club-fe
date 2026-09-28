import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ClubMemberDetail, BanRecord, BanDuration } from '../../../../core/models/club.model';
import { ClubMembersListComponent } from '../../club-detail/members/club-members-list.component';
import { HlmButton } from '../../../../shared/spartan/button/src';

@Component({
  selector: 'app-club-manage-members',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule, ClubMembersListComponent, HlmButton],
  templateUrl: './club-manage-members.component.html',
})
export class ClubManageMembersComponent {
  readonly members = input.required<ClubMemberDetail[]>();
  readonly bans = input.required<BanRecord[]>();
  readonly ownerId = input.required<string | null>();
  readonly currentUserId = input.required<string | null>();
  readonly processingMemberId = input.required<string | null>();

  readonly kick = output<string>();
  readonly ban = output<{ userId: string; duration: BanDuration }>();
  readonly promote = output<string>();
  readonly demote = output<string>();
  readonly unban = output<string>();

  bannedDisplayName(ban: BanRecord): string {
    return this.members().find(m => m.userId === ban.userId)?.displayName ?? ban.userId;
  }
}
