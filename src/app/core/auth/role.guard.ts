import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs';
import { toast } from '@spartan-ng/brain/sonner';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from './auth.service';
import { UserRole } from '../models/user.model';

export const roleGuard =
  (requiredRole: UserRole): CanActivateFn =>
  () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const translate = inject(TranslateService);

    const evaluate = () => {
      if (auth.userRole() === requiredRole) return true;
      toast.error(translate.instant('ERRORS.organizers_only') as string);
      return router.createUrlTree(['/clubs']);
    };

    // If still bootstrapping, wait for session check to complete first
    if (!auth.isLoading()) return evaluate();

    return toObservable(auth.isLoading).pipe(
      filter(loading => !loading),
      take(1),
      map(() => evaluate()),
    );
  };
