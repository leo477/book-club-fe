import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  effect,
  input,
  linkedSignal,
  untracked,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, startWith } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ClubService } from '../../../core/services/club.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Club, ClubMemberDetail, BanRecord, BanDuration } from '../../../core/models/club.model';
import { ClubEvent } from '../../../core/models/event.model';
import { UserProfile } from '../../../core/models/user.model';
import { EventService } from '../../../core/services/event.service';
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

@Component({
  selector: 'app-club-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
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
  private readonly auth = inject(AuthService);
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
  readonly events = signal<ClubEvent[]>([]);
  readonly pastEvents = signal<ClubEvent[]>([]);
  readonly isPastEventsLoading = signal(false);
  readonly isPastEventsLoaded = signal(false);
  readonly activeEventsTab = signal<'upcoming' | 'history'>('upcoming');
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly isActionLoading = signal(false);
  readonly actionError = signal<string | null>(null);
  readonly attendingEventId = signal<string | null>(null);

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
      .filter(e => e.status === 'upcoming' || e.status === 'scheduled' || e.status === 'active')
      .sort((a, b) => a.date.localeCompare(b.date))[0];
    const title = nearest?.bookTitle;
    if (title) return { title, author: '', description: '', coverUrl: nearest.coverUrl ?? null };
    const cb = this.club()?.currentBook;
    return cb ? { ...cb, coverUrl: null } : null;
  });

  readonly deleteCountdown = computed<string | null>(() => {
    const club = this.club();
    if (!club) return null;
    const ms = this.clubService.msUntilDeletion(club);
    if (ms === null) return null;
    const totalMinutes = Math.floor(ms / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours > 0) {
      return minutes > 0 ? `${hours} год ${minutes} хв` : `${hours} год`;
    }
    return `${totalMinutes} хв`;
  });

  constructor() {
    effect((onCleanup) => {
      const clubId = this.id();
      this.activeEventsTab.set('upcoming');
      this.pastEvents.set([]);
      this.isPastEventsLoaded.set(false);
      let cancelled = false;
      onCleanup(() => { cancelled = true; });
      this.loadClub(clubId, () => cancelled).catch((_err: unknown) => { /* swallow */ });
    });
  }

  private async loadClub(clubId: string, isCancelled: () => boolean): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      if (this.auth.isAuthenticated() && untracked(() => this.clubService.myClubs().length === 0)) {
        await this.clubService.loadMyClubs();
      }
      if (isCancelled()) return;

      const found = await this.clubService.getClubById(clubId);
      if (isCancelled()) return;

      if (found) {
        this.club.set(found);
        const [members, events] = await Promise.all([
          this.clubService.getClubMembers(clubId),
          this.clubService.loadClubEvents(clubId),
        ]);
        if (isCancelled()) return;
        this.members.set(members);
        this.events.set(events);
        if (this.auth.currentUser()?.id === found.organizerId) {
          this.clubBans.set(await this.clubService.getBans(clubId));
        }
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
    await this.performMembershipAction(() => this.clubService.joinClub(this.id()), 'Failed to join club');
  }

  async onLeave(): Promise<void> {
    await this.performMembershipAction(() => this.clubService.leaveClub(this.id()), 'Failed to leave club');
  }

  async handleKick(userId: string): Promise<void> {
    await this.clubService.kickMember(this.id(), userId);
    this.members.update(list => list.filter(m => m.userId !== userId));
  }

  async handleBan(event: { userId: string; duration: BanDuration }): Promise<void> {
    await this.clubService.banMember(this.id(), event.userId, event.duration);
    this.members.update(list => list.filter(m => m.userId !== event.userId));
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
      const updated = await this.clubService.getClubById(this.id());
      if (updated) this.club.set(updated);
    } catch (err) {
      this.actionError.set(err instanceof Error ? err.message : errorFallback);
    } finally {
      this.isActionLoading.set(false);
    }
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

  private async performAttendanceAction(eventId: string, attending: boolean): Promise<void> {
    this.attendingEventId.set(eventId);
    try {
      if (attending) {
        await this.eventService.attendEvent(eventId);
      } else {
        await this.eventService.cancelAttendance(eventId);
      }
      this.events.update(list =>
        list.map(e =>
          e.id === eventId
            ? { ...e, isAttending: attending, attendeeCount: e.attendeeCount + (attending ? 1 : -1) }
            : e,
        ),
      );
    } finally {
      this.attendingEventId.set(null);
    }
  }
}
