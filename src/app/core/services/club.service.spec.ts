import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TranslateService } from '@ngx-translate/core';
import { ClubService } from './club.service';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../../environments/environment';

describe('ClubService', () => {
  let service: ClubService;
  let authSpy: { currentUser: ReturnType<typeof vi.fn> };
  let httpMock: HttpTestingController;

  beforeEach(() => {
    authSpy = {
      currentUser: vi.fn().mockReturnValue({ id: 'user-1', displayName: 'Test User', role: 'organizer' }),
    };
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        ClubService,
        { provide: AuthService, useValue: authSpy },
        { provide: TranslateService, useValue: { instant: (key: string) => key } },
      ],
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
      userId: 'user-2',
      clubId: 'club-1',
      bannedAt: '2024-01-01T00:00:00Z',
      duration: 1,
      bannedBy: 'user-1',
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
      userId: 'user-2',
      displayName: 'Alice',
      avatarUrl: null,
      role: 'member',
      socials: null,
      socialsPublic: false,
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

  describe('ensureMyClubsLoaded', () => {
    const minimalApiClub = {
      id: 'c1', name: 'C1', description: null, coverUrl: null,
      organizerId: 'u1', isPublic: true, memberCount: 1,
      createdAt: '2024-01-01', city: 'Kyiv', nextMeetingDate: null,
      address: null, lat: null, lng: null, theme: null, currentBook: null,
      memberPreviews: [], status: 'active', tags: [], cancelledAt: null,
      meetingDurationMinutes: null, afterMeetingVenue: null,
    };

    it('calls loadMyClubs when no clubs are cached', async () => {
      const promise = service.ensureMyClubsLoaded();
      const req = httpMock.expectOne(`${environment.apiUrl}/clubs/my`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
      await promise;
    });

    it('skips loadMyClubs when already loaded with empty clubs within TTL', async () => {
      const load1 = service.ensureMyClubsLoaded();
      httpMock.expectOne(`${environment.apiUrl}/clubs/my`).flush([]);
      await load1;

      await service.ensureMyClubsLoaded();
      httpMock.expectNone(`${environment.apiUrl}/clubs/my`);
      expect(service.myClubs().length).toBe(0);
    });

    it('skips loadMyClubs when clubs are fresh and non-empty', async () => {
      const load1 = service.ensureMyClubsLoaded();
      const req1 = httpMock.expectOne(`${environment.apiUrl}/clubs/my`);
      req1.flush([minimalApiClub]);
      await load1;

      await service.ensureMyClubsLoaded();
      httpMock.expectNone(`${environment.apiUrl}/clubs/my`);
      expect(service.myClubs().length).toBe(1);
    });

    it('calls loadMyClubs again when TTL has expired', async () => {
      const load1 = service.ensureMyClubsLoaded();
      const req1 = httpMock.expectOne(`${environment.apiUrl}/clubs/my`);
      req1.flush([minimalApiClub]);
      await load1;

      const load2 = service.ensureMyClubsLoaded(0);
      const req2 = httpMock.expectOne(`${environment.apiUrl}/clubs/my`);
      req2.flush([]);
      await load2;
      expect(service.myClubs().length).toBe(0);
    });
  });

  describe('TTL cache', () => {
    const minimalApiClub = {
      id: 'club-1', name: 'Test', description: null, coverUrl: null,
      organizerId: 'user-1', isPublic: true, memberCount: 1,
      createdAt: '2024-01-01', city: 'Kyiv', nextMeetingDate: null,
      address: null, lat: null, lng: null, theme: null, currentBook: null,
      memberPreviews: [], status: 'active', tags: [], cancelledAt: null,
      meetingDurationMinutes: null, afterMeetingVenue: null,
    };

    it('getClubById returns cached result without HTTP on second call', async () => {
      const p1 = service.getClubById('club-1');
      httpMock.expectOne(`${environment.apiUrl}/clubs/club-1`).flush(minimalApiClub);
      await p1;

      const result = await service.getClubById('club-1');
      httpMock.expectNone(`${environment.apiUrl}/clubs/club-1`);
      expect(result?.id).toBe('club-1');
    });

    it('getClubById re-fetches after TTL expires', async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date());

      const p1 = service.getClubById('club-1');
      httpMock.expectOne(`${environment.apiUrl}/clubs/club-1`).flush(minimalApiClub);
      await p1;

      vi.advanceTimersByTime(61_000);

      const p2 = service.getClubById('club-1');
      httpMock.expectOne(`${environment.apiUrl}/clubs/club-1`).flush(minimalApiClub);
      const result = await p2;

      vi.useRealTimers();
      expect(result?.id).toBe('club-1');
    });

    it('getClubMembers returns cached result on second call', async () => {
      const apiMember = { userId: 'u1', displayName: 'Alice', avatarUrl: null, role: 'member', socials: null, socialsPublic: false };

      const p1 = service.getClubMembers('club-1');
      httpMock.expectOne(`${environment.apiUrl}/clubs/club-1/members`).flush([apiMember]);
      await p1;

      const result = await service.getClubMembers('club-1');
      httpMock.expectNone(`${environment.apiUrl}/clubs/club-1/members`);
      expect(result.length).toBe(1);
    });

    it('loadClubEvents returns cached result when includePast is false', async () => {
      const p1 = service.loadClubEvents('club-1', false);
      httpMock.expectOne(r => r.url.includes('/clubs/club-1/events')).flush([]);
      await p1;

      const result = await service.loadClubEvents('club-1', false);
      httpMock.expectNone(r => r.url.includes('/clubs/club-1/events'));
      expect(result).toBeDefined();
    });

    it('loadClubEvents bypasses cache when includePast is true', async () => {
      const p1 = service.loadClubEvents('club-1', false);
      httpMock.expectOne(r => r.url.includes('/clubs/club-1/events')).flush([]);
      await p1;

      const p2 = service.loadClubEvents('club-1', true);
      httpMock.expectOne(r => r.url.includes('/clubs/club-1/events')).flush([]);
      const result = await p2;
      expect(result).toBeDefined();
    });
  });

  const makeApiClub = (overrides: Record<string, unknown>) => ({
    id: 'club-1', name: 'Test', description: null, coverUrl: null,
    organizerId: 'u1', isPublic: true, memberCount: 1, createdAt: '2024-01-01',
    city: 'Kyiv', nextMeetingDate: null, address: null, lat: null, lng: null,
    theme: null, currentBook: null, memberPreviews: [], status: 'active',
    tags: [], cancelledAt: null, meetingDurationMinutes: null, afterMeetingVenue: null,
    ...overrides,
  });

  describe('patchClubAndSync (pauseClub, cancelClub, rescheduleMeeting)', () => {
    it('pauseClub invalidates clubByIdCache and syncs myClubs', async () => {
      const p1 = service.getClubById('club-1');
      httpMock.expectOne(`${environment.apiUrl}/clubs/club-1`).flush(makeApiClub({ status: 'active' }));
      await p1;

      const myClubsPromise = service.loadMyClubs();
      httpMock.expectOne(`${environment.apiUrl}/clubs/my`).flush([makeApiClub({ status: 'active' })]);
      await myClubsPromise;

      const pausePromise = service.pauseClub('club-1');
      httpMock.expectOne(`${environment.apiUrl}/clubs/club-1/pause`).flush(makeApiClub({ status: 'paused' }));
      await pausePromise;

      const resultPromise = service.getClubById('club-1');
      httpMock.expectOne(`${environment.apiUrl}/clubs/club-1`).flush(makeApiClub({ status: 'paused' }));
      const result = await resultPromise;
      expect(result?.status).toBe('paused');
      expect(service.myClubs().find(c => c.id === 'club-1')?.status).toBe('paused');
    });

    it('cancelClub invalidates clubByIdCache and syncs myClubs', async () => {
      const myClubsPromise = service.loadMyClubs();
      httpMock.expectOne(`${environment.apiUrl}/clubs/my`).flush([makeApiClub({ status: 'active' })]);
      await myClubsPromise;

      const cancelPromise = service.cancelClub('club-1');
      httpMock.expectOne(`${environment.apiUrl}/clubs/club-1/cancel`).flush(makeApiClub({ status: 'cancelled' }));
      await cancelPromise;

      expect(service.myClubs().find(c => c.id === 'club-1')?.status).toBe('cancelled');

      const p2 = service.getClubById('club-1');
      httpMock.expectOne(`${environment.apiUrl}/clubs/club-1`).flush(makeApiClub({ status: 'cancelled' }));
      expect((await p2)?.status).toBe('cancelled');
    });

    it('rescheduleMeeting invalidates clubByIdCache and syncs myClubs', async () => {
      const p1 = service.getClubById('club-1');
      httpMock.expectOne(`${environment.apiUrl}/clubs/club-1`).flush(makeApiClub({ nextMeetingDate: '2024-01-01T00:00:00Z' }));
      await p1;

      const myClubsPromise = service.loadMyClubs();
      httpMock.expectOne(`${environment.apiUrl}/clubs/my`).flush([makeApiClub({ nextMeetingDate: '2024-01-01T00:00:00Z' })]);
      await myClubsPromise;

      const newDate = '2024-06-01T00:00:00Z';
      const reschedulePromise = service.rescheduleMeeting('club-1', newDate);
      httpMock.expectOne(`${environment.apiUrl}/clubs/club-1/reschedule`).flush(makeApiClub({ nextMeetingDate: newDate }));
      await reschedulePromise;

      const p2 = service.getClubById('club-1');
      httpMock.expectOne(`${environment.apiUrl}/clubs/club-1`).flush(makeApiClub({ nextMeetingDate: newDate }));
      expect((await p2)?.nextMeetingDate).toBe(newDate);
      expect(service.myClubs().find(c => c.id === 'club-1')?.nextMeetingDate).toBe(newDate);
    });
  });

  it('joinClub posts and returns the join-request status', async () => {
    const promise = service.joinClub('club-1');
    const req = httpMock.expectOne(`${environment.apiUrl}/clubs/club-1/join`);
    expect(req.request.method).toBe('POST');
    req.flush({ status: 'pending' });
    expect(await promise).toBe('pending');
  });

  it('getMyMembership fetches membership state', async () => {
    const promise = service.getMyMembership('club-1');
    const req = httpMock.expectOne(`${environment.apiUrl}/clubs/club-1/my-membership`);
    expect(req.request.method).toBe('GET');
    req.flush({ isMember: false, role: null, joinRequestStatus: 'pending' });
    expect(await promise).toEqual({ isMember: false, role: null, joinRequestStatus: 'pending' });
  });

  it('getJoinRequests fetches pending requests', async () => {
    const rows = [
      { userId: 'u9', displayName: 'A', avatarUrl: null, status: 'pending', source: 'manual', createdAt: '2026-01-01' },
    ];
    const promise = service.getJoinRequests('club-1');
    const req = httpMock.expectOne(`${environment.apiUrl}/clubs/club-1/join-requests`);
    expect(req.request.method).toBe('GET');
    req.flush(rows);
    expect(await promise).toEqual(rows);
  });

  it('approveJoinRequest posts approve and bumps member count', async () => {
    const loadP = service.loadPublicClubs();
    httpMock.expectOne(`${environment.apiUrl}/clubs`).flush([makeApiClub({ id: 'club-1', memberCount: 1 })]);
    await loadP;

    const promise = service.approveJoinRequest('club-1', 'u9');
    const req = httpMock.expectOne(`${environment.apiUrl}/clubs/club-1/join-requests/u9/approve`);
    expect(req.request.method).toBe('POST');
    req.flush({ memberCount: 2 });
    await promise;
    expect(service.clubs().find(c => c.id === 'club-1')?.memberCount).toBe(2);
  });

  it('rejectJoinRequest posts reject', async () => {
    const promise = service.rejectJoinRequest('club-1', 'u9');
    const req = httpMock.expectOne(`${environment.apiUrl}/clubs/club-1/join-requests/u9/reject`);
    expect(req.request.method).toBe('POST');
    req.flush(null);
    await promise;
  });

  it('availableCities dedupes city names case-insensitively and trimmed', async () => {
    const loadP = service.loadPublicClubs();
    httpMock.expectOne(`${environment.apiUrl}/clubs`).flush([
      makeApiClub({ id: 'a', city: 'Kyiv' }),
      makeApiClub({ id: 'b', city: 'kyiv ' }),
      makeApiClub({ id: 'c', city: 'Львів' }),
    ]);
    await loadP;
    const cities = service.availableCities();
    expect(cities).toHaveLength(2);
    expect(cities).toContain('Kyiv');
    expect(cities).toContain('Львів');
    expect(cities).not.toContain('kyiv ');
  });

  it('createClub sends POST and returns mapped club', async () => {
    const apiClub = {
      id: 'new-club',
      name: 'Test',
      description: 'Desc',
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
      status: 'active',
      tags: ['tag1', 'tag2'],
      meetingDurationMinutes: 60,
      afterMeetingVenue: { name: 'Cafe', address: 'Main St', description: 'desc' },
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
    expect(club.afterMeetingVenue).toEqual(expect.objectContaining({ name: 'Cafe' }));
  });

  it('getClubStats returns stats from API', async () => {
    const mockStats = {
      topActive: [], topWinners: [], recentAttendance: [],
      totalMembers: 5, totalEvents: 3, totalMessages: 12,
      memberGrowth: [], eventFrequency: [], bannedUsersCount: 0, upcomingEventsCount: 1,
    };
    const promise = service.getClubStats('club-1');
    const req = httpMock.expectOne(`${environment.apiUrl}/clubs/club-1/stats`);
    expect(req.request.method).toBe('GET');
    req.flush(mockStats);
    const stats = await promise;
    expect(stats.totalMembers).toBe(5);
    expect(stats.totalEvents).toBe(3);
  });
});
