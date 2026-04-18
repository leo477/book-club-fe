import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RandomizerService } from './randomizer.service';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../../environments/environment';

const API = environment.apiUrl;

const rawMember = (id: string, name: string) => ({
  user_id: id,
  display_name: name,
  avatar_url: null,
  role: 'member' as const,
});

const rawSession = {
  id: 's1',
  club_id: 'c1',
  created_by: 'u1',
  purpose: 'Who presents?',
  candidates: [rawMember('u1', 'Alice'), rawMember('u2', 'Bob')],
  result: rawMember('u1', 'Alice'),
  created_at: '2024-01-01',
};

describe('RandomizerService', () => {
  let service: RandomizerService;
  let httpMock: HttpTestingController;
  let authSpy: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    authSpy = jasmine.createSpyObj('AuthService', [], {
      currentUser: jasmine.createSpy().and.returnValue({ id: 'u1', displayName: 'Alice', role: 'organizer' }),
    });
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        provideZonelessChangeDetection(),
        RandomizerService,
        { provide: AuthService, useValue: authSpy },
      ],
    });
    service = TestBed.inject(RandomizerService);
    httpMock = TestBed.inject(HttpTestingController);
    jasmine.clock().install();
  });

  afterEach(() => {
    httpMock.verify();
    jasmine.clock().uninstall();
  });

  it('starts with default state', () => {
    expect(service.candidates()).toEqual([]);
    expect(service.result()).toBeNull();
    expect(service.isSpinning()).toBeFalse();
    expect(service.history()).toEqual([]);
    expect(service.purpose()).toBe('Хто представляє книгу?');
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
      expect(service.selectedIds().has('u1')).toBeTrue();
      expect(service.selectedIds().has('u2')).toBeTrue();
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
      expect(service.selectedIds().has('u1')).toBeFalse();
      expect(service.selectedIds().has('u2')).toBeTrue();
    });

    it('re-selects a deselected member', () => {
      service.toggleMember('u1');
      service.toggleMember('u1');
      expect(service.selectedIds().has('u1')).toBeTrue();
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
      await expectAsync(service.spin()).toBeRejectedWithError('Потрібно мінімум 2 учасники');
    });

    it('sets isSpinning during animation and picks a result', async () => {
      const spinPromise = service.spin();
      expect(service.isSpinning()).toBeTrue();
      expect(service.result()).toBeNull();
      jasmine.clock().tick(2001);
      await spinPromise;
      expect(service.isSpinning()).toBeFalse();
      expect(service.result()).not.toBeNull();
      const result = service.result();
      expect(result).not.toBeNull();
      expect(['u1', 'u2']).toContain(result?.userId ?? '');
    });

    it('only picks from selected members', async () => {
      service.toggleMember('u2');
      // Only u1 selected — needs 2, so this should throw
      await expectAsync(service.spin()).toBeRejectedWithError('Потрібно мінімум 2 учасники');
    });
  });

  describe('reset', () => {
    it('reselects all candidates and clears result', async () => {
      const p = service.loadClubMembers('c1');
      httpMock.expectOne(`${API}/clubs/c1/members`).flush([rawMember('u1', 'Alice'), rawMember('u2', 'Bob')]);
      await p;

      const spinP = service.spin();
      jasmine.clock().tick(2001);
      await spinP;

      service.toggleMember('u1');
      service.reset();
      expect(service.selectedIds().has('u1')).toBeTrue();
      expect(service.selectedIds().has('u2')).toBeTrue();
      expect(service.result()).toBeNull();
    });
  });

  describe('saveSession', () => {
    beforeEach(async () => {
      const p = service.loadClubMembers('c1');
      httpMock.expectOne(`${API}/clubs/c1/members`).flush([rawMember('u1', 'Alice'), rawMember('u2', 'Bob')]);
      await p;
      const spinP = service.spin();
      jasmine.clock().tick(2001);
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
      await expectAsync(service.saveSession('c1')).toBeRejectedWithError('No result to save');
    });
  });

  describe('saveSession without auth', () => {
    it('throws when not authenticated', async () => {
      authSpy = jasmine.createSpyObj('AuthService', [], {
        currentUser: jasmine.createSpy().and.returnValue(null),
      });
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [
          provideZonelessChangeDetection(),
          RandomizerService,
          { provide: AuthService, useValue: authSpy },
        ],
      });
      const unauthService = TestBed.inject(RandomizerService);
      await expectAsync(unauthService.saveSession('c1')).toBeRejectedWithError('Not authenticated');
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
