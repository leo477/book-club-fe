import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { TokenStore } from './token.store';
import { environment } from '../../../environments/environment';

const API = environment.apiUrl;

const rawProfile = {
  id: 'u1',
  email: 'test@test.com',
  role: 'user' as const,
  display_name: 'Test User',
  avatar_url: null,
  created_at: '2024-01-01',
};

function buildService() {
  const service = TestBed.inject(AuthService);
  const httpMock = TestBed.inject(HttpTestingController);
  return { service, httpMock };
}

describe('AuthService', () => {
  let routerSpy: jasmine.SpyObj<Router>;
  let tokenStoreSpy: jasmine.SpyObj<TokenStore>;
  let httpMock: HttpTestingController;

  afterEach(() => {
    httpMock?.verify();
    localStorage.clear();
  });

  describe('constructor — no token', () => {
    beforeEach(() => {
      routerSpy = jasmine.createSpyObj('Router', ['navigate']);
      tokenStoreSpy = jasmine.createSpyObj('TokenStore', ['snapshot', 'set', 'clear'], {
        token: jasmine.createSpy().and.returnValue(null),
      });
      tokenStoreSpy.snapshot.and.returnValue(null);

      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [
          provideZonelessChangeDetection(),
          AuthService,
          { provide: Router, useValue: routerSpy },
          { provide: TokenStore, useValue: tokenStoreSpy },
        ],
      });
      const result = buildService();
      httpMock = result.httpMock;
    });

    it('isLoading is false immediately when no token', () => {
      const { service } = buildService();
      expect(service.isLoading()).toBeFalse();
      expect(service.isAuthenticated()).toBeFalse();
      expect(service.currentUser()).toBeNull();
    });

    it('isOrganizer returns false when not logged in', () => {
      const { service } = buildService();
      expect(service.isOrganizer()).toBeFalse();
    });

    it('userRole returns null when not authenticated', () => {
      const { service } = buildService();
      expect(service.userRole()).toBeNull();
    });
  });

  describe('constructor — with valid token', () => {
    beforeEach(() => {
      routerSpy = jasmine.createSpyObj('Router', ['navigate']);
      tokenStoreSpy = jasmine.createSpyObj('TokenStore', ['snapshot', 'set', 'clear'], {
        token: jasmine.createSpy().and.returnValue('valid-token'),
      });
      tokenStoreSpy.snapshot.and.returnValue('valid-token');

      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [
          provideZonelessChangeDetection(),
          AuthService,
          { provide: Router, useValue: routerSpy },
          { provide: TokenStore, useValue: tokenStoreSpy },
        ],
      });
      const result = buildService();
      httpMock = result.httpMock;
    });

    it('starts loading when token exists', () => {
      const { service } = buildService();
      expect(service.isLoading()).toBeTrue();
      httpMock.expectOne(`${API}/auth/me`).flush(rawProfile);
    });

    it('sets current user after /auth/me responds', async () => {
      const { service } = buildService();
      const req = httpMock.expectOne(`${API}/auth/me`);
      req.flush(rawProfile);
      await Promise.resolve();
      await Promise.resolve();
      expect(service.currentUser()?.id).toBe('u1');
      expect(service.isLoading()).toBeFalse();
      expect(service.isAuthenticated()).toBeTrue();
    });

    it('clears token and sets user null when /auth/me fails', async () => {
      const { service } = buildService();
      const req = httpMock.expectOne(`${API}/auth/me`);
      req.flush({}, { status: 401, statusText: 'Unauthorized' });
      await Promise.resolve();
      await Promise.resolve();
      expect(tokenStoreSpy.clear).toHaveBeenCalled();
      expect(service.currentUser()).toBeNull();
      expect(service.isLoading()).toBeFalse();
    });
  });

  describe('signIn', () => {
    beforeEach(() => {
      routerSpy = jasmine.createSpyObj('Router', ['navigate']);
      tokenStoreSpy = jasmine.createSpyObj('TokenStore', ['snapshot', 'set', 'clear'], {
        token: jasmine.createSpy().and.returnValue(null),
      });
      tokenStoreSpy.snapshot.and.returnValue(null);

      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [
          provideZonelessChangeDetection(),
          AuthService,
          { provide: Router, useValue: routerSpy },
          { provide: TokenStore, useValue: tokenStoreSpy },
        ],
      });
      const result = buildService();
      httpMock = result.httpMock;
    });

    it('sets token and user on success', async () => {
      const { service } = buildService();
      const p = service.signIn('test@test.com', 'password');
      const req = httpMock.expectOne(`${API}/auth/login`);
      req.flush({ access_token: 'new-token', user: rawProfile });
      const result = await p;
      expect(result.error).toBeNull();
      expect(tokenStoreSpy.set).toHaveBeenCalledWith('new-token');
      expect(service.currentUser()?.id).toBe('u1');
    });

    it('returns error on failure', async () => {
      const { service } = buildService();
      const p = service.signIn('bad@test.com', 'wrong');
      httpMock.expectOne(`${API}/auth/login`).flush(
        { detail: 'Invalid credentials' },
        { status: 401, statusText: 'Unauthorized' },
      );
      const result = await p;
      expect(result.error).toBe('Invalid credentials');
    });
  });

  describe('signUp', () => {
    beforeEach(() => {
      routerSpy = jasmine.createSpyObj('Router', ['navigate']);
      tokenStoreSpy = jasmine.createSpyObj('TokenStore', ['snapshot', 'set', 'clear'], {
        token: jasmine.createSpy().and.returnValue(null),
      });
      tokenStoreSpy.snapshot.and.returnValue(null);

      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [
          provideZonelessChangeDetection(),
          AuthService,
          { provide: Router, useValue: routerSpy },
          { provide: TokenStore, useValue: tokenStoreSpy },
        ],
      });
      const result = buildService();
      httpMock = result.httpMock;
    });

    it('sets token and user on success', async () => {
      const { service } = buildService();
      const p = service.signUp('test@test.com', 'password', 'Test User', 'user');
      const req = httpMock.expectOne(`${API}/auth/register`);
      expect(req.request.body).toEqual({
        email: 'test@test.com',
        password: 'password',
        display_name: 'Test User',
        role: 'user',
      });
      req.flush({ access_token: 'new-token', user: rawProfile });
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
    beforeEach(() => {
      routerSpy = jasmine.createSpyObj('Router', ['navigate']);
      tokenStoreSpy = jasmine.createSpyObj('TokenStore', ['snapshot', 'set', 'clear'], {
        token: jasmine.createSpy().and.returnValue(null),
      });
      tokenStoreSpy.snapshot.and.returnValue(null);

      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [
          provideZonelessChangeDetection(),
          AuthService,
          { provide: Router, useValue: routerSpy },
          { provide: TokenStore, useValue: tokenStoreSpy },
        ],
      });
      const result = buildService();
      httpMock = result.httpMock;
    });

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
      routerSpy = jasmine.createSpyObj('Router', ['navigate']);
      tokenStoreSpy = jasmine.createSpyObj('TokenStore', ['snapshot', 'set', 'clear'], {
        token: jasmine.createSpy().and.returnValue(null),
      });
      tokenStoreSpy.snapshot.and.returnValue(null);

      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [
          provideZonelessChangeDetection(),
          AuthService,
          { provide: Router, useValue: routerSpy },
          { provide: TokenStore, useValue: tokenStoreSpy },
        ],
      });
      const result = buildService();
      httpMock = result.httpMock;

      // Sign in first to set currentUser
      const { service } = buildService();
      const p = service.signIn('test@test.com', 'password');
      httpMock.expectOne(`${API}/auth/login`).flush({ access_token: 'token', user: rawProfile });
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
      service['_currentUser'].set(null);
      await service.updateRole('organizer');
      httpMock.expectNone(`${API}/users/me/role`);
    });
  });

  describe('updateDisplayName', () => {
    beforeEach(async () => {
      routerSpy = jasmine.createSpyObj('Router', ['navigate']);
      tokenStoreSpy = jasmine.createSpyObj('TokenStore', ['snapshot', 'set', 'clear'], {
        token: jasmine.createSpy().and.returnValue(null),
      });
      tokenStoreSpy.snapshot.and.returnValue(null);

      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [
          provideZonelessChangeDetection(),
          AuthService,
          { provide: Router, useValue: routerSpy },
          { provide: TokenStore, useValue: tokenStoreSpy },
        ],
      });
      const result = buildService();
      httpMock = result.httpMock;
    });

    it('updates displayName in currentUser', async () => {
      const { service } = buildService();
      const loginP = service.signIn('test@test.com', 'password');
      httpMock.expectOne(`${API}/auth/login`).flush({ access_token: 'token', user: rawProfile });
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
    });
  });

  describe('updateSocials', () => {
    beforeEach(() => {
      routerSpy = jasmine.createSpyObj('Router', ['navigate']);
      tokenStoreSpy = jasmine.createSpyObj('TokenStore', ['snapshot', 'set', 'clear'], {
        token: jasmine.createSpy().and.returnValue(null),
      });
      tokenStoreSpy.snapshot.and.returnValue(null);

      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [
          provideZonelessChangeDetection(),
          AuthService,
          { provide: Router, useValue: routerSpy },
          { provide: TokenStore, useValue: tokenStoreSpy },
        ],
      });
      const result = buildService();
      httpMock = result.httpMock;
    });

    it('updates socials in currentUser', async () => {
      const { service } = buildService();
      const loginP = service.signIn('test@test.com', 'password');
      httpMock.expectOne(`${API}/auth/login`).flush({ access_token: 'token', user: rawProfile });
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
    });
  });

  describe('setSocialsPublic', () => {
    beforeEach(() => {
      routerSpy = jasmine.createSpyObj('Router', ['navigate']);
      tokenStoreSpy = jasmine.createSpyObj('TokenStore', ['snapshot', 'set', 'clear'], {
        token: jasmine.createSpy().and.returnValue(null),
      });
      tokenStoreSpy.snapshot.and.returnValue(null);

      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [
          provideZonelessChangeDetection(),
          AuthService,
          { provide: Router, useValue: routerSpy },
          { provide: TokenStore, useValue: tokenStoreSpy },
        ],
      });
      const result = buildService();
      httpMock = result.httpMock;
    });

    it('updates socialsPublic in currentUser', async () => {
      const { service } = buildService();
      const loginP = service.signIn('test@test.com', 'password');
      httpMock.expectOne(`${API}/auth/login`).flush({ access_token: 'token', user: rawProfile });
      await loginP;

      const p = service.setSocialsPublic(true);
      httpMock.expectOne(`${API}/users/me/socials-visibility`).flush(rawProfile);
      await p;
      expect(service.currentUser()?.socialsPublic).toBeTrue();
    });

    it('does nothing when user is null', async () => {
      const { service } = buildService();
      await service.setSocialsPublic(true);
      httpMock.expectNone(`${API}/users/me/socials-visibility`);
    });
  });
});
