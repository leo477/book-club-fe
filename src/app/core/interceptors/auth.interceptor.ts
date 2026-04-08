import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

/**
 * Global HTTP error interceptor.
 *
 * • 401 Unauthorized → session expired or missing; redirect to /login so the
 *   user can re-authenticate rather than silently failing.
 *
 * • 403 Forbidden → authenticated but lacks the required role; redirect to
 *   /clubs (safe landing page) instead of leaving the user on a broken page.
 *
 * The error is always re-thrown so callers can still handle it locally if needed.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        router.navigate(['/login']);
      } else if (error.status === 403) {
        router.navigate(['/clubs']);
      }
      return throwError(() => error);
    }),
  );
};
