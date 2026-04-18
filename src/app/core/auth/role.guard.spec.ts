import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { UrlTree, provideRouter } from '@angular/router';
import { Observable } from 'rxjs';
import { roleGuard } from './role.guard';
import { AuthService } from './auth.service';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

function runGuard(role: 'organizer' | 'user') {
  return TestBed.runInInjectionContext(() =>
    roleGuard(role)(null as unknown as ActivatedRouteSnapshot, null as unknown as RouterStateSnapshot)
  );
}

describe('roleGuard', () => {
  describe('when not loading and role matches', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          provideZonelessChangeDetection(),
          provideRouter([]),
          {
            provide: AuthService,
            useValue: {
              isLoading: signal(false),
              userRole: signal('organizer'),
            },
          },
        ],
      });
    });

    it('returns true when role matches', () => {
      expect(runGuard('organizer')).toBeTrue();
    });
  });

  describe('when not loading and role does not match', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          provideZonelessChangeDetection(),
          provideRouter([]),
          {
            provide: AuthService,
            useValue: {
              isLoading: signal(false),
              userRole: signal('user'),
            },
          },
        ],
      });
    });

    it('returns UrlTree to /clubs when role does not match', () => {
      const result = runGuard('organizer');
      expect(result instanceof UrlTree).toBeTrue();
      expect((result as UrlTree).toString()).toBe('/clubs');
    });
  });

  describe('when loading then resolves', () => {
    let loadingSignal: ReturnType<typeof signal<boolean>>;
    let roleSignal: ReturnType<typeof signal<string>>;

    beforeEach(() => {
      loadingSignal = signal(true);
      roleSignal = signal('organizer');
      TestBed.configureTestingModule({
        providers: [
          provideZonelessChangeDetection(),
          provideRouter([]),
          {
            provide: AuthService,
            useValue: {
              isLoading: loadingSignal,
              userRole: roleSignal,
            },
          },
        ],
      });
    });

    it('resolves to true after loading when role matches', (done) => {
      (runGuard('organizer') as Observable<boolean | UrlTree>).subscribe((val) => {
        expect(val).toBeTrue();
        done();
      });
      loadingSignal.set(false);
    });

    it('resolves to UrlTree after loading when role does not match', (done) => {
      roleSignal.set('user');
      (runGuard('organizer') as Observable<boolean | UrlTree>).subscribe((val) => {
        expect(val instanceof UrlTree).toBeTrue();
        done();
      });
      loadingSignal.set(false);
    });
  });
});
