import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  effect,
  input,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ClubService } from '../../../core/services/club.service';
import { AuthService } from '../../../core/auth/auth.service';
import { MOCK_USERS } from '../../../core/mocks';
import { Club, ClubMemberDetail, BanDuration } from '../../../core/models/club.model';
import { UserProfile } from '../../../core/models/user.model';
import { QrCodeComponent } from '../../../shared/components/qr-code/qr-code.component';
import { SeoService } from '../../../core/services/seo.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { InitialsPipe } from '../../../shared/pipes/initials.pipe';
import { FormatDatePipe } from '../../../shared/pipes/format-date.pipe';

@Component({
  selector: 'app-club-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ReactiveFormsModule, TranslateModule, QrCodeComponent, LoadingSpinnerComponent, InitialsPipe, FormatDatePipe],
  templateUrl: './club-detail.component.html',
})
export class ClubDetailComponent {
  /** Route parameter bound via withComponentInputBinding() */
  readonly id = input.required<string>();

  private readonly clubService = inject(ClubService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly seo = inject(SeoService);

  readonly currentUser = this.auth.currentUser;

  readonly club = signal<Club | null>(null);
  readonly members = signal<ClubMemberDetail[]>([]);
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly isActionLoading = signal(false);
  readonly actionError = signal<string | null>(null);

  readonly isMember = computed(() => this.clubService.myClubIds().has(this.id()));
  readonly isClubOwner = computed(
    () => this.auth.currentUser()?.id === this.club()?.organizerId && !!this.auth.currentUser(),
  );

  readonly showQrForUser = signal<string | null>(null);

  readonly organizerProfile = computed<UserProfile | null>(() => {
    const organizerId = this.club()?.organizerId;
    if (!organizerId) return null;
    return MOCK_USERS.find(u => u.id === organizerId) ?? null;
  });

  readonly banDurations: BanDuration[] = [1, 3, 5, 'permanent'];
  readonly showBanMenu = signal<string | null>(null);

  readonly clubBans = computed(() => this.clubService.getBans(this.id()));

  readonly deleteCountdown = computed<string | null>(() => {
    const c = this.club();
    if (!c) return null;
    const ms = this.clubService.msUntilDeletion(c);
    if (ms === null) return null;
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `буде видалено через ${hours} год. ${minutes} хв.`;
    return `буде видалено через ${minutes} хв.`;
  });

  readonly rescheduleDate = new FormControl<string>('', { nonNullable: true });

  constructor() {
    effect(() => {
      const clubId = this.id();
      void this.loadClub(clubId);
    });
  }

  private async loadClub(clubId: string): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      if (this.auth.isAuthenticated() && this.clubService.myClubs().length === 0) {
        await this.clubService.loadMyClubs();
      }

      const found = await this.clubService.getClubById(clubId);
      if (found) {
        this.club.set(found);
        this.members.set(this.clubService.getClubMembers(clubId));
        this.seo.setPage({
          title: `${found.name} | Book Club`,
          description: found.name,
          canonical: `https://book-club-fe.vercel.app/clubs/${clubId}`,
        });
      } else {
        this.errorMessage.set('This club could not be found.');
      }
    } catch {
      this.errorMessage.set('Failed to load club details.');
    } finally {
      this.isLoading.set(false);
    }
  }

  async onJoin(): Promise<void> {
    this.isActionLoading.set(true);
    this.actionError.set(null);
    try {
      await this.clubService.joinClub(this.id());
      const updated = await this.clubService.getClubById(this.id());
      if (updated) this.club.set(updated);
    } catch (err) {
      this.actionError.set(err instanceof Error ? err.message : 'Failed to join club');
    } finally {
      this.isActionLoading.set(false);
    }
  }

  async onLeave(): Promise<void> {
    this.isActionLoading.set(true);
    this.actionError.set(null);
    try {
      await this.clubService.leaveClub(this.id());
      const updated = await this.clubService.getClubById(this.id());
      if (updated) this.club.set(updated);
    } catch (err) {
      this.actionError.set(err instanceof Error ? err.message : 'Failed to leave club');
    } finally {
      this.isActionLoading.set(false);
    }
  }

  pauseClub(): void {
    this.clubService.pauseClub(this.id());
    void this.refreshClub();
  }

  cancelClub(): void {
    this.clubService.cancelClub(this.id());
    void this.refreshClub();
  }

  rescheduleSubmit(): void {
    const date = this.rescheduleDate.value;
    if (!date) return;
    this.clubService.rescheduleMeeting(this.id(), date);
    this.rescheduleDate.reset();
    void this.refreshClub();
  }

  private async refreshClub(): Promise<void> {
    const updated = await this.clubService.getClubById(this.id());
    if (updated) this.club.set(updated);
  }

  kickMember(userId: string): void {
    this.clubService.kickMember(this.id(), userId);
    this.members.update(list => list.filter(m => m.userId !== userId));
  }

  banMember(userId: string, duration: BanDuration): void {
    this.clubService.banMember(this.id(), userId, duration);
    this.showBanMenu.set(null);
    this.members.update(list => list.filter(m => m.userId !== userId));
  }

  toggleBanMenu(userId: string): void {
    this.showBanMenu.update(current => current === userId ? null : userId);
  }

  canSeeSocials(member: ClubMemberDetail): boolean {
    return member.socialsPublic || this.isClubOwner();
  }

  toggleQr(userId: string): void {
    this.showQrForUser.update(current => current === userId ? null : userId);
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
