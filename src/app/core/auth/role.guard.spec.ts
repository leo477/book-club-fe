import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { UrlTree, provideRouter } from '@angular/router';
import { Observable } from 'rxjs';
import { roleGuard } from './role.guard';
import { AuthService } from './auth.service';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

const mockTranslateService = {
  instant: (key: string) => key,
};

// eslint-disable-next-line rxjs-x/finnish
function runGuard(role: 'organizer' | 'user' | 'admin') {
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
          { provide: TranslateService, useValue: mockTranslateService },
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
      expect(runGuard('organizer')).toBe(true);
    });
  });

  describe('when not loading and role does not match', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          provideZonelessChangeDetection(),
          provideRouter([]),
          { provide: TranslateService, useValue: mockTranslateService },
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
      // eslint-disable-next-line rxjs-x/finnish
      const result = runGuard('organizer');
      expect(result instanceof UrlTree).toBe(true);
      expect((result as UrlTree).toString()).toBe('/clubs');
    });
  });

  describe('role hierarchy', () => {
    function configure(role: string) {
      TestBed.configureTestingModule({
        providers: [
          provideZonelessChangeDetection(),
          provideRouter([]),
          { provide: TranslateService, useValue: mockTranslateService },
          {
            provide: AuthService,
            useValue: { isLoading: signal(false), userRole: signal(role) },
          },
        ],
      });
    }

    it('admin satisfies an organizer-gated route', () => {
      configure('admin');
      expect(runGuard('organizer')).toBe(true);
    });

    it('rejects a non-admin from an admin-only route', () => {
      configure('organizer');
      const result = runGuard('admin');
      expect(result instanceof UrlTree).toBe(true);
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
          { provide: TranslateService, useValue: mockTranslateService },
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

    it('resolves to true after loading when role matches', () =>
      new Promise<void>((resolve) => {
        (runGuard('organizer') as Observable<boolean | UrlTree>).subscribe((val) => {
          expect(val).toBe(true);
          resolve();
        });
        loadingSignal.set(false);
      }));

    it('resolves to UrlTree after loading when role does not match', () =>
      new Promise<void>((resolve) => {
        roleSignal.set('user');
        (runGuard('organizer') as Observable<boolean | UrlTree>).subscribe((val) => {
          expect(val instanceof UrlTree).toBe(true);
          resolve();
        });
        loadingSignal.set(false);
      }));
  });
});
