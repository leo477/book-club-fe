import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ClubMemberDetail, BanRecord, BanDuration } from '../../../../core/models/club.model';
import { QrCodeComponent } from '../../../../shared/components/qr-code/qr-code.component';
import { InitialsPipe } from '../../../../shared/pipes/initials.pipe';
import { HlmButton } from '../../../../shared/spartan/button/src';
import { HlmCard } from '../../../../shared/spartan/card/src';

@Component({
  selector: 'app-club-members-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule, QrCodeComponent, InitialsPipe, HlmButton, HlmCard],
  templateUrl: './club-members-list.component.html',
})
export class ClubMembersListComponent {
  readonly members = input.required<ClubMemberDetail[]>();
  readonly clubBans = input.required<BanRecord[]>();
  readonly isOwner = input.required<boolean>();
  readonly currentUserId = input<string | null>(null);
  readonly ownerId = input<string | null>(null);
  readonly showRoleControls = input(false);

  readonly kick = output<string>();
  readonly ban = output<{ userId: string; duration: BanDuration }>();
  readonly promote = output<string>();
  readonly demote = output<string>();

  readonly showQrForUser = signal<string | null>(null);
  readonly showBanMenu = signal<string | null>(null);

  readonly banDurations: BanDuration[] = [1, 3, 5, 'permanent'];

  canSeeSocials(member: ClubMemberDetail): boolean {
    return member.socialsPublic || this.isOwner();
  }

  toggleQr(userId: string): void {
    this.showQrForUser.update(current => current === userId ? null : userId);
  }

  toggleBanMenu(userId: string): void {
    this.showBanMenu.update(current => current === userId ? null : userId);
  }

  emitBan(userId: string, duration: BanDuration): void {
    this.ban.emit({ userId, duration });
    this.showBanMenu.set(null);
  }

  buildQrValue(member: ClubMemberDetail): string {
    if (!member.socials) return member.displayName;
    const lines: string[] = [`📚 ${member.displayName}`];
    const s = member.socials;
    if (s.telegram)   lines.push(`Telegram: t.me/${s.telegram}`);
    if (s.instagram)  lines.push(`Instagram: instagram.com/${s.instagram}`);
    if (s.twitter)    lines.push(`Twitter: x.com/${s.twitter}`);
    if (s.linkedin)   lines.push(`LinkedIn: linkedin.com/in/${s.linkedin}`);
    if (s.github)     lines.push(`GitHub: github.com/${s.github}`);
    if (s.goodreads)  lines.push(`Goodreads: goodreads.com/${s.goodreads}`);
    return lines.join('\n');
  }
}
