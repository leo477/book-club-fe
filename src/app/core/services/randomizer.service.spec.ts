import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { RandomizerService } from './randomizer.service';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../../environments/environment';

const API = environment.apiUrl;

const rawMember = (id: string, name: string) => ({
  userId: id,
  displayName: name,
  avatarUrl: null,
  role: 'member' as const,
});

const rawSession = {
  id: 's1',
  clubId: 'c1',
  createdBy: 'u1',
  purpose: 'Who presents?',
  candidates: [rawMember('u1', 'Alice'), rawMember('u2', 'Bob')],
  result: rawMember('u1', 'Alice'),
  createdAt: '2024-01-01',
};

describe('RandomizerService', () => {
  let service: RandomizerService;
  let httpMock: HttpTestingController;
  let authSpy: { currentUser: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    authSpy = {
      currentUser: vi.fn().mockReturnValue({ id: 'u1', displayName: 'Alice', role: 'organizer' }),
    };
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        RandomizerService,
        { provide: AuthService, useValue: authSpy },
      ],
    });
    service = TestBed.inject(RandomizerService);
    httpMock = TestBed.inject(HttpTestingController);
    vi.useFakeTimers();
  });

  afterEach(() => {
    httpMock.verify();
    vi.useRealTimers();
  });

  it('starts with default state', () => {
    expect(service.candidates()).toEqual([]);
    expect(service.result()).toBeNull();
    expect(service.isSpinning()).toBe(false);
    expect(service.history()).toEqual([]);
    expect(service.purpose()).toBe('');
  });

  describe('setPurpose', () => {
    it('updates purpose signal', () => {
      service.setPurpose('Who reads next?');
      expect(service.purpose()).toBe('Who reads next?');
    });
  });

  describe('loadClubMembers', () => {
    it('loads members and selects all by default', async () => {
      const p = service.loadClubMembers('c1');
      httpMock.expectOne(`${API}/clubs/c1/members`).flush([rawMember('u1', 'Alice'), rawMember('u2', 'Bob')]);
      await p;
      expect(service.candidates().length).toBe(2);
      expect(service.selectedIds().has('u1')).toBe(true);
      expect(service.selectedIds().has('u2')).toBe(true);
      expect(service.result()).toBeNull();
    });
  });

  describe('toggleMember', () => {
    beforeEach(async () => {
      const p = service.loadClubMembers('c1');
      httpMock.expectOne(`${API}/clubs/c1/members`).flush([rawMember('u1', 'Alice'), rawMember('u2', 'Bob')]);
      await p;
    });

    it('deselects a selected member', () => {
      service.toggleMember('u1');
      expect(service.selectedIds().has('u1')).toBe(false);
      expect(service.selectedIds().has('u2')).toBe(true);
    });

    it('re-selects a deselected member', () => {
      service.toggleMember('u1');
      service.toggleMember('u1');
      expect(service.selectedIds().has('u1')).toBe(true);
    });
  });

  describe('spin', () => {
    beforeEach(async () => {
      const p = service.loadClubMembers('c1');
      httpMock.expectOne(`${API}/clubs/c1/members`).flush([rawMember('u1', 'Alice'), rawMember('u2', 'Bob')]);
      await p;
    });

    it('throws when fewer than 2 members selected', async () => {
      service.toggleMember('u1');
      service.toggleMember('u2');
      await expect(service.spin()).rejects.toThrow('RANDOMIZER.error_min');
    });

    it('sets isSpinning during animation and picks a result', async () => {
      const spinPromise = service.spin();
      expect(service.isSpinning()).toBe(true);
      expect(service.result()).toBeNull();
      vi.advanceTimersByTime(2001);
      await spinPromise;
      expect(service.isSpinning()).toBe(false);
      expect(service.result()).not.toBeNull();
      const result = service.result();
      expect(result).not.toBeNull();
      expect(['u1', 'u2']).toContain(result?.userId ?? '');
    });

    it('only picks from selected members', async () => {
      service.toggleMember('u2');
      // Only u1 selected — needs 2, so this should throw
      await expect(service.spin()).rejects.toThrow('RANDOMIZER.error_min');
    });
  });

  describe('reset', () => {
    it('reselects all candidates and clears result', async () => {
      const p = service.loadClubMembers('c1');
      httpMock.expectOne(`${API}/clubs/c1/members`).flush([rawMember('u1', 'Alice'), rawMember('u2', 'Bob')]);
      await p;

      const spinP = service.spin();
      vi.advanceTimersByTime(2001);
      await spinP;

      service.toggleMember('u1');
      service.reset();
      expect(service.selectedIds().has('u1')).toBe(true);
      expect(service.selectedIds().has('u2')).toBe(true);
      expect(service.result()).toBeNull();
    });
  });

  describe('saveSession', () => {
    beforeEach(async () => {
      const p = service.loadClubMembers('c1');
      httpMock.expectOne(`${API}/clubs/c1/members`).flush([rawMember('u1', 'Alice'), rawMember('u2', 'Bob')]);
      await p;
      const spinP = service.spin();
      vi.advanceTimersByTime(2001);
      await spinP;
    });

    it('sends POST and adds session to history', async () => {
      const p = service.saveSession('c1');
      const req = httpMock.expectOne(`${API}/clubs/c1/randomizer/sessions`);
      expect(req.request.method).toBe('POST');
      req.flush(rawSession);
      await p;
      expect(service.history().length).toBe(1);
      expect(service.history()[0].id).toBe('s1');
    });

    it('throws when no result to save', async () => {
      service.reset();
      await expect(service.saveSession('c1')).rejects.toThrow('RANDOMIZER.no_result_error');
    });
  });

  describe('saveSession without auth', () => {
    it('throws when not authenticated', async () => {
      authSpy = {
        currentUser: vi.fn().mockReturnValue(null),
      };
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          provideZonelessChangeDetection(),
          provideHttpClient(),
          provideHttpClientTesting(),
          RandomizerService,
          { provide: AuthService, useValue: authSpy },
        ],
      });
      const unauthService = TestBed.inject(RandomizerService);
      await expect(unauthService.saveSession('c1')).rejects.toThrow('RANDOMIZER.not_authenticated_error');
    });
  });

  describe('loadHistory', () => {
    it('loads and maps history sessions', async () => {
      const p = service.loadHistory('c1');
      httpMock.expectOne(`${API}/clubs/c1/randomizer/history`).flush([rawSession]);
      await p;
      expect(service.history().length).toBe(1);
      expect(service.history()[0].clubId).toBe('c1');
      expect(service.history()[0].result?.displayName).toBe('Alice');
    });
  });
});
