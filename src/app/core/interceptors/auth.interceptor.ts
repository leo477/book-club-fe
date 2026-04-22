import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';
import { TokenStore } from '../auth/token.store';
import { environment } from '../../../environments/environment';

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
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toast = inject(ToastService);
  const tokenStore = inject(TokenStore);

  const token = tokenStore.snapshot();
  const authedReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authedReq).pipe(
    catchError((error: unknown) => {
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
        toast.show('A server error occurred. Please try again later.', 'error');
      }
      return throwError(() => error);
    }),
  );
};
