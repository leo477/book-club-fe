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
  let routerSpy: { navigate: ReturnType<typeof vi.fn> };
  let tokenStoreSpy: {
    snapshot: ReturnType<typeof vi.fn>;
    clear: ReturnType<typeof vi.fn>;
    token: ReturnType<typeof vi.fn>;
    refreshToken: ReturnType<typeof vi.fn>;
    setRefreshToken: ReturnType<typeof vi.fn>;
    set: ReturnType<typeof vi.fn>;
  };
  let translateSpy: { instant: ReturnType<typeof vi.fn> };

  function setup(token: string | null = null) {
    routerSpy = { navigate: vi.fn() };
    tokenStoreSpy = {
      token: vi.fn().mockReturnValue(token),
      snapshot: vi.fn().mockReturnValue(token),
      clear: vi.fn(),
      refreshToken: vi.fn().mockReturnValue(null),
      setRefreshToken: vi.fn(),
      set: vi.fn(),
    };
    translateSpy = { instant: vi.fn().mockImplementation((key: string) => key) };

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
    vi.restoreAllMocks();
  });

  it('passes request without Authorization when no token', () => {
    setup(null);
    http.get('/api/test').subscribe();
    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('adds Authorization header when token present', () => {
    setup('my-token');
    http.get('/api/test').subscribe();
    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.get('Authorization')).toBe('Bearer my-token');
    req.flush({});
  });

  it('does not attach Authorization header to absolute third-party URLs', () => {
    setup('my-token');
    http.get('https://openlibrary.org/search.json?q=test').subscribe();
    const req = httpMock.expectOne('https://openlibrary.org/search.json?q=test');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('attaches Authorization header to requests targeting the relative apiUrl prefix', () => {
    setup('my-token');
    http.get('/api/v1/clubs').subscribe();
    const req = httpMock.expectOne('/api/v1/clubs');
    expect(req.request.headers.get('Authorization')).toBe('Bearer my-token');
    req.flush({});
  });

  it('attempts a token refresh on 401 and replays the request on success', () =>
    new Promise<void>((resolve) => {
      setup('stale-token');
      http.get('/api/test').subscribe({
        next: (result) => {
          expect(result).toEqual({ ok: true });
          expect(tokenStoreSpy.clear).not.toHaveBeenCalled();
          expect(routerSpy.navigate).not.toHaveBeenCalled();
          resolve();
        },
      });

      const first = httpMock.expectOne('/api/test');
      expect(first.request.headers.get('Authorization')).toBe('Bearer stale-token');
      first.flush({ detail: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

      const refresh = httpMock.expectOne('/api/v1/auth/refresh');
      expect(refresh.request.body).toEqual({});
      expect(refresh.request.withCredentials).toBe(true);
      refresh.flush({ accessToken: 'fresh-token', refreshToken: 'fresh-refresh' });

      const retried = httpMock.expectOne('/api/test');
      expect(retried.request.headers.get('Authorization')).toBe('Bearer fresh-token');
      expect(tokenStoreSpy.setRefreshToken).not.toHaveBeenCalled();
      retried.flush({ ok: true });
    }));

  it('clears token and navigates to /login when the refresh attempt itself fails', () =>
    new Promise<void>((resolve) => {
      setup('stale-token');
      http.get('/api/test').subscribe({
        error: () => {
          expect(tokenStoreSpy.clear).toHaveBeenCalled();
          expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
          resolve();
        },
      });

      const first = httpMock.expectOne('/api/test');
      first.flush({ detail: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

      const refresh = httpMock.expectOne('/api/v1/auth/refresh');
      refresh.flush({ detail: 'Refresh token invalid' }, { status: 401, statusText: 'Unauthorized' });
    }));

  it('clears token and navigates to /login when the replayed request 401s again', () =>
    new Promise<void>((resolve) => {
      setup('stale-token');
      http.get('/api/test').subscribe({
        error: () => {
          expect(tokenStoreSpy.clear).toHaveBeenCalled();
          expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
          resolve();
        },
      });

      const first = httpMock.expectOne('/api/test');
      first.flush({ detail: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

      const refresh = httpMock.expectOne('/api/v1/auth/refresh');
      refresh.flush({ accessToken: 'fresh-token', refreshToken: 'fresh-refresh' });

      const retried = httpMock.expectOne('/api/test');
      retried.flush({ detail: 'Still unauthorized' }, { status: 401, statusText: 'Unauthorized' });
    }));

  it('does not redirect on 401 for unauthenticated requests (e.g. wrong login credentials)', () => {
    setup(null);
    http.post('/api/auth/login', {}).subscribe({ error: vi.fn() });
    const req = httpMock.expectOne('/api/auth/login');
    req.flush({ detail: 'Invalid credentials' }, { status: 401, statusText: 'Unauthorized' });
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('navigates to /clubs on 403', () => {
    setup('my-token');
    http.get('/api/test').subscribe({ error: vi.fn() });
    const req = httpMock.expectOne('/api/test');
    req.flush({ detail: 'Forbidden' }, { status: 403, statusText: 'Forbidden' });
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/clubs']);
  });

  it('shows toast on 500', async () => {
    setup('my-token');
    vi.spyOn(toast, 'error').mockImplementation(() => '');
    http.get('/api/test').subscribe({ error: vi.fn() });
    const req = httpMock.expectOne('/api/test');
    req.flush({ detail: 'Server Error' }, { status: 500, statusText: 'Internal Server Error' });
    await new Promise(resolve => setTimeout(resolve));
    expect(toast.error).toHaveBeenCalledWith('ERRORS.serverError');
  });

  it('re-throws the error after handling', () =>
    new Promise<void>((resolve) => {
      setup('my-token');
      http.get('/api/test').subscribe({
        error: (err: unknown) => {
          expect(err).toBeTruthy();
          resolve();
        },
      });
      const req = httpMock.expectOne('/api/test');
      req.flush({}, { status: 401, statusText: 'Unauthorized' });
      const refresh = httpMock.expectOne('/api/v1/auth/refresh');
      refresh.flush({ detail: 'Refresh token invalid' }, { status: 401, statusText: 'Unauthorized' });
    }));

  it('does not show toast on non-5xx errors', () => {
    setup('my-token');
    vi.spyOn(toast, 'error').mockImplementation(() => '');
    http.get('/api/test').subscribe({ error: vi.fn() });
    const req = httpMock.expectOne('/api/test');
    req.flush({}, { status: 400, statusText: 'Bad Request' });
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('shows toast and throws RequestTimeoutError when next$ emits TimeoutError', async () => {
    setup(null);
    vi.spyOn(toast, 'error').mockImplementation(() => '');
    let caughtError: unknown;

    const injector = TestBed.inject(EnvironmentInjector);
    const req = new HttpRequest('GET', '/api/test');
    runInInjectionContext(injector, () => {
      authInterceptor(req, () => throwError(() => new TimeoutError())).subscribe({
        error: (e: unknown) => { caughtError = e; },
      });
    });

    await new Promise(resolve => setTimeout(resolve));
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

  it('retries once on 503 and succeeds on the second attempt', () =>
    new Promise<void>((resolve) => {
      setup(null);
      vi.useFakeTimers();

      http.get('/api/test').subscribe({
        next: (result) => {
          expect(result).toEqual({ ok: true });
          vi.useRealTimers();
          resolve();
        },
      });

      // First attempt — 503 (Render cold-start)
      httpMock.expectOne('/api/test').flush({}, { status: 503, statusText: 'Service Unavailable' });

      // Advance past the 5 s retry delay; RxJS timer() respects fake timers
      vi.advanceTimersByTime(5001);

      // Second attempt — success
      httpMock.expectOne('/api/test').flush({ ok: true });
    }));

  it('does not retry on non-503 errors', () => {
    setup(null);
    const errorSpy = vi.fn();
    http.get('/api/test').subscribe({ error: errorSpy });
    httpMock.expectOne('/api/test').flush({}, { status: 500, statusText: 'Internal Server Error' });
    httpMock.verify();
    expect(errorSpy).toHaveBeenCalledTimes(1);
  });

  describe('nested detail extraction', () => {
    it('extracts detail.error from nested object', () =>
      new Promise<void>((resolve) => {
        setup();
        http.get('/api/test').subscribe({ error: (err: unknown) => {
          expect((err as BackendHttpError).detail).toBe('Invalid credentials');
          resolve();
        }});
        const req = httpMock.expectOne('/api/test');
        req.flush({ detail: { error: 'Invalid credentials', code: 'INVALID_CREDENTIALS' } }, { status: 401, statusText: 'Unauthorized' });
      }));

    it('falls back to ERRORS.requestFailed when nested detail has no error field', () =>
      new Promise<void>((resolve) => {
        setup();
        http.get('/api/test').subscribe({ error: (err: unknown) => {
          expect((err as BackendHttpError).translationKey).toBe('ERRORS.requestFailed');
          resolve();
        }});
        const req = httpMock.expectOne('/api/test');
        req.flush({ detail: { code: 'SOME_CODE' } }, { status: 400, statusText: 'Bad Request' });
      }));

    it('extracts string detail directly', () =>
      new Promise<void>((resolve) => {
        setup();
        http.get('/api/test').subscribe({ error: (err: unknown) => {
          expect((err as BackendHttpError).detail).toBe('Some error');
          resolve();
        }});
        const req = httpMock.expectOne('/api/test');
        req.flush({ detail: 'Some error' }, { status: 400, statusText: 'Bad Request' });
      }));

    it('uses ERRORS.serverError for empty body on 500', () =>
      new Promise<void>((resolve) => {
        setup();
        http.get('/api/test').subscribe({ error: (err: unknown) => {
          expect((err as BackendHttpError).translationKey).toBe('ERRORS.serverError');
          resolve();
        }});
        const req = httpMock.expectOne('/api/test');
        req.flush({}, { status: 500, statusText: 'Server Error' });
      }));

    it('suppresses toast when SUPPRESS_ERROR_TOAST is true', () =>
      new Promise<void>((resolve) => {
        setup();
        vi.spyOn(toast, 'error').mockImplementation(() => '');
        http.get('/api/test', { context: new HttpContext().set(SUPPRESS_ERROR_TOAST, true) })
          .subscribe({ error: () => {
            expect(toast.error).not.toHaveBeenCalled();
            resolve();
          }});
        const req = httpMock.expectOne('/api/test');
        req.flush({ detail: 'err' }, { status: 400, statusText: 'Bad Request' });
      }));
  });
});
