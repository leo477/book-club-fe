import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  effect,
  input,
  linkedSignal,
  resource,
} from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { toast } from '@spartan-ng/brain/sonner';
import { ClubService } from '../../../core/services/club.service';
import { logWarn } from '../../../core/utils/logger.util';
import {
  BackendHttpError,
  RequestTimeoutError,
} from '../../../core/interceptors/auth.interceptor';
import { AuthService } from '../../../core/auth/auth.service';
import { Club, ClubMemberDetail, BanRecord, BanDuration } from '../../../core/models/club.model';
import { ClubEvent } from '../../../core/models/event.model';
import { UserProfile } from '../../../core/models/user.model';
import { EventService } from '../../../core/services/event.service';
import { patchEventAttendance } from '../../../core/utils/event-attendance.util';
import { ChatService } from '../../../core/services/chat.service';
import { SeoService } from '../../../core/services/seo.service';
import { FormatDatePipe } from '../../../shared/pipes/format-date.pipe';
import { ClubMembersListComponent } from './members/club-members-list.component';
import { ClubHeaderComponent } from './header/club-header.component';
import { ClubManagePanelComponent } from './manage-panel/club-manage-panel.component';
import { ClubEventCardComponent } from './club-event-card/club-event-card.component';
import { ClubSidebarRightComponent } from './club-sidebar-right/club-sidebar-right.component';
import { BookVoteSectionComponent } from './book-vote/book-vote-section.component';
import { HlmButton } from '../../../shared/spartan/button/src';
import { HlmCard } from '../../../shared/spartan/card/src';
import { HlmTabsImports } from '../../../shared/spartan/tabs/src';

interface ClubDetailData {
  club: Club | null;
  members: ClubMemberDetail[];
  events: ClubEvent[];
}

@Component({
  selector: 'app-club-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgOptimizedImage,
    RouterLink,
    TranslateModule,
    FormatDatePipe,
    ClubMembersListComponent,
    ClubHeaderComponent,
    ClubManagePanelComponent,
    ClubEventCardComponent,
    ClubSidebarRightComponent,
    BookVoteSectionComponent,
    HlmButton,
    HlmCard,
    ...HlmTabsImports,
  ],
  templateUrl: './club-detail.component.html',
})
export class ClubDetailComponent {
  readonly id = input.required<string>();

  private readonly clubService = inject(ClubService);
  private readonly eventService = inject(EventService);
  private readonly chatService = inject(ChatService);
  private readonly auth = inject(AuthService);
  private readonly seo = inject(SeoService);
  private readonly translate = inject(TranslateService);

  readonly currentUser = this.auth.currentUser;

  private readonly _clubResource = resource<ClubDetailData, string>({
    params: () => this.id(),
    loader: async ({ params: clubId }) => {
      if (this.auth.isAuthenticated()) {
        await this.clubService.ensureMyClubsLoaded();
      }
      const found = await this.clubService.getClubById(clubId);
      if (!found) {
        return { club: null, members: [], events: [] };
      }
      const [membersResult, eventsResult] = await Promise.allSettled([
        this.clubService.getClubMembers(clubId),
        this.clubService.loadClubEvents(clubId),
      ]);
      if (membersResult.status === 'rejected') {
        logWarn('Failed to load club members:', membersResult.reason);
      }
      if (eventsResult.status === 'rejected') {
        logWarn('Failed to load club events:', eventsResult.reason);
      }
      return {
        club: found,
        members: membersResult.status === 'fulfilled' ? membersResult.value : [],
        events: eventsResult.status === 'fulfilled' ? eventsResult.value : [],
      };
    },
  });

  readonly club = linkedSignal<Club | null>(() =>
    this._clubResource.error() ? null : (this._clubResource.value()?.club ?? null),
  );
  readonly members = linkedSignal<ClubMemberDetail[]>(() =>
    this._clubResource.error() ? [] : (this._clubResource.value()?.members ?? []),
  );
  readonly events = linkedSignal<ClubEvent[]>(() =>
    this._clubResource.error() ? [] : (this._clubResource.value()?.events ?? []),
  );

  readonly isLoading = this._clubResource.isLoading;
  readonly isClubMissing = computed(() =>
    !this._clubResource.error() && this._clubResource.value()?.club === null,
  );
  readonly errorMessage = computed<string | null>(() => {
    if (this._clubResource.error()) return 'load_failed';
    if (this.isClubMissing()) return 'not_found';
    return null;
  });

  readonly clubBans = signal<BanRecord[]>([]);
  readonly pastEvents = signal<ClubEvent[]>([]);
  readonly isPastEventsLoading = signal(false);
  readonly isPastEventsLoaded = signal(false);
  readonly activeEventsTab = signal<'upcoming' | 'history'>('upcoming');
  readonly isActionLoading = signal(false);
  readonly actionError = signal<string | null>(null);
  readonly attendingEventId = signal<string | null>(null);
  readonly setWinnerEventId = signal<string | null>(null);
  readonly setWinnerLoading = signal<string | null>(null);
  readonly joinRequestStatus = signal<'none' | 'pending' | 'rejected'>('none');

  readonly sortKey = linkedSignal<'date' | 'popular' | 'status'>(() => {
    this.id();
    return 'date';
  });

  readonly sortOptions = [
    { key: 'date' as const,    labelKey: 'CLUB_DETAIL.sort_nearest' },
    { key: 'popular' as const, labelKey: 'CLUB_DETAIL.sort_popular' },
    { key: 'status' as const,  labelKey: 'CLUB_DETAIL.sort_status'  },
  ];

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

  readonly upcomingEvents = computed(() =>
    this.events().filter(e => e.status === 'scheduled' || e.status === 'active'),
  );

  readonly sortedUpcomingEvents = computed(() => {
    const events = this.upcomingEvents();
    const key = this.sortKey();
    if (key === 'popular') {
      return [...events].sort((a, b) => b.attendeeCount - a.attendeeCount);
    }
    if (key === 'status') {
      const order: Record<string, number> = { active: 0, scheduled: 1, rescheduled: 2 };
      return [...events].sort((a, b) => (order[a.status] ?? 9) - (order[b.status] ?? 9));
    }
    return [...events].sort((a, b) => a.date.localeCompare(b.date));
  });

  readonly nearestEventBook = computed<{ title: string; author: string; description: string; coverUrl: string | null } | null>(() => {
    const nearest = [...this.events()]
      .filter(e => e.status === 'scheduled' || e.status === 'active')
      .sort((a, b) => a.date.localeCompare(b.date))[0];
    const title = nearest?.bookTitle;
    if (title) return { title, author: '', description: '', coverUrl: nearest.coverUrl ?? null };
    const cb = this.club()?.currentBook;
    return cb ? { ...cb, coverUrl: null } : null;
  });

  constructor() {
    effect(() => {
      this.id();
      this.activeEventsTab.set('upcoming');
      this.pastEvents.set([]);
      this.isPastEventsLoaded.set(false);
    });

    effect((onCleanup) => {
      if (this._clubResource.error()) return;
      const data = this._clubResource.value();
      if (!data?.club) return;
      const found = data.club;
      let cancelled = false;
      onCleanup(() => { cancelled = true; });

      if (this.auth.isAuthenticated()) {
        this.clubService.getMyMembership(found.id).then(
          (m) => { if (!cancelled) this.joinRequestStatus.set(m.joinRequestStatus); },
          (err: unknown) => logWarn('Failed to load membership:', err),
        );
      }
      if (this.auth.currentUser()?.id === found.organizerId) {
        this.clubService.getBans(found.id).then(
          (bans) => { if (!cancelled) this.clubBans.set(bans); },
          (err: unknown) => {
            const status = (err as { status?: number })?.status;
            const expected = status === 403 || status === 404 || err instanceof RequestTimeoutError;
            if (!expected) {
              logWarn('Failed to load club bans:', err);
            }
          },
        );
      }
      this.seo.setPageI18n('SEO.club_detail_title', {
        ogTitleKey: 'SEO.club_detail_og_title',
        params: { name: found.name },
      });
    });
  }

  async onJoin(): Promise<void> {
    this.isActionLoading.set(true);
    this.actionError.set(null);
    try {
      const status = await this.clubService.joinClub(this.id());
      if (status === 'pending' || status === 'already_requested') {
        this.joinRequestStatus.set('pending');
        toast.success(this.translate.instant('CLUBS.join_request_sent') as string);
      } else {
        this.chatService.loadRooms(this.id(), this.currentUser()?.id);
        toast.success(this.translate.instant('CHAT.club_chat_ready_toast') as string);
      }
    } catch (err) {
      this.actionError.set(this.formatActionError(err, 'Failed to join club'));
      this.scheduleErrorDismiss();
    } finally {
      this.isActionLoading.set(false);
    }
  }

  async onLeave(): Promise<void> {
    await this.performMembershipAction(() => this.clubService.leaveClub(this.id()), 'Failed to leave club');
  }

  openClubChat(): void {
    const user = this.currentUser();
    // Only load rooms if none are already cached for this club — the chat-widget
    // effect eagerly calls loadAllClubRooms() on startup, so a duplicate fetch
    // here would hit GET /clubs/{id}/chat/rooms a second time on page load.
    const hasRoomsForClub = this.chatService.rooms().some(r => r.clubId === this.id());
    if (!hasRoomsForClub) {
      this.chatService.loadRooms(this.id(), user?.id);
    }
    if (!this.chatService.isOpen()) {
      this.chatService.toggleOpen();
    }
  }

  async handleKick(userId: string): Promise<void> {
    const previous = this.members();
    this.members.update(list => list.filter(m => m.userId !== userId));
    try {
      await this.clubService.kickMember(this.id(), userId);
    } catch (err) {
      this.members.set(previous);
      toast.error(this.formatActionError(err, 'Failed to remove member'));
    }
  }

  async handleBan(event: { userId: string; duration: BanDuration }): Promise<void> {
    const previous = this.members();
    this.members.update(list => list.filter(m => m.userId !== event.userId));
    try {
      await this.clubService.banMember(this.id(), event.userId, event.duration);
    } catch (err) {
      this.members.set(previous);
      toast.error(this.formatActionError(err, 'Failed to ban member'));
    }
  }

  async onAttend(eventId: string): Promise<void> {
    await this.performAttendanceAction(eventId, true);
  }

  async onCancelAttend(eventId: string): Promise<void> {
    await this.performAttendanceAction(eventId, false);
  }

  private async performMembershipAction(action: () => Promise<void>, errorFallback: string): Promise<void> {
    this.isActionLoading.set(true);
    this.actionError.set(null);
    try {
      await action();
      const updated = this.clubService.clubs().find(c => c.id === this.id())
        ?? this.clubService.myClubs().find(c => c.id === this.id());
      if (updated) this.club.set(updated);
    } catch (err) {
      this.actionError.set(this.formatActionError(err, errorFallback));
      this.scheduleErrorDismiss();
    } finally {
      this.isActionLoading.set(false);
    }
  }

  private _errorDismissTimer: ReturnType<typeof setTimeout> | null = null;

  dismissActionError(): void {
    if (this._errorDismissTimer !== null) {
      clearTimeout(this._errorDismissTimer);
      this._errorDismissTimer = null;
    }
    this.actionError.set(null);
  }

  private scheduleErrorDismiss(): void {
    if (this._errorDismissTimer !== null) clearTimeout(this._errorDismissTimer);
    this._errorDismissTimer = setTimeout(() => {
      this._errorDismissTimer = null;
      this.actionError.set(null);
    }, 5000);
  }

  private formatActionError(err: unknown, fallback: string): string {
    if (err instanceof RequestTimeoutError) {
      return this.translate.instant('ERRORS.timeout');
    }
    if (err instanceof BackendHttpError) {
      // Prefer backend detail when present; otherwise localized status message.
      if (err.detail) return err.detail;
      return this.translate.instant(err.translationKey);
    }
    if (err instanceof Error && err.message) return err.message;
    return fallback;
  }

  async onEventsTabChange(tab: 'upcoming' | 'history'): Promise<void> {
    this.activeEventsTab.set(tab);
    if (tab === 'history' && !this.isPastEventsLoaded()) {
      await this.loadPastEvents();
    }
  }

  private async loadPastEvents(): Promise<void> {
    this.isPastEventsLoading.set(true);
    try {
      const past = await this.clubService.loadClubEvents(this.id(), true);
      const now = new Date().toISOString();
      this.pastEvents.set(
        past.filter(e => e.date < now).sort((a, b) => b.date.localeCompare(a.date)),
      );
      this.isPastEventsLoaded.set(true);
    } finally {
      this.isPastEventsLoading.set(false);
    }
  }

  async onSetWinner(eventId: string, memberId: string): Promise<void> {
    const previousPastEvents = this.pastEvents();
    const member = this.members().find(m => m.userId === memberId);
    this.setWinnerLoading.set(eventId);
    this.pastEvents.update(list =>
      list.map(e =>
        e.id === eventId
          ? { ...e, winnerId: memberId, winnerName: member?.displayName ?? null }
          : e,
      ),
    );
    try {
      await this.eventService.setEventWinner(eventId, memberId);
      this.setWinnerEventId.set(null);
    } catch (err) {
      this.pastEvents.set(previousPastEvents);
      toast.error(this.formatActionError(err, 'Failed to set event winner'));
    } finally {
      this.setWinnerLoading.set(null);
    }
  }

  private async performAttendanceAction(eventId: string, attending: boolean): Promise<void> {
    const previousEvents = this.events();
    this.attendingEventId.set(eventId);
    this.events.update(list => patchEventAttendance(list, eventId, attending));
    try {
      if (attending) {
        await this.eventService.attendEvent(eventId);
      } else {
        await this.eventService.cancelAttendance(eventId);
      }
    } catch (err) {
      this.events.set(previousEvents);
      throw err;
    } finally {
      this.attendingEventId.set(null);
    }
  }
}
