import { HttpContextToken, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { toast } from '@spartan-ng/brain/sonner';
import { TimeoutError, catchError, retry, throwError, timer, timeout } from 'rxjs';
import { TokenStore } from '../auth/token.store';
import { environment } from '../../../environments/environment';

const REQUEST_TIMEOUT_MS = 15_000;
const MUTATION_TIMEOUT_MS = 30_000;
const MUTATION_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/** Suppress toast errors for background requests that fail silently in the UI. */
export const SUPPRESS_ERROR_TOAST = new HttpContextToken<boolean>(() => false);

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
  const tokenStore = inject(TokenStore);
  const translate = inject(TranslateService);

  const token = tokenStore.snapshot();
  const authedReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  const timeoutMs = MUTATION_METHODS.has(req.method.toUpperCase())
    ? MUTATION_TIMEOUT_MS
    : REQUEST_TIMEOUT_MS;

  return next$(authedReq).pipe(
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
      const suppress = req.context.get(SUPPRESS_ERROR_TOAST);
      if (error instanceof TimeoutError) {
        if (!suppress) {
          toast.error(translate.instant('ERRORS.timeout') as string);
        }
        return throwError(() => new RequestTimeoutError());
      }
      const httpError = error instanceof HttpErrorResponse ? error : null;
      if (httpError?.status === 401 && token && !suppress) {
        tokenStore.clear();
        router.navigate(['/login']);
      } else if (httpError?.status === 403 && !suppress) {
        router.navigate(['/clubs']);
      } else if (httpError && httpError.status >= 500) {
        if (!environment.production) {
          console.error('[HTTP] Server error', httpError.status, httpError.url, httpError);
        }
        if (!suppress) {
          toast.error(translate.instant('ERRORS.serverError') as string);
        }
      }
      if (httpError) {
        const detail = extractBackendDetail(httpError);
        const key =
          httpError.status >= 500
            ? 'ERRORS.serverError'
            : httpError.status === 0
              ? 'ERRORS.network'
              : 'ERRORS.requestFailed';
        return throwError(() => new BackendHttpError(httpError.status, detail, key));
      }
      return throwError(() => error);
    }),
  );
};
