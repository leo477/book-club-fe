import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { UrlTree, provideRouter } from '@angular/router';
import { Observable } from 'rxjs';
import { authGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

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
      expect(runGuard()).toBeTrue();
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
      const result = runGuard();
      expect(result instanceof UrlTree).toBeTrue();
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

    it('returns an observable that resolves to true after loading', (done) => {
      (runGuard() as Observable<boolean | UrlTree>).subscribe((val) => {
        expect(val).toBeTrue();
        done();
      });
      loadingSignal.set(false);
    });

    it('returns UrlTree after loading when not authenticated', (done) => {
      authSignal.set(false);
      (runGuard() as Observable<boolean | UrlTree>).subscribe((val) => {
        expect(val instanceof UrlTree).toBeTrue();
        done();
      });
      loadingSignal.set(false);
    });
  });
});
