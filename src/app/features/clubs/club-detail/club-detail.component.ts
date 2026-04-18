import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  effect,
  input,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, startWith } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ClubService } from '../../../core/services/club.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Club, ClubMemberDetail, BanRecord, BanDuration } from '../../../core/models/club.model';
import { UserProfile } from '../../../core/models/user.model';
import { SeoService } from '../../../core/services/seo.service';
import { InitialsPipe } from '../../../shared/pipes/initials.pipe';
import { FormatDatePipe } from '../../../shared/pipes/format-date.pipe';
import { ClubMembersListComponent } from './members/club-members-list.component';
import { ClubScheduleComponent } from './schedule/club-schedule.component';
import { ClubHeaderComponent } from './header/club-header.component';
import { ClubInfoComponent } from './info/club-info.component';
import { ClubManagePanelComponent } from './manage-panel/club-manage-panel.component';

@Component({
  selector: 'app-club-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    TranslateModule,
    InitialsPipe,
    FormatDatePipe,
    ClubMembersListComponent,
    ClubScheduleComponent,
    ClubHeaderComponent,
    ClubInfoComponent,
    ClubManagePanelComponent,
  ],
  templateUrl: './club-detail.component.html',
})
export class ClubDetailComponent {
  /** Route parameter bound via withComponentInputBinding() */
  readonly id = input.required<string>();

  private readonly clubService = inject(ClubService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly seo = inject(SeoService);
  private readonly translate = inject(TranslateService);

  private readonly _lang = toSignal(
    this.translate.onLangChange.pipe(
      map(e => e.lang),
      startWith(this.translate.currentLang ?? 'uk'),
    ),
    { initialValue: this.translate.currentLang ?? 'uk' },
  );

  readonly currentUser = this.auth.currentUser;

  readonly club = signal<Club | null>(null);
  readonly members = signal<ClubMemberDetail[]>([]);
  readonly clubBans = signal<BanRecord[]>([]);
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly isActionLoading = signal(false);
  readonly actionError = signal<string | null>(null);

  readonly isMember = computed(() => this.clubService.myClubIds().has(this.id()));
  readonly isClubOwner = computed(
    () => this.auth.currentUser()?.id === this.club()?.organizerId && !!this.auth.currentUser(),
  );

  readonly currentUserId = computed(() => this.auth.currentUser()?.id ?? null);

  readonly organizerProfile = computed<UserProfile | null>(() => {
    const organizerId = this.club()?.organizerId;
    if (!organizerId) return null;
    const organizer = this.members().find(m => m.role === 'organizer');
    if (!organizer) return null;
    return {
      id: organizerId,
      displayName: organizer.displayName,
      avatarUrl: organizer.avatarUrl,
      role: 'user',
      createdAt: '',
      socials: organizer.socials,
      socialsPublic: organizer.socialsPublic,
    } satisfies UserProfile;
  });

  readonly deleteCountdown = computed<string | null>(() => {
    this._lang();
    const c = this.club();
    if (!c) return null;
    const ms = this.clubService.msUntilDeletion(c);
    if (ms === null) return null;
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0)
      return this.translate.instant('CLUB_DETAIL.deletion_countdown_hours', { hours, minutes });
    return this.translate.instant('CLUB_DETAIL.deletion_countdown_minutes', { minutes });
  });

  constructor() {
    effect((onCleanup) => {
      const clubId = this.id();
      let cancelled = false;
      onCleanup(() => { cancelled = true; });
      void this.loadClub(clubId, () => cancelled);
    });
  }

  private async loadClub(clubId: string, isCancelled: () => boolean): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      if (this.auth.isAuthenticated() && this.clubService.myClubs().length === 0) {
        await this.clubService.loadMyClubs();
      }
      if (isCancelled()) return;

      const found = await this.clubService.getClubById(clubId);
      if (isCancelled()) return;

      if (found) {
        this.club.set(found);
        this.members.set(await this.clubService.getClubMembers(clubId));
        if (isCancelled()) return;
        this.clubBans.set(await this.clubService.getBans(clubId));
        this.seo.setPageI18n('SEO.club_detail_title', {
          ogTitleKey: 'SEO.club_detail_og_title',
          params: { name: found.name },
        });
      } else {
        this.errorMessage.set('This club could not be found.');
      }
    } catch {
      if (!isCancelled()) this.errorMessage.set('Failed to load club details.');
    } finally {
      if (!isCancelled()) this.isLoading.set(false);
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

  async handleKick(userId: string): Promise<void> {
    await this.clubService.kickMember(this.id(), userId);
    this.members.update(list => list.filter(m => m.userId !== userId));
  }

  async handleBan(event: { userId: string; duration: BanDuration }): Promise<void> {
    await this.clubService.banMember(this.id(), event.userId, event.duration);
    this.members.update(list => list.filter(m => m.userId !== event.userId));
  }

  async pauseClub(): Promise<void> {
    await this.clubService.pauseClub(this.id());
    await this.refreshClub();
  }

  async cancelClub(): Promise<void> {
    await this.clubService.cancelClub(this.id());
    await this.refreshClub();
  }

  async rescheduleSubmit(date: string): Promise<void> {
    if (!date) return;
    await this.clubService.rescheduleMeeting(this.id(), date);
    await this.refreshClub();
  }

  private async refreshClub(): Promise<void> {
    const updated = await this.clubService.getClubById(this.id());
    if (updated) this.club.set(updated);
  }
}
