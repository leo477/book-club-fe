import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ClubService } from './club.service';
import { AuthService } from '../auth/auth.service';
import { Club } from '../models/club.model';
import { environment } from '../../../environments/environment';

const API = environment.apiUrl;

function makeApiClub(overrides: Record<string, unknown> = {}) {
  return {
    id: 'c1', name: 'Alpha', description: 'Desc', coverUrl: null,
    organizerId: 'user-1', isPublic: true, memberCount: 5,
    createdAt: '2024-01-01', city: 'Kyiv',
    nextMeetingDate: '2025-06-01', address: null, lat: null, lng: null,
    theme: null, currentBook: null, memberPreviews: [],
    status: 'active', tags: [], meetingDurationMinutes: null,
    afterMeetingVenue: null, ...overrides,
  };
}

describe('ClubService – computed signals and additional methods', () => {
  let service: ClubService;
  let authSpy: jasmine.SpyObj<AuthService>;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    authSpy = jasmine.createSpyObj('AuthService', [], {
      currentUser: jasmine.createSpy().and.returnValue({ id: 'user-1', displayName: 'Test', role: 'organizer' }),
    });
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        provideZonelessChangeDetection(),
        ClubService,
        { provide: AuthService, useValue: authSpy },
      ],
    });
    service = TestBed.inject(ClubService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => { httpMock.verify(); });

  describe('loadPublicClubs', () => {
    it('populates clubs signal', async () => {
      const p = service.loadPublicClubs();
      httpMock.expectOne(`${API}/clubs`).flush([makeApiClub()]);
      await p;
      expect(service.clubs().length).toBe(1);
      expect(service.isLoading()).toBeFalse();
    });

    it('sets error on failure', async () => {
      const p = service.loadPublicClubs();
      httpMock.expectOne(`${API}/clubs`).flush({}, { status: 500, statusText: 'Error' });
      await p;
      expect(service.error()).toBe('Failed to load clubs');
    });
  });

  describe('loadMyClubs', () => {
    it('populates myClubs signal', async () => {
      const p = service.loadMyClubs();
      httpMock.expectOne(`${API}/clubs/my`).flush([makeApiClub({ id: 'c2', organizerId: 'user-1' })]);
      await p;
      expect(service.myClubs().length).toBe(1);
    });

    it('sets error on failure', async () => {
      const p = service.loadMyClubs();
      httpMock.expectOne(`${API}/clubs/my`).flush({}, { status: 500, statusText: 'Error' });
      await p;
      expect(service.error()).toBe('Failed to load my clubs');
    });
  });

  describe('getClubById', () => {
    it('returns mapped club on success', async () => {
      const p = service.getClubById('c1');
      httpMock.expectOne(`${API}/clubs/c1`).flush(makeApiClub());
      const club = await p;
      expect(club?.id).toBe('c1');
    });

    it('returns null on error', async () => {
      const p = service.getClubById('c1');
      httpMock.expectOne(`${API}/clubs/c1`).flush({}, { status: 404, statusText: 'Not Found' });
      const club = await p;
      expect(club).toBeNull();
    });
  });

  describe('setSearchQuery / filteredClubs', () => {
    beforeEach(async () => {
      const p = service.loadPublicClubs();
      httpMock.expectOne(`${API}/clubs`).flush([
        makeApiClub({ id: 'c1', name: 'Alpha Club', city: 'Kyiv' }),
        makeApiClub({ id: 'c2', name: 'Beta Club', city: 'Lviv' }),
        makeApiClub({ id: 'c3', name: 'Gamma', description: 'alpha themed', city: 'Kyiv' }),
      ]);
      await p;
    });

    it('filters by name query', () => {
      service.setSearchQuery('alpha');
      expect(service.filteredClubs().map(c => c.id)).toContain('c1');
      expect(service.filteredClubs().map(c => c.id)).toContain('c3');
      expect(service.filteredClubs().map(c => c.id)).not.toContain('c2');
    });

    it('filters by description query', () => {
      service.setSearchQuery('alpha themed');
      expect(service.filteredClubs().some(c => c.id === 'c3')).toBeTrue();
    });

    it('returns all clubs when query is empty', () => {
      service.setSearchQuery('');
      expect(service.filteredClubs().length).toBe(3);
    });
  });

  describe('setCityFilter / availableCities / upcomingByCity', () => {
    beforeEach(async () => {
      const p = service.loadPublicClubs();
      httpMock.expectOne(`${API}/clubs`).flush([
        makeApiClub({ id: 'c1', city: 'Kyiv', nextMeetingDate: '2025-06-01' }),
        makeApiClub({ id: 'c2', city: 'Lviv', nextMeetingDate: '2025-07-01' }),
        makeApiClub({ id: 'c3', city: 'Kyiv', nextMeetingDate: null }),
      ]);
      await p;
    });

    it('availableCities returns sorted unique cities', () => {
      const cities = service.availableCities();
      expect(cities).toContain('Kyiv');
      expect(cities).toContain('Lviv');
      expect(cities.indexOf('Kyiv')).toBeLessThan(cities.indexOf('Lviv'));
    });

    it('setCityFilter filters clubs by city', () => {
      service.setCityFilter('Lviv');
      expect(service.filteredClubs().every(c => c.city === 'Lviv')).toBeTrue();
    });

    it('setCityFilter(null) removes filter', () => {
      service.setCityFilter('Kyiv');
      service.setCityFilter(null);
      expect(service.filteredClubs().length).toBe(3);
    });

    it('upcomingByCity groups clubs with meetings by city', () => {
      const byCity = service.upcomingByCity();
      expect(byCity['Kyiv']).toBeDefined();
      expect(byCity['Kyiv'].length).toBe(1); // c3 has null nextMeetingDate
      expect(byCity['Lviv']).toBeDefined();
    });

    it('upcomingByCity filters by city when cityFilter set', () => {
      service.setCityFilter('Lviv');
      const byCity = service.upcomingByCity();
      expect(byCity['Kyiv']).toBeUndefined();
      expect(byCity['Lviv']).toBeDefined();
    });
  });

  describe('myOwnedClubs / myOwnedClubIds / myClubIds', () => {
    beforeEach(async () => {
      const p = service.loadPublicClubs();
      httpMock.expectOne(`${API}/clubs`).flush([
        makeApiClub({ id: 'c1', organizerId: 'user-1' }),
        makeApiClub({ id: 'c2', organizerId: 'user-2' }),
      ]);
      await p;
    });

    it('myOwnedClubs returns clubs owned by current user', () => {
      expect(service.myOwnedClubs().length).toBe(1);
      expect(service.myOwnedClubs()[0].id).toBe('c1');
    });

    it('myOwnedClubIds returns set of owned club ids', () => {
      expect(service.myOwnedClubIds().has('c1')).toBeTrue();
      expect(service.myOwnedClubIds().has('c2')).toBeFalse();
    });

    it('myClubIds reflects myClubs', async () => {
      const p = service.loadMyClubs();
      httpMock.expectOne(`${API}/clubs/my`).flush([makeApiClub({ id: 'c1' })]);
      await p;
      expect(service.myClubIds().has('c1')).toBeTrue();
    });
  });

  describe('leaveClub', () => {
    beforeEach(async () => {
      const p = service.loadPublicClubs();
      httpMock.expectOne(`${API}/clubs`).flush([makeApiClub({ id: 'c1', memberCount: 5 })]);
      await p;
    });

    it('sends DELETE and decrements member count', async () => {
      const p = service.leaveClub('c1');
      const req = httpMock.expectOne(`${API}/clubs/c1/leave`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
      await p;
      expect(service.clubs().find(c => c.id === 'c1')?.memberCount).toBe(4);
    });
  });

  describe('pauseClub / cancelClub / rescheduleMeeting', () => {
    beforeEach(async () => {
      const p = service.loadPublicClubs();
      httpMock.expectOne(`${API}/clubs`).flush([makeApiClub({ id: 'c1', status: 'active' })]);
      await p;
    });

    it('pauseClub sends PATCH and updates club', async () => {
      const p = service.pauseClub('c1');
      const req = httpMock.expectOne(`${API}/clubs/c1/pause`);
      expect(req.request.method).toBe('PATCH');
      req.flush(makeApiClub({ id: 'c1', status: 'paused' }));
      await p;
      expect(service.clubs().find(c => c.id === 'c1')?.status).toBe('paused');
    });

    it('cancelClub sends PATCH and updates club', async () => {
      const p = service.cancelClub('c1');
      httpMock.expectOne(`${API}/clubs/c1/cancel`).flush(makeApiClub({ id: 'c1', status: 'cancelled' }));
      await p;
      expect(service.clubs().find(c => c.id === 'c1')?.status).toBe('cancelled');
    });

    it('rescheduleMeeting sends PATCH with new_date', async () => {
      const p = service.rescheduleMeeting('c1', '2025-08-01');
      const req = httpMock.expectOne(`${API}/clubs/c1/reschedule`);
      expect(req.request.body).toEqual({ newDate: '2025-08-01' });
      req.flush(makeApiClub({ id: 'c1', nextMeetingDate: '2025-08-01' }));
      await p;
    });
  });

  describe('kickMember', () => {
    it('sends DELETE to kick member', async () => {
      const p = service.kickMember('c1', 'u2');
      const req = httpMock.expectOne(`${API}/clubs/c1/members/u2`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
      await p;
    });
  });

  describe('msUntilDeletion', () => {
    const base: Partial<Club> = {
      id: 'c1', name: 'T', description: null, coverUrl: null, organizerId: 'u1',
      isPublic: true, memberCount: 0, createdAt: '', city: '', nextMeetingDate: null,
      address: null, lat: null, lng: null, theme: null, currentBook: null,
      memberPreviews: [], tags: [], meetingDurationMinutes: null, afterMeetingVenue: null,
    };

    it('returns null for active club', () => {
      const club = { ...base, status: 'active' as const };
      expect(service.msUntilDeletion(club as Club)).toBeNull();
    });

    it('returns null when cancelled but no cancelledAt', () => {
      const club = { ...base, status: 'cancelled' as const };
      expect(service.msUntilDeletion(club as Club)).toBeNull();
    });

    it('returns positive ms when cancelled recently', () => {
      const club = {
        ...base, status: 'cancelled' as const,
        cancelledAt: new Date(Date.now() - 1000).toISOString(),
      };
      const ms = service.msUntilDeletion(club as Club);
      expect(ms).not.toBeNull();
      if (ms !== null) expect(ms).toBeGreaterThan(0);
    });

    it('returns null when cancelledAt is too old (>24h)', () => {
      const club = {
        ...base, status: 'cancelled' as const,
        cancelledAt: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
      };
      expect(service.msUntilDeletion(club as Club)).toBeNull();
    });
  });

  describe('myParticipatedClubs / myMissedClubs', () => {
    it('myParticipatedClubs returns empty array', () => {
      expect(service.myParticipatedClubs()).toEqual([]);
    });

    it('myMissedClubs returns empty array', () => {
      expect(service.myMissedClubs()).toEqual([]);
    });
  });
});
