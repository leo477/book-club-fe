import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { toast } from '@spartan-ng/brain/sonner';
import { TimeoutError, catchError, throwError, timeout } from 'rxjs';
import { TokenStore } from '../auth/token.store';
import { environment } from '../../../environments/environment';

const REQUEST_TIMEOUT_MS = 15_000;

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
 * The error is always re-thrown so callers can still handle it locally if needed.
 */
// eslint-disable-next-line rxjs-x/finnish
export const authInterceptor: HttpInterceptorFn = (req, next$) => {
  const router = inject(Router);
  const tokenStore = inject(TokenStore);

  const token = tokenStore.snapshot();
  const authedReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next$(authedReq).pipe(
    timeout(REQUEST_TIMEOUT_MS),
    catchError((error: unknown) => {
      if (error instanceof TimeoutError) {
        toast.error('Сервер не відповідає. Перевірте підключення та спробуйте ще раз.');
        return throwError(() => error);
      }
      const httpError = error instanceof HttpErrorResponse ? error : null;
      if (httpError?.status === 401 && token) {
        tokenStore.clear();
        router.navigate(['/login']);
      } else if (httpError?.status === 403) {
        router.navigate(['/clubs']);
      } else if (httpError && httpError.status >= 500) {
        if (!environment.production) {
          console.error('[HTTP] Server error', httpError.status, httpError.url, httpError);
        }
        toast.error('A server error occurred. Please try again later.');
      }
      return throwError(() => error);
    }),
  );
};
