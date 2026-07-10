import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { UrlTree, provideRouter } from '@angular/router';
import { Observable } from 'rxjs';
import { authGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

// eslint-disable-next-line rxjs-x/finnish
function runGuard() {
  return TestBed.runInInjectionContext(() =>
    authGuard(null as unknown as ActivatedRouteSnapshot, null as unknown as RouterStateSnapshot)
  );
}

describe('authGuard', () => {
  describe('when not loading', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          provideZonelessChangeDetection(),
          provideRouter([]),
          {
            provide: AuthService,
            useValue: {
              isLoading: signal(false),
              isAuthenticated: signal(true),
            },
          },
        ],
      });
    });

    it('returns true when authenticated', () => {
      expect(runGuard()).toBe(true);
    });
  });

  describe('when not loading and not authenticated', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          provideZonelessChangeDetection(),
          provideRouter([]),
          {
            provide: AuthService,
            useValue: {
              isLoading: signal(false),
              isAuthenticated: signal(false),
            },
          },
        ],
      });
    });

    it('returns UrlTree to /login when not authenticated', () => {
      // eslint-disable-next-line rxjs-x/finnish
      const result = runGuard();
      expect(result).toBeInstanceOf(UrlTree);
      expect((result as UrlTree).toString()).toBe('/login');
    });
  });

  describe('when loading then resolves', () => {
    let loadingSignal: ReturnType<typeof signal<boolean>>;
    let authSignal: ReturnType<typeof signal<boolean>>;

    beforeEach(() => {
      loadingSignal = signal(true);
      authSignal = signal(true);
      TestBed.configureTestingModule({
        providers: [
          provideZonelessChangeDetection(),
          provideRouter([]),
          {
            provide: AuthService,
            useValue: {
              isLoading: loadingSignal,
              isAuthenticated: authSignal,
            },
          },
        ],
      });
    });

    it('returns an observable that resolves to true after loading', () =>
      new Promise<void>((resolve) => {
        (runGuard() as Observable<boolean | UrlTree>).subscribe((val) => {
          expect(val).toBe(true);
          resolve();
        });
        loadingSignal.set(false);
      }));

    it('returns UrlTree after loading when not authenticated', () =>
      new Promise<void>((resolve) => {
        authSignal.set(false);
        (runGuard() as Observable<boolean | UrlTree>).subscribe((val) => {
          expect(val).toBeInstanceOf(UrlTree);
          resolve();
        });
        loadingSignal.set(false);
      }));
  });
});
