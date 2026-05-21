import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ClubDetailComponent } from './club-detail.component';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { RouterTestingModule } from '@angular/router/testing';
import { firstValueFrom, of } from 'rxjs';
import { ClubService } from '../../../core/services/club.service';
import { AuthService } from '../../../core/auth/auth.service';
import { SeoService } from '../../../core/services/seo.service';
import { EventService } from '../../../core/services/event.service';
import { ComponentFixture } from '@angular/core/testing';
import { makeClubEvent } from '../../../../testing/event-test.helpers';

describe('ClubDetailComponent', () => {
  let component: ClubDetailComponent;
  let clubServiceSpy: jasmine.SpyObj<ClubService>;
  let eventServiceSpy: jasmine.SpyObj<EventService>;
  let authSpy: jasmine.SpyObj<AuthService>;
  let seoSpy: jasmine.SpyObj<SeoService>;
  let fixture: ComponentFixture<ClubDetailComponent>;

  beforeEach(async () => {
    clubServiceSpy = jasmine.createSpyObj('ClubService', [
      'getClubById', 'getClubMembers', 'ensureMyClubsLoaded', 'getBans', 'kickMember', 'banMember', 'msUntilDeletion', 'loadClubEvents'
    ], {
      clubs: jasmine.createSpy().and.returnValue([]),
      myClubs: jasmine.createSpy().and.returnValue([]),
      myClubIds: jasmine.createSpy().and.returnValue(new Set()),
    });
    authSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated'], {
      currentUser: jasmine.createSpy().and.returnValue({ id: 'user-1', displayName: 'Organizer', role: 'organizer' }),
    });
    seoSpy = jasmine.createSpyObj('SeoService', ['setPage', 'setPageI18n', 'injectJsonLd']);
    clubServiceSpy.getClubById.and.returnValue(Promise.resolve({
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
      afterMeetingVenue: null
    }));
    clubServiceSpy.ensureMyClubsLoaded.and.returnValue(Promise.resolve());
    clubServiceSpy.getClubMembers.and.returnValue(Promise.resolve([]));
    clubServiceSpy.getBans.and.returnValue(Promise.resolve([]));
    clubServiceSpy.kickMember.and.returnValue(Promise.resolve());
    clubServiceSpy.banMember.and.returnValue(Promise.resolve());
    clubServiceSpy.msUntilDeletion.and.returnValue(null);
    clubServiceSpy.loadClubEvents.and.returnValue(Promise.resolve([]));
    authSpy.isAuthenticated.and.returnValue(true);
    eventServiceSpy = jasmine.createSpyObj('EventService', ['loadClubEvents', 'attendEvent', 'cancelAttendance']);
    eventServiceSpy.attendEvent.and.returnValue(Promise.resolve({ auto_joined: false }));
    eventServiceSpy.cancelAttendance.and.returnValue(Promise.resolve());
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
        RouterTestingModule,
      ],
      providers: [
        provideZonelessChangeDetection(),
        { provide: ClubService, useValue: clubServiceSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: SeoService, useValue: seoSpy },
        { provide: EventService, useValue: eventServiceSpy },
      ]
    }).compileComponents();
    const translate = TestBed.inject(TranslateService);
    await firstValueFrom(translate.use('uk'));
    fixture = TestBed.createComponent(ClubDetailComponent);
    fixture.componentRef.setInput('id', 'club-1');
    component = fixture.componentInstance;
    await fixture.whenStable();
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

  it('deleteCountdown returns null if msUntilDeletion is null', () => {
    clubServiceSpy.msUntilDeletion.and.returnValue(null);
    component.club.set({
      id: 'club-1',
      name: 'Test Club',
      description: null,
      coverUrl: null,
      organizerId: 'user-1',
      isPublic: true,
      memberCount: 1,
      createdAt: '2024-01-01',
      city: 'Kyiv',
      nextMeetingDate: null,
      address: null,
      lat: null,
      lng: null,
      theme: null,
      currentBook: null,
      memberPreviews: [],
      status: 'cancelled',
      cancelledAt: '2024-01-01',
      tags: [],
      meetingDurationMinutes: null,
      afterMeetingVenue: null
    });
    expect(component.deleteCountdown()).toBeNull();
  });

  it('deleteCountdown returns hours/minutes string', () => {
    clubServiceSpy.msUntilDeletion.and.returnValue(3600000);
    component.club.set({
      id: 'club-1',
      name: 'Test Club',
      description: null,
      coverUrl: null,
      organizerId: 'user-1',
      isPublic: true,
      memberCount: 1,
      createdAt: '2024-01-01',
      city: 'Kyiv',
      nextMeetingDate: null,
      address: null,
      lat: null,
      lng: null,
      theme: null,
      currentBook: null,
      memberPreviews: [],
      status: 'cancelled',
      cancelledAt: '2024-01-01',
      tags: [],
      meetingDurationMinutes: null,
      afterMeetingVenue: null
    });
    const result = component.deleteCountdown();
    expect(result).toContain('1');
    expect(result).toContain('год');
  });

  it('deleteCountdown returns minutes string', () => {
    clubServiceSpy.msUntilDeletion.and.returnValue(300000);
    component.club.set({
      id: 'club-1',
      name: 'Test Club',
      description: null,
      coverUrl: null,
      organizerId: 'user-1',
      isPublic: true,
      memberCount: 1,
      createdAt: '2024-01-01',
      city: 'Kyiv',
      nextMeetingDate: null,
      address: null,
      lat: null,
      lng: null,
      theme: null,
      currentBook: null,
      memberPreviews: [],
      status: 'cancelled',
      cancelledAt: '2024-01-01',
      tags: [],
      meetingDurationMinutes: null,
      afterMeetingVenue: null
    });
    const result = component.deleteCountdown();
    expect(result).toContain('5');
    expect(result).toContain('хв');
  });

  describe('onJoin', () => {
    it('calls joinClub and updates club from cache', async () => {
      clubServiceSpy.joinClub = jasmine.createSpy().and.returnValue(Promise.resolve());
      await component.onJoin();
      expect(clubServiceSpy.joinClub).toHaveBeenCalledWith('club-1');
      expect(clubServiceSpy.getClubById).not.toHaveBeenCalledTimes(2);
    });

    it('sets actionError on joinClub failure', async () => {
      clubServiceSpy.joinClub = jasmine.createSpy().and.returnValue(Promise.reject(new Error('Already a member')));
      await component.onJoin();
      expect(component.actionError()).toBe('Already a member');
    });

    it('resets isActionLoading to false after completion', async () => {
      clubServiceSpy.joinClub = jasmine.createSpy().and.returnValue(Promise.resolve());
      await component.onJoin();
      expect(component.isActionLoading()).toBeFalse();
    });
  });

  describe('onLeave', () => {
    it('calls leaveClub and updates club from cache', async () => {
      clubServiceSpy.leaveClub = jasmine.createSpy().and.returnValue(Promise.resolve());
      await component.onLeave();
      expect(clubServiceSpy.leaveClub).toHaveBeenCalledWith('club-1');
      expect(clubServiceSpy.getClubById).not.toHaveBeenCalledTimes(2);
    });

    it('sets actionError on leaveClub failure', async () => {
      clubServiceSpy.leaveClub = jasmine.createSpy().and.returnValue(Promise.reject(new Error('Not a member')));
      await component.onLeave();
      expect(component.actionError()).toBe('Not a member');
    });

    it('resets isActionLoading to false after completion', async () => {
      clubServiceSpy.leaveClub = jasmine.createSpy().and.returnValue(Promise.resolve());
      await component.onLeave();
      expect(component.isActionLoading()).toBeFalse();
    });
  });

  describe('onAttend', () => {
    it('calls attendEvent and updates events list', async () => {
      component.events.set([makeClubEvent({ id: 'e1', attendeeCount: 5, isAttending: false })]);
      await component.onAttend('e1');
      expect(eventServiceSpy.attendEvent).toHaveBeenCalledWith('e1');
      expect(component.events()[0].isAttending).toBeTrue();
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
      expect(component.events()[0].isAttending).toBeFalse();
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
      authSpy.currentUser.and.returnValue(null as unknown as ReturnType<typeof authSpy.currentUser>);
      expect(component.currentUserId()).toBeNull();
    });
  });

  describe('deleteCountdown with hours and minutes', () => {
    it('returns hours and minutes string when both > 0', () => {
      clubServiceSpy.msUntilDeletion.and.returnValue(5400000); // 1.5 hours
      component.club.set({
        id: 'club-1', name: 'Test Club', description: null, coverUrl: null,
        organizerId: 'user-1', isPublic: true, memberCount: 1,
        createdAt: '2024-01-01', city: 'Kyiv', nextMeetingDate: null,
        address: null, lat: null, lng: null, theme: null, currentBook: null,
        memberPreviews: [], status: 'cancelled', cancelledAt: '2024-01-01',
        tags: [], meetingDurationMinutes: null, afterMeetingVenue: null,
      });
      const result = component.deleteCountdown();
      expect(result).toContain('год');
      expect(result).toContain('хв');
    });
  });

  describe('onJoin/onLeave: non-Error exception', () => {
    it('onJoin uses generic message for non-Error rejection', async () => {
      clubServiceSpy.joinClub = jasmine.createSpy().and.returnValue(Promise.reject('string error'));
      await component.onJoin();
      expect(component.actionError()).toBe('Failed to join club');
    });

    it('onLeave uses generic message for non-Error rejection', async () => {
      clubServiceSpy.leaveClub = jasmine.createSpy().and.returnValue(Promise.reject('string error'));
      await component.onLeave();
      expect(component.actionError()).toBe('Failed to leave club');
    });
  });
});
