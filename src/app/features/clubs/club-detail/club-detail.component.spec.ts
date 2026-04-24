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

describe('ClubDetailComponent', () => {
  let component: ClubDetailComponent;
  let clubServiceSpy: jasmine.SpyObj<ClubService>;
  let authSpy: jasmine.SpyObj<AuthService>;
  let seoSpy: jasmine.SpyObj<SeoService>;
  let fixture: ComponentFixture<ClubDetailComponent>;

  beforeEach(async () => {
    clubServiceSpy = jasmine.createSpyObj('ClubService', [
      'getClubById', 'getClubMembers', 'loadMyClubs', 'getBans', 'kickMember', 'banMember', 'msUntilDeletion', 'loadClubEvents'
    ], {
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
    clubServiceSpy.loadMyClubs.and.returnValue(Promise.resolve());
    clubServiceSpy.getClubMembers.and.returnValue(Promise.resolve([]));
    clubServiceSpy.getBans.and.returnValue(Promise.resolve([]));
    clubServiceSpy.kickMember.and.returnValue(Promise.resolve());
    clubServiceSpy.banMember.and.returnValue(Promise.resolve());
    clubServiceSpy.msUntilDeletion.and.returnValue(null);
    clubServiceSpy.loadClubEvents.and.returnValue(Promise.resolve([]));
    authSpy.isAuthenticated.and.returnValue(true);
    const eventServiceSpy = jasmine.createSpyObj('EventService', ['loadClubEvents']);
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
});
