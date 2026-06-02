import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { TokenStore } from './token.store';
import { environment } from '../../../environments/environment';

const API = environment.apiUrl;

const rawProfile = {
  id: 'u1',
  email: 'test@test.com',
  role: 'user' as const,
  displayName: 'Test User',
  avatarUrl: null,
  createdAt: '2024-01-01',
};

function buildService() {
  const service = TestBed.inject(AuthService);
  const httpMock = TestBed.inject(HttpTestingController);
  return { service, httpMock };
}

describe('AuthService', () => {
  let routerSpy: { navigate: ReturnType<typeof vi.fn> };
  let tokenStoreSpy: { snapshot: ReturnType<typeof vi.fn>; set: ReturnType<typeof vi.fn>; clear: ReturnType<typeof vi.fn>; token: ReturnType<typeof vi.fn> };
  let httpMock: HttpTestingController;

  afterEach(() => {
    httpMock?.verify();
  });

  function setupTestbed(tokenValue: string | null = null) {
    routerSpy = { navigate: vi.fn() };
    tokenStoreSpy = {
      token: vi.fn().mockReturnValue(tokenValue),
      snapshot: vi.fn().mockReturnValue(tokenValue),
      set: vi.fn(),
      clear: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        AuthService,
        { provide: Router, useValue: routerSpy },
        { provide: TokenStore, useValue: tokenStoreSpy },
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);
  }

  describe('init() — no token (silent refresh)', () => {
    beforeEach(() => {
      // Set session marker so AuthService.init() attempts the refresh call
      localStorage.setItem('bc_has_session', '1');
      setupTestbed();
    });

    afterEach(() => {
      localStorage.removeItem('bc_has_session');
    });

    it('isLoading is true before init()', () => {
      const { service } = buildService();
      expect(service.isLoading()).toBe(true);
    });

    it('isOrganizer returns false when not logged in', async () => {
      const { service } = buildService();
      const p = service.init();
      httpMock.expectOne(`${API}/auth/refresh`).flush({}, { status: 401, statusText: 'Unauthorized' });
      await p;
      expect(service.isOrganizer()).toBe(false);
    });

    it('userRole returns null when not authenticated', async () => {
      const { service } = buildService();
      const p = service.init();
      httpMock.expectOne(`${API}/auth/refresh`).flush({}, { status: 401, statusText: 'Unauthorized' });
      await p;
      expect(service.userRole()).toBeNull();
    });

    it('refresh success → token set + /auth/me called + isLoading false', async () => {
      const { service } = buildService();
      const p = service.init();
      httpMock.expectOne(`${API}/auth/refresh`).flush({ accessToken: 'refreshed-token' });
      await Promise.resolve(); // flush microtask so firstValueFrom continuation runs before /auth/me is expected
      httpMock.expectOne(`${API}/auth/me`).flush(rawProfile);
      await p;
      expect(tokenStoreSpy.set).toHaveBeenCalledWith('refreshed-token');
      expect(service.currentUser()?.id).toBe('u1');
      expect(service.isLoading()).toBe(false);
    });

    it('refresh 401 → not authenticated + isLoading false', async () => {
      const { service } = buildService();
      const p = service.init();
      httpMock.expectOne(`${API}/auth/refresh`).flush({}, { status: 401, statusText: 'Unauthorized' });
      await p;
      expect(service.isAuthenticated()).toBe(false);
      expect(service.isLoading()).toBe(false);
    });
  });

  describe('init() — existing token in memory', () => {
    beforeEach(() => { setupTestbed('valid-token'); });

    it('isLoading is true before init()', () => {
      const { service } = buildService();
      expect(service.isLoading()).toBe(true);
    });

    it('sets current user after /auth/me responds', async () => {
      const { service } = buildService();
      const p = service.init();
      httpMock.expectOne(`${API}/auth/me`).flush(rawProfile);
      await p;
      expect(service.currentUser()?.id).toBe('u1');
      expect(service.isLoading()).toBe(false);
      expect(service.isAuthenticated()).toBe(true);
    });

    it('clears token and sets user null when /auth/me fails', async () => {
      const { service } = buildService();
      const p = service.init();
      httpMock.expectOne(`${API}/auth/me`).flush({}, { status: 401, statusText: 'Unauthorized' });
      await p;
      expect(tokenStoreSpy.clear).toHaveBeenCalled();
      expect(service.currentUser()).toBeNull();
      expect(service.isLoading()).toBe(false);
    });
  });

  describe('signIn', () => {
    beforeEach(() => { setupTestbed(); });

    it('sets token and user on success', async () => {
      const { service } = buildService();
      const p = service.signIn('test@test.com', 'password');
      const req = httpMock.expectOne(`${API}/auth/login`);
      req.flush({ accessToken: 'new-token', refreshToken: 'refresh-token', user: rawProfile });
      const result = await p;
      expect(result.error).toBeNull();
      expect(tokenStoreSpy.set).toHaveBeenCalledWith('new-token');
      expect(service.currentUser()?.id).toBe('u1');
    });

    it('returns error on failure with detail format', async () => {
      const { service } = buildService();
      const p = service.signIn('bad@test.com', 'wrong');
      httpMock.expectOne(`${API}/auth/login`).flush(
        { detail: 'Invalid credentials' },
        { status: 401, statusText: 'Unauthorized' },
      );
      const result = await p;
      expect(result.error).toBe('Invalid credentials');
    });

    it('returns error on failure with Book Club error format', async () => {
      const { service } = buildService();
      const p = service.signIn('bad@test.com', 'wrong');
      httpMock.expectOne(`${API}/auth/login`).flush(
        { error: 'Invalid credentials', code: 'INVALID_CREDENTIALS' },
        { status: 401, statusText: 'Unauthorized' },
      );
      const result = await p;
      expect(result.error).toBe('Invalid credentials');
    });
  });

  describe('signUp', () => {
    beforeEach(() => { setupTestbed(); });

    it('sets token and user on success', async () => {
      const { service } = buildService();
      const p = service.signUp('test@test.com', 'password', 'Test User', 'user');
      const req = httpMock.expectOne(`${API}/auth/register`);
      expect(req.request.body).toEqual({
        email: 'test@test.com',
        password: 'password',
        displayName: 'Test User',
        role: 'user',
      });
      req.flush({ accessToken: 'new-token', refreshToken: 'refresh-token', user: rawProfile });
      const result = await p;
      expect(result.error).toBeNull();
      expect(tokenStoreSpy.set).toHaveBeenCalledWith('new-token');
    });

    it('returns error on failure', async () => {
      const { service } = buildService();
      const p = service.signUp('test@test.com', 'password', 'Name', 'user');
      httpMock.expectOne(`${API}/auth/register`).flush(
        { detail: 'Email already taken' },
        { status: 409, statusText: 'Conflict' },
      );
      const result = await p;
      expect(result.error).toBe('Email already taken');
    });
  });

  describe('signOut', () => {
    beforeEach(() => { setupTestbed(); });

    it('clears token and navigates to /login', async () => {
      const { service } = buildService();
      const p = service.signOut();
      httpMock.expectOne(`${API}/auth/logout`).flush({});
      await p;
      expect(tokenStoreSpy.clear).toHaveBeenCalled();
      expect(service.currentUser()).toBeNull();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('still clears token even if logout request fails', async () => {
      const { service } = buildService();
      const p = service.signOut();
      httpMock.expectOne(`${API}/auth/logout`).flush({}, { status: 500, statusText: 'Error' });
      await p;
      expect(tokenStoreSpy.clear).toHaveBeenCalled();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('updateRole', () => {
    beforeEach(async () => {
      setupTestbed();

      // Sign in first to set currentUser
      const { service } = buildService();
      const p = service.signIn('test@test.com', 'password');
      httpMock.expectOne(`${API}/auth/login`).flush({ accessToken: 'token', refreshToken: 'refresh', user: rawProfile });
      await p;
    });

    it('updates role in currentUser', async () => {
      const { service } = buildService();
      const p = service.updateRole('organizer');
      httpMock.expectOne(`${API}/users/me/role`).flush(rawProfile);
      await p;
      expect(service.currentUser()?.role).toBe('organizer');
    });

    it('does nothing when user is not logged in', async () => {
      const { service } = buildService();
      // Manually clear user (simulate signed out state)
      (service as unknown as { _currentUser: { set: (v: null) => void } })._currentUser.set(null);
      await service.updateRole('organizer');
      httpMock.expectNone(`${API}/users/me/role`);
      expect(service.currentUser()).toBeNull();
    });
  });

  describe('updateDisplayName', () => {
    beforeEach(async () => { setupTestbed(); });

    it('updates displayName in currentUser', async () => {
      const { service } = buildService();
      const loginP = service.signIn('test@test.com', 'password');
      httpMock.expectOne(`${API}/auth/login`).flush({ accessToken: 'token', refreshToken: 'refresh', user: rawProfile });
      await loginP;

      const p = service.updateDisplayName('New Name');
      httpMock.expectOne(`${API}/users/me`).flush(rawProfile);
      await p;
      expect(service.currentUser()?.displayName).toBe('New Name');
    });

    it('does nothing when user is null', async () => {
      const { service } = buildService();
      await service.updateDisplayName('Name');
      httpMock.expectNone(`${API}/users/me`);
      expect(service.currentUser()).toBeNull();
    });
  });

  describe('updateSocials', () => {
    beforeEach(() => { setupTestbed(); });

    it('updates socials in currentUser', async () => {
      const { service } = buildService();
      const loginP = service.signIn('test@test.com', 'password');
      httpMock.expectOne(`${API}/auth/login`).flush({ accessToken: 'token', refreshToken: 'refresh', user: rawProfile });
      await loginP;

      const p = service.updateSocials({ github: 'myuser' });
      httpMock.expectOne(`${API}/users/me/socials`).flush(rawProfile);
      await p;
      expect(service.currentUser()?.socials?.github).toBe('myuser');
    });

    it('does nothing when user is null', async () => {
      const { service } = buildService();
      await service.updateSocials({ github: 'test' });
      httpMock.expectNone(`${API}/users/me/socials`);
      expect(service.currentUser()).toBeNull();
    });
  });

  describe('setSocialsPublic', () => {
    beforeEach(() => { setupTestbed(); });

    it('updates socialsPublic in currentUser', async () => {
      const { service } = buildService();
      const loginP = service.signIn('test@test.com', 'password');
      httpMock.expectOne(`${API}/auth/login`).flush({ accessToken: 'token', refreshToken: 'refresh', user: rawProfile });
      await loginP;

      const p = service.setSocialsPublic(true);
      httpMock.expectOne(`${API}/users/me/socials-visibility`).flush(rawProfile);
      await p;
      expect(service.currentUser()?.socialsPublic).toBe(true);
    });

    it('does nothing when user is null', async () => {
      const { service } = buildService();
      await service.setSocialsPublic(true);
      httpMock.expectNone(`${API}/users/me/socials-visibility`);
      expect(service.currentUser()).toBeNull();
    });
  });

  describe('userStats', () => {
    beforeEach(() => { setupTestbed(); });

    it('returns null when no user is logged in', () => {
      const { service } = buildService();
      expect(service.userStats()).toBeNull();
    });

    it('fetches and maps stats after sign-in', async () => {
      const { service } = buildService();
      const loginP = service.signIn('test@test.com', 'password');
      httpMock.expectOne(`${API}/auth/login`).flush({
        accessToken: 'token', refreshToken: 'refresh', user: rawProfile,
      });
      await loginP;

      TestBed.flushEffects();
      httpMock.expectOne(`${API}/users/me/stats`).flush({
        clubsJoined: 3, quizzesTaken: 5, quizWins: 2, likesReceived: 10, booksRead: 7,
      });
      await Promise.resolve();

      expect(service.userStats()).toEqual({
        clubsJoined: 3, quizzesTaken: 5, quizWins: 2, likesReceived: 10, booksRead: 7,
      });
    });

    it('returns null when stats request fails', async () => {
      const { service } = buildService();
      const loginP = service.signIn('test@test.com', 'password');
      httpMock.expectOne(`${API}/auth/login`).flush({
        accessToken: 'token', refreshToken: 'refresh', user: rawProfile,
      });
      await loginP;

      TestBed.flushEffects();
      httpMock.expectOne(`${API}/users/me/stats`).flush(
        {}, { status: 500, statusText: 'Server Error' },
      );
      await Promise.resolve();

      expect(service.userStats()).toBeNull();
    });
  });
});
