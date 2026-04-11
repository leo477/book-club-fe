import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ClubDetailComponent } from './club-detail.component';
import { TranslateModule } from '@ngx-translate/core';
import { RouterTestingModule } from '@angular/router/testing';
import { ClubService } from '../../../core/services/club.service';
import { AuthService } from '../../../core/auth/auth.service';
import { SeoService } from '../../../core/services/seo.service';
import { ComponentFixture } from '@angular/core/testing';

describe('ClubDetailComponent', () => {
  let component: ClubDetailComponent;
  let clubServiceSpy: jasmine.SpyObj<ClubService>;
  let authSpy: jasmine.SpyObj<AuthService>;
  let seoSpy: jasmine.SpyObj<SeoService>;
  let fixture: ComponentFixture<ClubDetailComponent>;

  beforeEach(async () => {
    clubServiceSpy = jasmine.createSpyObj('ClubService', [
      'getClubById', 'getClubMembers', 'loadMyClubs', 'getBans', 'kickMember', 'banMember', 'msUntilDeletion'
    ], {
      myClubs: jasmine.createSpy().and.returnValue([]),
      myClubIds: jasmine.createSpy().and.returnValue(new Set()),
    });
    authSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated'], {
      currentUser: jasmine.createSpy().and.returnValue({ id: 'user-1', displayName: 'Organizer', role: 'organizer' }),
    });
    seoSpy = jasmine.createSpyObj('SeoService', ['setPage', 'injectJsonLd']);
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
    clubServiceSpy.getClubMembers.and.returnValue([]);
    clubServiceSpy.getBans.and.returnValue([]);
    clubServiceSpy.msUntilDeletion.and.returnValue(null);
    authSpy.isAuthenticated.and.returnValue(true);
    await TestBed.configureTestingModule({
      imports: [ClubDetailComponent, TranslateModule.forRoot(), RouterTestingModule],
      providers: [
        provideZonelessChangeDetection(),
        { provide: ClubService, useValue: clubServiceSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: SeoService, useValue: seoSpy },
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(ClubDetailComponent);
    fixture.componentRef.setInput('id', 'club-1');
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('banDurations equals [1,3,5,"permanent"]', () => {
    expect(component.banDurations).toEqual([1, 3, 5, 'permanent']);
  });

  it('showBanMenu initial is null', () => {
    expect(component.showBanMenu()).toBeNull();
  });

  it('toggleBanMenu sets showBanMenu to user id', () => {
    component.toggleBanMenu('user-2');
    expect(component.showBanMenu()).toBe('user-2');
  });

  it('toggleBanMenu twice toggles back to null', () => {
    component.toggleBanMenu('user-2');
    component.toggleBanMenu('user-2');
    expect(component.showBanMenu()).toBeNull();
  });

  it('toggleBanMenu switches to new user id', () => {
    component.toggleBanMenu('user-2');
    component.toggleBanMenu('user-3');
    expect(component.showBanMenu()).toBe('user-3');
  });

  it('kickMember calls clubService and removes member', () => {
    component.members.set([
      { userId: 'user-2', displayName: 'User 2', avatarUrl: null, role: 'member', socialsPublic: false },
      { userId: 'user-3', displayName: 'User 3', avatarUrl: null, role: 'member', socialsPublic: false }
    ]);
    component.kickMember('user-2');
    expect(clubServiceSpy.kickMember).toHaveBeenCalledWith('club-1', 'user-2');
    expect(component.members()).toEqual([
      { userId: 'user-3', displayName: 'User 3', avatarUrl: null, role: 'member', socialsPublic: false }
    ]);
  });

  it('banMember calls clubService, sets showBanMenu null, removes member', () => {
    component.members.set([
      { userId: 'user-2', displayName: 'User 2', avatarUrl: null, role: 'member', socialsPublic: false },
      { userId: 'user-3', displayName: 'User 3', avatarUrl: null, role: 'member', socialsPublic: false }
    ]);
    component.showBanMenu.set('user-2');
    component.banMember('user-2', 3);
    expect(clubServiceSpy.banMember).toHaveBeenCalledWith('club-1', 'user-2', 3);
    expect(component.showBanMenu()).toBeNull();
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
});