import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ClubService } from './club.service';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../../environments/environment';

describe('ClubService', () => {
  let service: ClubService;
  let authSpy: jasmine.SpyObj<AuthService>;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    authSpy = jasmine.createSpyObj('AuthService', [], {
      currentUser: jasmine.createSpy().and.returnValue({ id: 'user-1', displayName: 'Test User', role: 'organizer' })
    });
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        provideZonelessChangeDetection(),
        ClubService,
        { provide: AuthService, useValue: authSpy },
      ]
    });
    service = TestBed.inject(ClubService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('getBans returns [] for club with no bans', async () => {
    const promise = service.getBans('club-1');
    const req = httpMock.expectOne(`${environment.apiUrl}/clubs/club-1/bans`);
    req.flush([]);
    const bans = await promise;
    expect(bans).toEqual([]);
  });

  it('banMember sends POST request', async () => {
    const promise = service.banMember('club-1', 'user-2', 1);
    const req = httpMock.expectOne(`${environment.apiUrl}/clubs/club-1/members/user-2/ban`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ duration: 1 });
    req.flush(null);
    await promise;
  });

  it('banMember with permanent duration sends correct payload', async () => {
    const promise = service.banMember('club-1', 'user-2', 'permanent');
    const req = httpMock.expectOne(`${environment.apiUrl}/clubs/club-1/members/user-2/ban`);
    expect(req.request.body).toEqual({ duration: 'permanent' });
    req.flush(null);
    await promise;
  });

  it('getBans returns ban records from API', async () => {
    const apiBan = {
      user_id: 'user-2',
      club_id: 'club-1',
      banned_at: '2024-01-01T00:00:00Z',
      duration: 1,
      banned_by: 'user-1',
    };
    const promise = service.getBans('club-1');
    const req = httpMock.expectOne(`${environment.apiUrl}/clubs/club-1/bans`);
    req.flush([apiBan]);
    const bans = await promise;
    expect(bans.length).toBe(1);
    expect(bans[0].userId).toBe('user-2');
    expect(bans[0].clubId).toBe('club-1');
    expect(bans[0].duration).toBe(1);
    expect(bans[0].bannedBy).toBe('user-1');
  });

  it('getClubMembers returns mapped members from API', async () => {
    const apiMember = {
      user_id: 'user-2',
      display_name: 'Alice',
      avatar_url: null,
      role: 'member',
      socials: null,
      socials_public: false,
    };
    const promise = service.getClubMembers('club-1');
    const req = httpMock.expectOne(`${environment.apiUrl}/clubs/club-1/members`);
    req.flush([apiMember]);
    const members = await promise;
    expect(members.length).toBe(1);
    expect(members[0].userId).toBe('user-2');
    expect(members[0].displayName).toBe('Alice');
  });

  it('getClubMembers returns empty array when API returns []', async () => {
    const promise = service.getClubMembers('club-1');
    const req = httpMock.expectOne(`${environment.apiUrl}/clubs/club-1/members`);
    req.flush([]);
    const members = await promise;
    expect(members).toEqual([]);
  });

  it('joinClub sends POST request', async () => {
    const promise = service.joinClub('club-1');
    const req = httpMock.expectOne(`${environment.apiUrl}/clubs/club-1/join`);
    expect(req.request.method).toBe('POST');
    req.flush({ member_count: 1 });
    await promise;
  });

  it('createClub sends POST and returns mapped club', async () => {
    const apiClub = {
      id: 'new-club',
      name: 'Test',
      description: 'Desc',
      cover_url: null,
      organizer_id: 'user-1',
      is_public: true,
      member_count: 1,
      created_at: '2024-01-01',
      city: 'Kyiv',
      next_meeting_date: null,
      address: null,
      lat: null,
      lng: null,
      theme: null,
      current_book: null,
      member_previews: [],
      status: 'active',
      tags: ['tag1', 'tag2'],
      meeting_duration_minutes: 60,
      after_meeting_venue: { name: 'Cafe', address: 'Main St', description: 'desc' },
    };
    const promise = service.createClub({
      name: 'Test',
      description: 'Desc',
      isPublic: true,
      city: 'Kyiv',
      tags: ['tag1', 'tag2'],
      meetingDurationMinutes: 60,
      afterMeetingVenue: { name: 'Cafe', address: 'Main St', description: 'desc' },
    });
    const req = httpMock.expectOne(`${environment.apiUrl}/clubs`);
    expect(req.request.method).toBe('POST');
    req.flush(apiClub);
    const club = await promise;
    expect(club.tags).toEqual(['tag1', 'tag2']);
    expect(club.meetingDurationMinutes).toBe(60);
    expect(club.afterMeetingVenue).toEqual(jasmine.objectContaining({ name: 'Cafe' }));
  });
});
