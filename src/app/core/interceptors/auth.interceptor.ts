import {
  HttpClient,
  HttpContext,
  HttpContextToken,
  HttpErrorResponse,
  HttpEvent,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { toast } from '@spartan-ng/brain/sonner';
import {
  Observable,
  TimeoutError,
  catchError,
  finalize,
  map,
  of,
  retry,
  shareReplay,
  switchMap,
  throwError,
  timer,
  timeout,
} from 'rxjs';
import { TokenStore } from '../auth/token.store';
import { environment } from '../../../environments/environment';

const REQUEST_TIMEOUT_MS = 15_000;
const MUTATION_TIMEOUT_MS = 30_000;
const MUTATION_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/** Suppress toast errors for background requests that fail silently in the UI. */
export const SUPPRESS_ERROR_TOAST = new HttpContextToken<boolean>(() => false);

/** Mark a request as targeting a public endpoint that needs no auth error handling. */
export const SKIP_AUTH_REDIRECT = new HttpContextToken<boolean>(() => false);

/** Marks a request as already having gone through one refresh-and-replay cycle. */
const IS_REFRESH_RETRY = new HttpContextToken<boolean>(() => false);

// Module-scoped so concurrent 401s across the app share a single in-flight
// refresh instead of each racing the backend's refresh-token rotation.
// eslint-disable-next-line rxjs-x/finnish
let refreshInFlight: Observable<string | null> | null = null;

function refreshAccessToken$(http: HttpClient, tokenStore: TokenStore): Observable<string | null> {
  if (refreshInFlight) return refreshInFlight;
  const persistedRefresh = tokenStore.refreshToken();
  refreshInFlight = http
    .post<{ accessToken: string; refreshToken: string }>(
      `${environment.apiUrl}/auth/refresh`,
      persistedRefresh ? { refreshToken: persistedRefresh } : {},
      { withCredentials: true, context: new HttpContext().set(SKIP_AUTH_REDIRECT, true) },
    )
    .pipe(
      map(resp => {
        tokenStore.set(resp.accessToken);
        if (resp.refreshToken) tokenStore.setRefreshToken(resp.refreshToken);
        return resp.accessToken as string | null;
      }),
      catchError(() => of(null)),
      finalize(() => {
        refreshInFlight = null;
      }),
      shareReplay({ bufferSize: 1, refCount: false }),
    );
  return refreshInFlight;
}

/**
 * Error thrown when the frontend's own request timeout fires before the
 * backend responds. Distinct from a backend HTTP error so the UI can show
 * a meaningful, localizable message instead of rxjs's default
 * "Timeout has occurred".
 */
export class RequestTimeoutError extends Error {
  readonly translationKey = 'ERRORS.timeout';
  constructor() {
    super('ERRORS.timeout');
    this.name = 'RequestTimeoutError';
  }
}

/**
 * Error wrapping a backend HTTP error (4xx/5xx). Carries an i18n key and,
 * when present, the backend's detail/message so the UI can surface real
 * server feedback rather than a generic "Timeout has occurred".
 */
export class BackendHttpError extends Error {
  readonly translationKey: string;
  readonly status: number;
  readonly detail: string | null;
  constructor(status: number, detail: string | null, translationKey: string) {
    super(detail ?? translationKey);
    this.name = 'BackendHttpError';
    this.status = status;
    this.detail = detail;
    this.translationKey = translationKey;
  }
}

function isFirstPartyRequest(url: string): boolean {
  return !/^https?:\/\//i.test(url) || url.startsWith(environment.apiUrl);
}

function resolveAuthRedirect(
  httpError: HttpErrorResponse,
  token: string | null,
  tokenStore: TokenStore,
): string | null {
  if (httpError.status === 401 && token) {
    tokenStore.clear();
    return '/login';
  }
  if (httpError.status === 403) {
    return '/clubs';
  }
  return null;
}

async function handleHttpSideEffects(
  httpError: HttpErrorResponse,
  token: string | null,
  suppress: boolean,
  skipAuthRedirect: boolean,
  router: Router,
  tokenStore: TokenStore,
  translate: TranslateService,
): Promise<void> {
  if (!skipAuthRedirect) {
    const target = resolveAuthRedirect(httpError, token, tokenStore);
    if (target) {
      await router.navigate([target]);
      return;
    }
  }
  if (httpError.status >= 500) {
    if (!environment.production) {
      console.error('[HTTP] Server error', httpError.status, httpError.url, httpError);
    }
    if (!suppress) {
      toast.error(translate.instant('ERRORS.serverError') as string);
    }
  }
}

function extractBackendDetail(err: HttpErrorResponse): string | null {
  const body = err.error;
  if (!body) return null;
  if (typeof body === 'string') return body.trim() || null;
  if (typeof body === 'object') {
    const candidate =
      (body as { detail?: unknown }).detail ??
      (body as { message?: unknown }).message ??
      (body as { error?: unknown }).error;
    if (typeof candidate === 'string' && candidate.trim()) return candidate.trim();
    // Backend returns detail as nested object: { error: string, code: string }
    if (typeof candidate === 'object' && candidate !== null) {
      const nested = (candidate as { error?: unknown }).error ?? (candidate as { message?: unknown }).message;
      if (typeof nested === 'string' && nested.trim()) return nested.trim();
    }
  }
  return null;
}

/**
 * Global HTTP error interceptor.
 *
 * • 401 Unauthorized → session expired or missing; redirect to /login so the
 *   user can re-authenticate rather than silently failing.
 *
 * • 403 Forbidden → authenticated but lacks the required role; redirect to
 *   /clubs (safe landing page) instead of leaving the user on a broken page.
 *
 * • 500 Internal Server Error → unexpected server failure; show a toast
 *   notification and log the full error for debugging.
 *
 * Frontend timeouts and backend HTTP errors are normalized to dedicated
 * error classes (`RequestTimeoutError`, `BackendHttpError`) that carry an
 * i18n key and (for HTTP errors) the backend's detail message, so callers
 * can render localized, accurate UI instead of rxjs's default text.
 *
 * The error is always re-thrown so callers can still handle it locally if needed.
 */
// eslint-disable-next-line rxjs-x/finnish
export const authInterceptor: HttpInterceptorFn = (req, next$) => {
  const router = inject(Router);
  const http = inject(HttpClient);
  const tokenStore = inject(TokenStore);
  const translate = inject(TranslateService);

  const timeoutMs = MUTATION_METHODS.has(req.method.toUpperCase())
    ? MUTATION_TIMEOUT_MS
    : REQUEST_TIMEOUT_MS;

  const authorize = (request: HttpRequest<unknown>, withToken: string | null) =>
    withToken && isFirstPartyRequest(request.url)
      ? request.clone({ setHeaders: { Authorization: `Bearer ${withToken}` } })
      : request;

  // eslint-disable-next-line rxjs-x/finnish
  const run = (request: HttpRequest<unknown>, activeToken: string | null): Observable<HttpEvent<unknown>> =>
    next$(authorize(request, activeToken)).pipe(
      timeout(timeoutMs),
      // Retry once on 503 (Render cold-start): server was not ready but will be
      // after a few seconds. 503 guarantees the request was never processed so
      // retrying is safe for all methods including POST.
      retry({
        count: 1,
        delay: (error: unknown) =>
          error instanceof HttpErrorResponse && error.status === 503
            ? timer(5000)
            : throwError(() => error),
      }),
      catchError((error: unknown) => {
        const suppress = request.context.get(SUPPRESS_ERROR_TOAST);
        const skipAuthRedirect = request.context.get(SKIP_AUTH_REDIRECT);
        if (error instanceof TimeoutError) {
          if (!suppress) {
            toast.error(translate.instant('ERRORS.timeout') as string);
          }
          return throwError(() => new RequestTimeoutError());
        }
        const httpError = error instanceof HttpErrorResponse ? error : null;

        // One refresh-and-replay attempt on a stale access token, instead of
        // logging the user out mid-session. Guarded by IS_REFRESH_RETRY so the
        // replayed request's own 401 falls straight through to logout.
        const shouldRetryAfterRefresh =
          httpError?.status === 401 &&
          !!activeToken &&
          !skipAuthRedirect &&
          !request.context.get(IS_REFRESH_RETRY);

        if (shouldRetryAfterRefresh) {
          return refreshAccessToken$(http, tokenStore).pipe(
            switchMap(newToken => {
              if (!newToken) {
                tokenStore.clear();
                router.navigate(['/login']).catch(() => { /* best-effort */ });
                return throwError(
                  () => new BackendHttpError(401, extractBackendDetail(httpError), 'ERRORS.requestFailed'),
                );
              }
              const retriedReq = request.clone({ context: request.context.set(IS_REFRESH_RETRY, true) });
              return run(retriedReq, newToken);
            }),
          );
        }

        if (httpError) {
          handleHttpSideEffects(httpError, activeToken, suppress, skipAuthRedirect, router, tokenStore, translate)
            .catch(() => { /* navigation/side-effects best-effort */ });
          const detail = extractBackendDetail(httpError);
          let errorKey: string;
          if (httpError.status >= 500) {
            errorKey = 'ERRORS.serverError';
          } else if (httpError.status === 0) {
            errorKey = 'ERRORS.network';
          } else {
            errorKey = 'ERRORS.requestFailed';
          }
          return throwError(() => new BackendHttpError(httpError.status, detail, errorKey));
        }
        return throwError(() => error);
      }),
    );

  return run(req, tokenStore.snapshot());
};
