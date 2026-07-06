import { TestBed } from '@angular/core/testing';
import { Component, input, provideZonelessChangeDetection } from '@angular/core';
import { ClubDetailComponent } from './club-detail.component';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { firstValueFrom, of } from 'rxjs';
import { ClubService } from '../../../core/services/club.service';
import { AuthService } from '../../../core/auth/auth.service';
import { SeoService } from '../../../core/services/seo.service';
import { EventService } from '../../../core/services/event.service';
import { ComponentFixture } from '@angular/core/testing';
import { makeClubEvent } from '../../../../testing/event-test.helpers';
import { BookVoteSectionComponent } from './book-vote/book-vote-section.component';

@Component({ selector: 'app-book-vote-section', template: '', standalone: true })
class StubBookVoteSectionComponent {
  readonly clubId = input.required<string>();
  readonly isOwner = input(false);
  readonly isMember = input(false);
}

describe('ClubDetailComponent', () => {
  let component: ClubDetailComponent;
  let clubServiceSpy: {
    getClubById: ReturnType<typeof vi.fn>; getClubMembers: ReturnType<typeof vi.fn>;
    ensureMyClubsLoaded: ReturnType<typeof vi.fn>; getBans: ReturnType<typeof vi.fn>;
    kickMember: ReturnType<typeof vi.fn>; banMember: ReturnType<typeof vi.fn>;
    loadClubEvents: ReturnType<typeof vi.fn>;
    clubs: ReturnType<typeof vi.fn>; myClubs: ReturnType<typeof vi.fn>;
    myClubIds: ReturnType<typeof vi.fn>; joinClub?: ReturnType<typeof vi.fn>;
    leaveClub?: ReturnType<typeof vi.fn>; loadMyClubs: ReturnType<typeof vi.fn>;
    getMyMembership: ReturnType<typeof vi.fn>; getJoinRequests: ReturnType<typeof vi.fn>;
    approveJoinRequest: ReturnType<typeof vi.fn>; rejectJoinRequest: ReturnType<typeof vi.fn>;
  };
  let eventServiceSpy: { loadClubEvents: ReturnType<typeof vi.fn>; attendEvent: ReturnType<typeof vi.fn>; cancelAttendance: ReturnType<typeof vi.fn> };
  let authSpy: { isAuthenticated: ReturnType<typeof vi.fn>; currentUser: ReturnType<typeof vi.fn> };
  let seoSpy: { setPage: ReturnType<typeof vi.fn>; setPageI18n: ReturnType<typeof vi.fn>; injectJsonLd: ReturnType<typeof vi.fn> };
  let fixture: ComponentFixture<ClubDetailComponent>;

  beforeEach(async () => {
    clubServiceSpy = {
      getClubById: vi.fn(),
      getClubMembers: vi.fn().mockResolvedValue([]),
      ensureMyClubsLoaded: vi.fn().mockResolvedValue(undefined),
      getBans: vi.fn().mockResolvedValue([]),
      kickMember: vi.fn().mockResolvedValue(undefined),
      banMember: vi.fn().mockResolvedValue(undefined),
      loadClubEvents: vi.fn().mockResolvedValue([]),
      clubs: vi.fn().mockReturnValue([]),
      myClubs: vi.fn().mockReturnValue([]),
      myClubIds: vi.fn().mockReturnValue(new Set()),
      loadMyClubs: vi.fn().mockResolvedValue(undefined),
      getMyMembership: vi.fn().mockResolvedValue({ isMember: false, role: null, joinRequestStatus: 'none' }),
      getJoinRequests: vi.fn().mockResolvedValue([]),
      approveJoinRequest: vi.fn().mockResolvedValue(undefined),
      rejectJoinRequest: vi.fn().mockResolvedValue(undefined),
    };
    authSpy = {
      isAuthenticated: vi.fn().mockReturnValue(true),
      currentUser: vi.fn().mockReturnValue({ id: 'user-1', displayName: 'Organizer', role: 'organizer' }),
    };
    seoSpy = { setPage: vi.fn(), setPageI18n: vi.fn(), injectJsonLd: vi.fn() };
    clubServiceSpy.getClubById.mockResolvedValue({
      id: 'club-1',
      name: 'Test Club',
      description: null,
      coverUrl: null,
      organizerId: 'user-1',
      isPublic: true,
      memberCount: 5,
      createdAt: '2024-01-01',
      city: 'Kyiv',
      nextMeetingDate: null,
      address: null,
      lat: null,
      lng: null,
      theme: null,
      currentBook: null,
      memberPreviews: [],
      status: 'active',
      tags: ['Fiction'],
      meetingDurationMinutes: null,
      afterMeetingVenue: null,
    currentChampion: null,
    });
    eventServiceSpy = {
      loadClubEvents: vi.fn().mockResolvedValue([]),
      attendEvent: vi.fn().mockResolvedValue({ attendeeCount: 0, joinRequestStatus: 'none' }),
      cancelAttendance: vi.fn().mockResolvedValue(undefined),
    };
    await TestBed.configureTestingModule({
      imports: [
        ClubDetailComponent,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useValue: {
              getTranslation: () => of({
                CLUB_DETAIL: {
                  deletion_countdown_hours: 'буде видалено через {{ hours }} год. {{ minutes }} хв.',
                  deletion_countdown_minutes: 'буде видалено через {{ minutes }} хв.',
                },
              }),
            },
          },
        }),
      ],
      providers: [
        provideRouter([]),
        provideZonelessChangeDetection(),
        { provide: ClubService, useValue: clubServiceSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: SeoService, useValue: seoSpy },
        { provide: EventService, useValue: eventServiceSpy },
      ]
    }).compileComponents();
    TestBed.overrideComponent(ClubDetailComponent, {
      remove: { imports: [BookVoteSectionComponent] },
      add: { imports: [StubBookVoteSectionComponent] },
    });
    const translate = TestBed.inject(TranslateService);
    await firstValueFrom(translate.use('uk'));
    fixture = TestBed.createComponent(ClubDetailComponent);
    fixture.componentRef.setInput('id', 'club-1');
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  describe('resource-driven load', () => {
    it('loads the club, resolves isLoading and calls seo.setPageI18n', () => {
      expect(component.club()?.id).toBe('club-1');
      expect(component.isLoading()).toBe(false);
      expect(component.errorMessage()).toBeNull();
      expect(component.isClubMissing()).toBe(false);
      expect(seoSpy.setPageI18n).toHaveBeenCalledWith('SEO.club_detail_title', {
        ogTitleKey: 'SEO.club_detail_og_title',
        params: { name: 'Test Club' },
      });
    });

    it('populates members and events from the club service', async () => {
      clubServiceSpy.getClubMembers.mockResolvedValue([
        { userId: 'user-2', displayName: 'User 2', avatarUrl: null, role: 'member', socialsPublic: false },
      ]);
      clubServiceSpy.loadClubEvents.mockResolvedValue([makeClubEvent({ id: 'e1' })]);

      fixture.componentRef.setInput('id', 'club-2');
      await fixture.whenStable();

      expect(component.members().map(m => m.userId)).toEqual(['user-2']);
      expect(component.events().map(e => e.id)).toEqual(['e1']);
    });

    it('sets isClubMissing and errorMessage to not_found when the club does not exist', async () => {
      clubServiceSpy.getClubById.mockResolvedValue(null);

      fixture.componentRef.setInput('id', 'missing-club');
      await fixture.whenStable();

      expect(component.club()).toBeNull();
      expect(component.isClubMissing()).toBe(true);
      expect(component.errorMessage()).toBe('not_found');
    });

    it('sets errorMessage to load_failed when the club load throws', async () => {
      clubServiceSpy.getClubById.mockRejectedValue(new Error('network error'));

      fixture.componentRef.setInput('id', 'broken-club');
      await fixture.whenStable();

      expect(component.errorMessage()).toBe('load_failed');
      expect(component.isClubMissing()).toBe(false);
    });

    it('loads join request status and bans for the club organizer after resolving', async () => {
      clubServiceSpy.getMyMembership.mockResolvedValue({ isMember: true, role: 'member', joinRequestStatus: 'pending' });
      clubServiceSpy.getBans.mockResolvedValue([
        { userId: 'banned-1', clubId: 'club-3', bannedAt: '2024-01-01', duration: 7, bannedBy: 'user-1' },
      ]);

      fixture.componentRef.setInput('id', 'club-3');
      await fixture.whenStable();

      expect(component.joinRequestStatus()).toBe('pending');
      expect(component.clubBans().length).toBe(1);
    });

    it('resets the events tab state when the id input changes', async () => {
      component.activeEventsTab.set('history');
      component.pastEvents.set([makeClubEvent({ id: 'past-1' })]);
      component.isPastEventsLoaded.set(true);

      fixture.componentRef.setInput('id', 'club-4');
      await fixture.whenStable();

      expect(component.activeEventsTab()).toBe('upcoming');
      expect(component.pastEvents()).toEqual([]);
      expect(component.isPastEventsLoaded()).toBe(false);
    });
  });

  it('handleKick calls clubService.kickMember and removes member', async () => {
    component.members.set([
      { userId: 'user-2', displayName: 'User 2', avatarUrl: null, role: 'member', socialsPublic: false },
      { userId: 'user-3', displayName: 'User 3', avatarUrl: null, role: 'member', socialsPublic: false }
    ]);
    await component.handleKick('user-2');
    expect(clubServiceSpy.kickMember).toHaveBeenCalledWith('club-1', 'user-2');
    expect(component.members()).toEqual([
      { userId: 'user-3', displayName: 'User 3', avatarUrl: null, role: 'member', socialsPublic: false }
    ]);
  });

  it('handleBan calls clubService.banMember and removes member', async () => {
    component.members.set([
      { userId: 'user-2', displayName: 'User 2', avatarUrl: null, role: 'member', socialsPublic: false },
      { userId: 'user-3', displayName: 'User 3', avatarUrl: null, role: 'member', socialsPublic: false }
    ]);
    await component.handleBan({ userId: 'user-2', duration: 3 });
    expect(clubServiceSpy.banMember).toHaveBeenCalledWith('club-1', 'user-2', 3);
    expect(component.members()).toEqual([
      { userId: 'user-3', displayName: 'User 3', avatarUrl: null, role: 'member', socialsPublic: false }
    ]);
  });

  describe('onJoin', () => {
    it('calls joinClub and sets pending status when request is pending', async () => {
      clubServiceSpy.joinClub = vi.fn().mockResolvedValue('pending');
      await component.onJoin();
      expect(clubServiceSpy.joinClub).toHaveBeenCalledWith('club-1');
      expect(component.joinRequestStatus()).toBe('pending');
    });

    it('sets pending status when request was already requested', async () => {
      clubServiceSpy.joinClub = vi.fn().mockResolvedValue('already_requested');
      await component.onJoin();
      expect(component.joinRequestStatus()).toBe('pending');
    });

    it('sets actionError on joinClub failure', async () => {
      clubServiceSpy.joinClub = vi.fn().mockRejectedValue(new Error('Already a member'));
      await component.onJoin();
      expect(component.actionError()).toBe('Already a member');
    });

    it('resets isActionLoading to false after completion', async () => {
      clubServiceSpy.joinClub = vi.fn().mockResolvedValue('member');
      await component.onJoin();
      expect(component.isActionLoading()).toBe(false);
    });

    it('reveals the club chat by refreshing rooms on a successful (member) join', async () => {
      const { ChatService } = await import('../../../core/services/chat.service');
      const loadRoomsSpy = vi.spyOn(TestBed.inject(ChatService), 'loadRooms').mockImplementation(() => undefined);
      clubServiceSpy.joinClub = vi.fn().mockResolvedValue('member');

      await component.onJoin();

      expect(loadRoomsSpy).toHaveBeenCalledWith('club-1', 'user-1');
    });

    it('does not refresh the club chat while the join request is pending', async () => {
      const { ChatService } = await import('../../../core/services/chat.service');
      const loadRoomsSpy = vi.spyOn(TestBed.inject(ChatService), 'loadRooms').mockImplementation(() => undefined);
      clubServiceSpy.joinClub = vi.fn().mockResolvedValue('pending');

      await component.onJoin();

      expect(loadRoomsSpy).not.toHaveBeenCalled();
    });
  });

  describe('onLeave', () => {
    it('calls leaveClub and updates club from cache', async () => {
      clubServiceSpy.leaveClub = vi.fn().mockResolvedValue(undefined);
      await component.onLeave();
      expect(clubServiceSpy.leaveClub).toHaveBeenCalledWith('club-1');
      expect(clubServiceSpy.getClubById).not.toHaveBeenCalledTimes(2);
    });

    it('sets actionError on leaveClub failure', async () => {
      clubServiceSpy.leaveClub = vi.fn().mockRejectedValue(new Error('Not a member'));
      await component.onLeave();
      expect(component.actionError()).toBe('Not a member');
    });

    it('resets isActionLoading to false after completion', async () => {
      clubServiceSpy.leaveClub = vi.fn().mockResolvedValue(undefined);
      await component.onLeave();
      expect(component.isActionLoading()).toBe(false);
    });
  });

  describe('onAttend', () => {
    it('calls attendEvent and updates events list', async () => {
      component.events.set([makeClubEvent({ id: 'e1', attendeeCount: 5, isAttending: false })]);
      await component.onAttend('e1');
      expect(eventServiceSpy.attendEvent).toHaveBeenCalledWith('e1');
      expect(component.events()[0].isAttending).toBe(true);
      expect(component.events()[0].attendeeCount).toBe(6);
    });

    it('clears attendingEventId after completion', async () => {
      component.events.set([makeClubEvent()]);
      await component.onAttend('e1');
      expect(component.attendingEventId()).toBeNull();
    });
  });

  describe('onCancelAttend', () => {
    it('calls cancelAttendance and updates events list', async () => {
      component.events.set([makeClubEvent({ id: 'e1', attendeeCount: 5, isAttending: true })]);
      await component.onCancelAttend('e1');
      expect(eventServiceSpy.cancelAttendance).toHaveBeenCalledWith('e1');
      expect(component.events()[0].isAttending).toBe(false);
      expect(component.events()[0].attendeeCount).toBe(4);
    });

    it('clears attendingEventId after completion', async () => {
      component.events.set([makeClubEvent()]);
      await component.onCancelAttend('e1');
      expect(component.attendingEventId()).toBeNull();
    });
  });

  describe('sortedUpcomingEvents', () => {
    const e1 = makeClubEvent({ id: 'e1', status: 'scheduled', date: '2025-07-01T10:00:00', attendeeCount: 3 });
    const e2 = makeClubEvent({ id: 'e2', status: 'active', date: '2025-06-01T10:00:00', attendeeCount: 10 });
    const e3 = makeClubEvent({ id: 'e3', status: 'scheduled', date: '2025-08-01T10:00:00', attendeeCount: 1 });

    beforeEach(() => {
      component.events.set([e1, e2, e3]);
    });

    it('sorts by date ascending by default', () => {
      component.sortKey.set('date');
      const sorted = component.sortedUpcomingEvents();
      expect(sorted.map(e => e.id)).toEqual(['e2', 'e1', 'e3']);
    });

    it('sorts by attendeeCount descending when key is popular', () => {
      component.sortKey.set('popular');
      const sorted = component.sortedUpcomingEvents();
      expect(sorted.map(e => e.id)).toEqual(['e2', 'e1', 'e3']);
    });

    it('sorts active before scheduled when key is status', () => {
      component.sortKey.set('status');
      const sorted = component.sortedUpcomingEvents();
      expect(sorted[0].id).toBe('e2');
    });
  });

  describe('upcomingEvents', () => {
    it('filters out cancelled and held events', () => {
      component.events.set([
        makeClubEvent({ id: 'e1', status: 'scheduled' }),
        makeClubEvent({ id: 'e2', status: 'active' }),
        makeClubEvent({ id: 'e3', status: 'cancelled' }),
        makeClubEvent({ id: 'e4', status: 'held' }),
      ]);
      const upcoming = component.upcomingEvents();
      expect(upcoming.length).toBe(2);
      expect(upcoming.map(e => e.id)).toEqual(['e1', 'e2']);
    });
  });

  describe('sortedUpcomingEvents: equal attendeeCount tie-break', () => {
    it('sorts multiple events by attendeeCount descending for popular key', () => {
      component.events.set([
        makeClubEvent({ id: 'e1', status: 'scheduled', attendeeCount: 1 }),
        makeClubEvent({ id: 'e2', status: 'active', attendeeCount: 20 }),
        makeClubEvent({ id: 'e3', status: 'scheduled', attendeeCount: 10 }),
      ]);
      component.sortKey.set('popular');
      const sorted = component.sortedUpcomingEvents();
      expect(sorted.map(e => e.attendeeCount)).toEqual([20, 10, 1]);
    });
  });

  describe('organizerProfile', () => {
    it('returns null when club has no organizerId', () => {
      component.club.set(null);
      expect(component.organizerProfile()).toBeNull();
    });

    it('returns null when no organizer member exists', () => {
      component.members.set([
        { userId: 'user-2', displayName: 'Member', avatarUrl: null, role: 'member', socialsPublic: false },
      ]);
      expect(component.organizerProfile()).toBeNull();
    });

    it('returns profile when organizer member exists', () => {
      component.members.set([
        { userId: 'user-1', displayName: 'Organizer', avatarUrl: null, role: 'organizer', socialsPublic: false },
      ]);
      const profile = component.organizerProfile();
      expect(profile).not.toBeNull();
      expect(profile?.displayName).toBe('Organizer');
    });
  });

  describe('currentUserId', () => {
    it('returns null when no user is authenticated', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      authSpy.currentUser.mockReturnValue(null as any);
      expect(component.currentUserId()).toBeNull();
    });
  });

  describe('onJoin/onLeave: non-Error exception', () => {
    it('onJoin uses generic message for non-Error rejection', async () => {
      clubServiceSpy.joinClub = vi.fn().mockRejectedValue('string error');
      await component.onJoin();
      expect(component.actionError()).toBe('Failed to join club');
    });

    it('onLeave uses generic message for non-Error rejection', async () => {
      clubServiceSpy.leaveClub = vi.fn().mockRejectedValue('string error');
      await component.onLeave();
      expect(component.actionError()).toBe('Failed to leave club');
    });
  });
});
