import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient, withInterceptors, HttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { authInterceptor } from './auth.interceptor';
import { ToastService } from '../services/toast.service';
import { TokenStore } from '../auth/token.store';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let routerSpy: jasmine.SpyObj<Router>;
  let toastSpy: jasmine.SpyObj<ToastService>;
  let tokenStoreSpy: jasmine.SpyObj<TokenStore>;

  function setup(token: string | null = null) {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    toastSpy = jasmine.createSpyObj('ToastService', ['show']);
    tokenStoreSpy = jasmine.createSpyObj('TokenStore', ['snapshot', 'clear'], {
      token: jasmine.createSpy().and.returnValue(token),
    });
    tokenStoreSpy.snapshot.and.returnValue(token);

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: Router, useValue: routerSpy },
        { provide: ToastService, useValue: toastSpy },
        { provide: TokenStore, useValue: tokenStoreSpy },
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  }

  afterEach(() => {
    httpMock.verify();
  });

  it('passes request without Authorization when no token', () => {
    setup(null);
    http.get('/api/test').subscribe();
    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });

  it('adds Authorization header when token present', () => {
    setup('my-token');
    http.get('/api/test').subscribe();
    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.get('Authorization')).toBe('Bearer my-token');
    req.flush({});
  });

  it('navigates to /login and clears token on 401 for authenticated requests', () => {
    setup('my-token');
    http.get('/api/test').subscribe({ error: jasmine.createSpy('errorHandler') });
    const req = httpMock.expectOne('/api/test');
    req.flush({ detail: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });
    expect(tokenStoreSpy.clear).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('does not redirect on 401 for unauthenticated requests (e.g. wrong login credentials)', () => {
    setup(null);
    http.post('/api/auth/login', {}).subscribe({ error: jasmine.createSpy('errorHandler') });
    const req = httpMock.expectOne('/api/auth/login');
    req.flush({ detail: 'Invalid credentials' }, { status: 401, statusText: 'Unauthorized' });
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('navigates to /clubs on 403', () => {
    setup('my-token');
    http.get('/api/test').subscribe({ error: jasmine.createSpy('errorHandler') });
    const req = httpMock.expectOne('/api/test');
    req.flush({ detail: 'Forbidden' }, { status: 403, statusText: 'Forbidden' });
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/clubs']);
  });

  it('shows toast on 500', () => {
    setup('my-token');
    http.get('/api/test').subscribe({ error: jasmine.createSpy('errorHandler') });
    const req = httpMock.expectOne('/api/test');
    req.flush({ detail: 'Server Error' }, { status: 500, statusText: 'Internal Server Error' });
    expect(toastSpy.show).toHaveBeenCalledWith(
      'A server error occurred. Please try again later.',
      'error',
    );
  });

  it('re-throws the error after handling', (done) => {
    setup('my-token');
    http.get('/api/test').subscribe({
      error: (err: unknown) => {
        expect(err).toBeTruthy();
        done();
      },
    });
    const req = httpMock.expectOne('/api/test');
    req.flush({}, { status: 401, statusText: 'Unauthorized' });
  });

  it('does not show toast on non-5xx errors', () => {
    setup('my-token');
    http.get('/api/test').subscribe({ error: jasmine.createSpy('errorHandler') });
    const req = httpMock.expectOne('/api/test');
    req.flush({}, { status: 400, statusText: 'Bad Request' });
    expect(toastSpy.show).not.toHaveBeenCalled();
  });
});
