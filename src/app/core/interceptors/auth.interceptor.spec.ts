import { EnvironmentInjector, provideZonelessChangeDetection, runInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HttpRequest, provideHttpClient, withInterceptors, HttpClient, HttpContext } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { toast } from '@spartan-ng/brain/sonner';
import { TimeoutError, throwError } from 'rxjs';
import { authInterceptor, BackendHttpError, RequestTimeoutError, SUPPRESS_ERROR_TOAST } from './auth.interceptor';
import { TokenStore } from '../auth/token.store';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let routerSpy: jasmine.SpyObj<Router>;
  let tokenStoreSpy: jasmine.SpyObj<TokenStore>;
  let translateSpy: jasmine.SpyObj<TranslateService>;

  function setup(token: string | null = null) {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    tokenStoreSpy = jasmine.createSpyObj('TokenStore', ['snapshot', 'clear'], {
      token: jasmine.createSpy().and.returnValue(token),
    });
    tokenStoreSpy.snapshot.and.returnValue(token);
    translateSpy = jasmine.createSpyObj('TranslateService', ['instant']);
    translateSpy.instant.and.callFake((key: string) => key);

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: Router, useValue: routerSpy },
        { provide: TokenStore, useValue: tokenStoreSpy },
        { provide: TranslateService, useValue: translateSpy },
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  }

  afterEach(() => {
    httpMock?.verify();
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
    spyOn(toast, 'error');
    http.get('/api/test').subscribe({ error: jasmine.createSpy('errorHandler') });
    const req = httpMock.expectOne('/api/test');
    req.flush({ detail: 'Server Error' }, { status: 500, statusText: 'Internal Server Error' });
    expect(toast.error).toHaveBeenCalledWith('ERRORS.serverError');
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
    spyOn(toast, 'error');
    http.get('/api/test').subscribe({ error: jasmine.createSpy('errorHandler') });
    const req = httpMock.expectOne('/api/test');
    req.flush({}, { status: 400, statusText: 'Bad Request' });
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('shows toast and throws RequestTimeoutError when next$ emits TimeoutError', () => {
    setup(null);
    spyOn(toast, 'error');
    let caughtError: unknown;

    const injector = TestBed.inject(EnvironmentInjector);
    const req = new HttpRequest('GET', '/api/test');
    runInInjectionContext(injector, () => {
      authInterceptor(req, () => throwError(() => new TimeoutError())).subscribe({
        error: (e: unknown) => { caughtError = e; },
      });
    });

    expect(toast.error).toHaveBeenCalled();
    expect(caughtError).toBeInstanceOf(RequestTimeoutError);
    expect((caughtError as RequestTimeoutError).translationKey).toBe('ERRORS.timeout');
  });

  it('re-throws unknown (non-HTTP) errors as-is', () => {
    setup(null);
    const originalError = new Error('custom network failure');
    let caughtError: unknown;

    const injector = TestBed.inject(EnvironmentInjector);
    const req = new HttpRequest('GET', '/api/test');
    runInInjectionContext(injector, () => {
      authInterceptor(req, () => throwError(() => originalError)).subscribe({
        error: (e: unknown) => { caughtError = e; },
      });
    });

    expect(caughtError).toBe(originalError);
  });

  it('throws BackendHttpError with ERRORS.network key for status 0', () => {
    setup(null);
    let err: BackendHttpError | undefined;
    http.get('/api/test').subscribe({ error: (e: unknown) => { err = e as BackendHttpError; } });
    const req = httpMock.expectOne('/api/test');
    req.error(new ProgressEvent('error'));
    expect(err?.translationKey).toBe('ERRORS.network');
    expect(err?.status).toBe(0);
  });

  it('extracts detail from string error body', () => {
    setup(null);
    let err: BackendHttpError | undefined;
    http.get('/api/test', { responseType: 'text' }).subscribe({ error: (e: unknown) => { err = e as BackendHttpError; } });
    const req = httpMock.expectOne('/api/test');
    req.flush('Plain error text', { status: 400, statusText: 'Bad Request' });
    expect(err?.detail).toBe('Plain error text');
  });

  it('extracts detail from body.message field', () => {
    setup(null);
    let err: BackendHttpError | undefined;
    http.get('/api/test').subscribe({ error: (e: unknown) => { err = e as BackendHttpError; } });
    const req = httpMock.expectOne('/api/test');
    req.flush({ message: 'Custom error message' }, { status: 400, statusText: 'Bad Request' });
    expect(err?.detail).toBe('Custom error message');
  });

  it('RequestTimeoutError has correct name and translationKey', () => {
    const err = new RequestTimeoutError();
    expect(err.name).toBe('RequestTimeoutError');
    expect(err.translationKey).toBe('ERRORS.timeout');
  });

  it('BackendHttpError carries status, detail, and translationKey', () => {
    const err = new BackendHttpError(422, 'Validation failed', 'ERRORS.requestFailed');
    expect(err.status).toBe(422);
    expect(err.detail).toBe('Validation failed');
    expect(err.translationKey).toBe('ERRORS.requestFailed');
    expect(err.name).toBe('BackendHttpError');
  });

  it('retries once on 503 and succeeds on the second attempt', (done) => {
    setup(null);
    jasmine.clock().install();

    http.get('/api/test').subscribe({
      next: (result) => {
        expect(result).toEqual({ ok: true });
        jasmine.clock().uninstall();
        done();
      },
    });

    // First attempt — 503 (Render cold-start)
    httpMock.expectOne('/api/test').flush({}, { status: 503, statusText: 'Service Unavailable' });

    // Advance past the 5 s retry delay; RxJS timer() respects jasmine.clock
    jasmine.clock().tick(5001);

    // Second attempt — success
    httpMock.expectOne('/api/test').flush({ ok: true });
  });

  it('does not retry on non-503 errors', () => {
    setup(null);
    http.get('/api/test').subscribe({ error: jasmine.createSpy('errorHandler') });
    httpMock.expectOne('/api/test').flush({}, { status: 500, statusText: 'Internal Server Error' });
    httpMock.verify();
  });

  describe('nested detail extraction', () => {
    it('extracts detail.error from nested object', (done) => {
      setup();
      http.get('/api/test').subscribe({ error: (err: unknown) => {
        expect((err as BackendHttpError).detail).toBe('Invalid credentials');
        done();
      }});
      const req = httpMock.expectOne('/api/test');
      req.flush({ detail: { error: 'Invalid credentials', code: 'INVALID_CREDENTIALS' } }, { status: 401, statusText: 'Unauthorized' });
    });

    it('falls back to ERRORS.requestFailed when nested detail has no error field', (done) => {
      setup();
      http.get('/api/test').subscribe({ error: (err: unknown) => {
        expect((err as BackendHttpError).translationKey).toBe('ERRORS.requestFailed');
        done();
      }});
      const req = httpMock.expectOne('/api/test');
      req.flush({ detail: { code: 'SOME_CODE' } }, { status: 400, statusText: 'Bad Request' });
    });

    it('extracts string detail directly', (done) => {
      setup();
      http.get('/api/test').subscribe({ error: (err: unknown) => {
        expect((err as BackendHttpError).detail).toBe('Some error');
        done();
      }});
      const req = httpMock.expectOne('/api/test');
      req.flush({ detail: 'Some error' }, { status: 400, statusText: 'Bad Request' });
    });

    it('uses ERRORS.serverError for empty body on 500', (done) => {
      setup();
      http.get('/api/test').subscribe({ error: (err: unknown) => {
        expect((err as BackendHttpError).translationKey).toBe('ERRORS.serverError');
        done();
      }});
      const req = httpMock.expectOne('/api/test');
      req.flush({}, { status: 500, statusText: 'Server Error' });
    });

    it('suppresses toast when SUPPRESS_ERROR_TOAST is true', (done) => {
      setup();
      spyOn(toast, 'error');
      http.get('/api/test', { context: new HttpContext().set(SUPPRESS_ERROR_TOAST, true) })
        .subscribe({ error: () => {
          expect(toast.error).not.toHaveBeenCalled();
          done();
        }});
      const req = httpMock.expectOne('/api/test');
      req.flush({ detail: 'err' }, { status: 400, statusText: 'Bad Request' });
    });
  });
});
