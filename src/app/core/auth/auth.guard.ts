import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // If the session check has already resolved, evaluate immediately
  if (!auth.isLoading()) {
    return auth.isAuthenticated() ? true : router.createUrlTree(['/login']);
  }

  // Otherwise wait for initAuthState() to finish before deciding
  return toObservable(auth.isLoading).pipe(
    filter(loading => !loading),
    take(1),
    map(() => (auth.isAuthenticated() ? true : router.createUrlTree(['/login']))),
  );
};
