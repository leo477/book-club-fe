import {
  Component,
  ChangeDetectionStrategy,
  inject,
  input,
  signal,
  computed,
  effect,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { toast } from '@spartan-ng/brain/sonner';
import { ClubService, JoinRequest } from '../../../core/services/club.service';
import { ChatService } from '../../../core/services/chat.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Club, ClubMemberDetail, BanRecord, BanDuration, ClubStats } from '../../../core/models/club.model';
import { ClubMembersListComponent } from '../club-detail/members/club-members-list.component';
import { EditClubComponent } from '../edit-club/edit-club.component';
import { HlmSpinner } from '../../../shared/spartan/spinner/src';
import { HlmButton } from '../../../shared/spartan/button/src';
import { HlmTabsImports } from '../../../shared/spartan/tabs/src';

@Component({
  selector: 'app-club-manage',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    RouterLink,
    TranslateModule,
    ClubMembersListComponent,
    EditClubComponent,
    HlmSpinner,
    HlmButton,
    ...HlmTabsImports,
  ],
  templateUrl: './club-manage.component.html',
})
export class ClubManageComponent {
  readonly id = input.required<string>();

  private readonly clubService = inject(ClubService);
  private readonly chatService = inject(ChatService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly club = signal<Club | null>(null);
  readonly stats = signal<ClubStats | null>(null);
  readonly members = signal<ClubMemberDetail[]>([]);
  readonly bans = signal<BanRecord[]>([]);
  readonly joinRequests = signal<JoinRequest[]>([]);
  readonly isLoading = signal(true);
  readonly isClubMissing = signal(false);

  readonly activeTab = signal<'dashboard' | 'members' | 'requests' | 'settings' | 'tools'>('dashboard');

  readonly processingRequestUserId = signal<string | null>(null);
  readonly processingMemberId = signal<string | null>(null);

  readonly newRoomName = signal('');
  readonly isCreatingRoom = signal(false);
  readonly roomError = signal<string | null>(null);

  readonly rescheduleDate = signal('');
  readonly showRescheduleInput = signal(false);
  readonly showCancelConfirm = signal(false);
  readonly showDeleteConfirm = signal(false);
  readonly isDeleting = signal(false);

  readonly currentUserId = computed(() => this.auth.currentUser()?.id ?? null);

  constructor() {
    effect((onCleanup) => {
      const clubId = this.id();
      let cancelled = false;
      onCleanup(() => { cancelled = true; });
      this.load(clubId, () => cancelled).catch(() => { /* swallow */ });
    });
  }

  private async load(clubId: string, isCancelled: () => boolean): Promise<void> {
    this.isLoading.set(true);
    this.isClubMissing.set(false);
    const found = await this.clubService.getClubById(clubId);
    if (isCancelled()) return;
    if (!found) {
      this.isClubMissing.set(true);
      this.isLoading.set(false);
      return;
    }
    this.club.set(found);
    const [stats, members, bans, requests] = await Promise.allSettled([
      this.clubService.getClubStats(clubId),
      this.clubService.getClubMembers(clubId),
      this.clubService.getBans(clubId),
      this.clubService.getJoinRequests(clubId),
    ]);
    if (isCancelled()) return;
    if (stats.status === 'fulfilled') this.stats.set(stats.value);
    if (members.status === 'fulfilled') this.members.set(members.value);
    if (bans.status === 'fulfilled') this.bans.set(bans.value);
    if (requests.status === 'fulfilled') this.joinRequests.set(requests.value);
    this.isLoading.set(false);
  }

  maxMemberGrowth(stats: ClubStats): number {
    return Math.max(...(stats.memberGrowth ?? []).map(m => m.count), 1);
  }

  maxEventFrequency(stats: ClubStats): number {
    return Math.max(...(stats.eventFrequency ?? []).map(m => m.count), 1);
  }

  bannedDisplayName(ban: BanRecord): string {
    return this.members().find(m => m.userId === ban.userId)?.displayName ?? ban.userId;
  }

  async handleKick(userId: string): Promise<void> {
    await this.mutateMembers(userId, () => this.clubService.kickMember(this.id(), userId), list =>
      list.filter(m => m.userId !== userId),
    );
  }

  async handleBan(event: { userId: string; duration: BanDuration }): Promise<void> {
    await this.mutateMembers(event.userId, () => this.clubService.banMember(this.id(), event.userId, event.duration), list =>
      list.filter(m => m.userId !== event.userId),
    );
    this.clubService.getBans(this.id()).then(b => this.bans.set(b)).catch(() => { /* */ });
  }

  async handlePromote(userId: string): Promise<void> {
    await this.mutateMembers(userId, () => this.clubService.updateMemberRole(this.id(), userId, 'organizer'), list =>
      list.map(m => (m.userId === userId ? { ...m, role: 'organizer' } : m)),
    );
  }

  async handleDemote(userId: string): Promise<void> {
    await this.mutateMembers(userId, () => this.clubService.updateMemberRole(this.id(), userId, 'member'), list =>
      list.map(m => (m.userId === userId ? { ...m, role: 'member' } : m)),
    );
  }

  async handleUnban(userId: string): Promise<void> {
    this.processingMemberId.set(userId);
    const previous = this.bans();
    this.bans.update(list => list.filter(b => b.userId !== userId));
    try {
      await this.clubService.unbanMember(this.id(), userId);
    } catch {
      this.bans.set(previous);
      toast.error('Failed to unban member');
    } finally {
      this.processingMemberId.set(null);
    }
  }

  private async mutateMembers(
    userId: string,
    action: () => Promise<void>,
    optimistic: (list: ClubMemberDetail[]) => ClubMemberDetail[],
  ): Promise<void> {
    this.processingMemberId.set(userId);
    const previous = this.members();
    this.members.update(optimistic);
    try {
      await action();
    } catch {
      this.members.set(previous);
      toast.error('Action failed');
    } finally {
      this.processingMemberId.set(null);
    }
  }

  async onApproveJoinRequest(userId: string): Promise<void> {
    this.processingRequestUserId.set(userId);
    try {
      await this.clubService.approveJoinRequest(this.id(), userId);
      this.joinRequests.update(list => list.filter(r => r.userId !== userId));
      this.clubService.getClubMembers(this.id()).then(m => this.members.set(m)).catch(() => { /* */ });
    } catch {
      toast.error('Failed to approve request');
    } finally {
      this.processingRequestUserId.set(null);
    }
  }

  async onRejectJoinRequest(userId: string): Promise<void> {
    this.processingRequestUserId.set(userId);
    try {
      await this.clubService.rejectJoinRequest(this.id(), userId);
      this.joinRequests.update(list => list.filter(r => r.userId !== userId));
    } catch {
      toast.error('Failed to reject request');
    } finally {
      this.processingRequestUserId.set(null);
    }
  }

  async createChatRoom(): Promise<void> {
    const name = this.newRoomName().trim();
    if (!name) return;
    this.isCreatingRoom.set(true);
    this.roomError.set(null);
    try {
      const room = await this.chatService.createRoom(this.id(), name);
      this.newRoomName.set('');
      this.chatService.openAndFocusRoom(room);
    } catch {
      this.roomError.set('Failed to create chat room');
    } finally {
      this.isCreatingRoom.set(false);
    }
  }

  async onPause(): Promise<void> {
    try {
      await this.clubService.pauseClub(this.id());
      this.club.update(c => (c ? { ...c, status: 'paused' } : c));
    } catch {
      toast.error('Action failed');
    }
  }

  async onCancel(): Promise<void> {
    this.showCancelConfirm.set(false);
    try {
      await this.clubService.cancelClub(this.id());
      this.club.update(c => (c ? { ...c, status: 'cancelled', cancelledAt: new Date().toISOString() } : c));
    } catch {
      toast.error('Action failed');
    }
  }

  async onReschedule(): Promise<void> {
    const date = this.rescheduleDate();
    if (!date) return;
    const iso = new Date(date).toISOString();
    try {
      await this.clubService.rescheduleMeeting(this.id(), iso);
      this.club.update(c => (c ? { ...c, nextMeetingDate: iso, status: 'active' } : c));
      this.showRescheduleInput.set(false);
      this.rescheduleDate.set('');
    } catch {
      toast.error('Action failed');
    }
  }

  async onDelete(): Promise<void> {
    this.isDeleting.set(true);
    try {
      await this.clubService.deleteClub(this.id());
      await this.router.navigate(['/clubs']);
    } catch {
      this.isDeleting.set(false);
      toast.error('Failed to delete club');
    }
  }
}
