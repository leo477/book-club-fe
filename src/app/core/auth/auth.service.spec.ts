import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { TokenStore } from './token.store';
import { environment } from '../../../environments/environment';

const API = environment.apiUrl;

function setSessionCookie(): void {
  document.cookie = 'bc_session=1; path=/';
}

function clearSessionCookie(): void {
  document.cookie = 'bc_session=; Max-Age=0; path=/';
}

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
  let tokenStoreSpy: {
    snapshot: ReturnType<typeof vi.fn>;
    set: ReturnType<typeof vi.fn>;
    clear: ReturnType<typeof vi.fn>;
    token: ReturnType<typeof vi.fn>;
    refreshToken: ReturnType<typeof vi.fn>;
    setRefreshToken: ReturnType<typeof vi.fn>;
    clearRefreshToken: ReturnType<typeof vi.fn>;
  };
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
      refreshToken: vi.fn().mockReturnValue(null),
      setRefreshToken: vi.fn(),
      clearRefreshToken: vi.fn(),
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

  describe('init() — no token, no session cookie/legacy marker', () => {
    beforeEach(() => {
      clearSessionCookie();
      localStorage.removeItem('bc_has_session');
      setupTestbed();
    });

    it('skips refresh and sets isLoading false when no session signal is present', async () => {
      const { service } = buildService();
      await service.init();
      httpMock.expectNone(`${API}/auth/refresh`);
      expect(service.isAuthenticated()).toBe(false);
      expect(service.isLoading()).toBe(false);
    });
  });

  describe('init() — no token (silent refresh via bc_session cookie)', () => {
    beforeEach(() => {
      setSessionCookie();
      setupTestbed();
    });

    afterEach(() => {
      clearSessionCookie();
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

    it('refresh 401 → not authenticated, no crash', async () => {
      const { service } = buildService();
      const p = service.init();
      httpMock.expectOne(`${API}/auth/refresh`).flush({}, { status: 401, statusText: 'Unauthorized' });
      await p;
      expect(service.isAuthenticated()).toBe(false);
    });
  });

  describe('init() — legacy migration (bc_refresh_token / bc_has_session present, no cookie)', () => {
    beforeEach(() => {
      clearSessionCookie();
      localStorage.setItem('bc_has_session', '1');
      setupTestbed();
    });

    afterEach(() => {
      localStorage.removeItem('bc_has_session');
    });

    it('attempts restoreSession and clears legacy keys regardless of outcome', async () => {
      tokenStoreSpy.refreshToken.mockReturnValue('legacy-refresh');
      const { service } = buildService();
      const p = service.init();
      const req = httpMock.expectOne(`${API}/auth/refresh`);
      expect(req.request.body).toEqual({ refreshToken: 'legacy-refresh' });
      req.flush({}, { status: 401, statusText: 'Unauthorized' });
      await p;
      expect(tokenStoreSpy.clearRefreshToken).toHaveBeenCalled();
      expect(localStorage.getItem('bc_has_session')).toBeNull();
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
      expect(req.request.withCredentials).toBe(true);
      req.flush({ accessToken: 'new-token', refreshToken: 'refresh-token', user: rawProfile });
      const result = await p;
      expect(result.error).toBeNull();
      expect(tokenStoreSpy.set).toHaveBeenCalledWith('new-token');
      expect(service.currentUser()?.id).toBe('u1');
    });

    it('does not persist a refresh token or legacy marker (backend cookies handle the session)', async () => {
      const { service } = buildService();
      const p = service.signIn('test@test.com', 'password');
      httpMock.expectOne(`${API}/auth/login`).flush({ accessToken: 'tok', refreshToken: 'ref', user: rawProfile });
      await p;
      expect(tokenStoreSpy.setRefreshToken).not.toHaveBeenCalled();
      expect(localStorage.getItem('bc_has_session')).toBeNull();
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
      expect(req.request.withCredentials).toBe(true);
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

    it('does not persist a refresh token or legacy marker (backend cookies handle the session)', async () => {
      const { service } = buildService();
      const p = service.signUp('test@test.com', 'password', 'Name', 'user');
      httpMock.expectOne(`${API}/auth/register`).flush({ accessToken: 'tok', refreshToken: 'ref', user: rawProfile });
      await p;
      expect(tokenStoreSpy.setRefreshToken).not.toHaveBeenCalled();
      expect(localStorage.getItem('bc_has_session')).toBeNull();
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
      const req = httpMock.expectOne(`${API}/auth/logout`);
      expect(req.request.withCredentials).toBe(true);
      req.flush({});
      await p;
      expect(tokenStoreSpy.clear).toHaveBeenCalled();
      expect(service.currentUser()).toBeNull();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('clears the bc_session cookie on signOut', async () => {
      setSessionCookie();
      const { service } = buildService();
      const p = service.signOut();
      httpMock.expectOne(`${API}/auth/logout`).flush({});
      await p;
      expect(document.cookie.includes('bc_session=1')).toBe(false);
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

  describe('loginWithGoogle', () => {
    beforeEach(() => { setupTestbed(); });

    it('sets window.location.href to the Google OAuth endpoint', () => {
      const { service } = buildService();
      const original = window.location.href;
      Object.defineProperty(window, 'location', {
        value: { ...window.location, href: original },
        writable: true,
        configurable: true,
      });
      service.loginWithGoogle();
      expect((window.location as { href: string }).href).toBe(
        `${environment.oauthBaseUrl}/auth/oauth/google?origin=${encodeURIComponent(window.location.origin)}`,
      );
    });
  });

  describe('exchangeOAuthCode', () => {
    beforeEach(() => {
      localStorage.removeItem('bc_has_session');
      setupTestbed();
    });

    afterEach(() => {
      localStorage.removeItem('bc_has_session');
    });

    it('stores the access token (no legacy localStorage persistence) and loads user on success', async () => {
      const { service } = buildService();
      const p = service.exchangeOAuthCode('handoff');
      const req = httpMock.expectOne(`${API}/auth/oauth/exchange`);
      expect(req.request.body).toEqual({ code: 'handoff' });
      req.flush({ accessToken: 'acc', refreshToken: 'ref' });
      await Promise.resolve();
      httpMock.expectOne(`${API}/auth/me`).flush(rawProfile);
      const result = await p;
      expect(result).toEqual({ error: null });
      expect(tokenStoreSpy.set).toHaveBeenCalledWith('acc');
      expect(tokenStoreSpy.setRefreshToken).not.toHaveBeenCalled();
      expect(localStorage.getItem('bc_has_session')).toBeNull();
      expect(service.currentUser()?.id).toBe('u1');
    });

    it('returns OAUTH_FAILED when exchange rejects', async () => {
      const { service } = buildService();
      const p = service.exchangeOAuthCode('bad');
      httpMock.expectOne(`${API}/auth/oauth/exchange`).flush(
        { detail: { code: 'INVALID_OAUTH_CODE' } },
        { status: 400, statusText: 'Bad Request' },
      );
      const result = await p;
      expect(result).toEqual({ error: 'OAUTH_FAILED' });
    });
  });

  describe('getWsTicket$', () => {
    beforeEach(() => { setupTestbed('valid-token'); });

    it('posts to /auth/ws-ticket and returns the ticket string', async () => {
      const { service } = buildService();
      const p = firstValueFrom(service.getWsTicket$());
      const req = httpMock.expectOne(`${API}/auth/ws-ticket`);
      expect(req.request.method).toBe('POST');
      req.flush({ ticket: 'one-time-ticket' });
      await expect(p).resolves.toBe('one-time-ticket');
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
