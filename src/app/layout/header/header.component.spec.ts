import { TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, provideZonelessChangeDetection, signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { HeaderComponent } from './header.component';
import { AuthService } from '../../core/auth/auth.service';
import { of } from 'rxjs';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let authSpy: { signOut: ReturnType<typeof vi.fn>; isAuthenticated: ReturnType<typeof signal>; currentUser: ReturnType<typeof signal> };
  let translateSpy: { use: ReturnType<typeof vi.fn>; instant: ReturnType<typeof vi.fn>; onLangChange: unknown; getCurrentLang: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    authSpy = {
      signOut: vi.fn().mockResolvedValue(undefined),
      isAuthenticated: signal(false),
      currentUser: signal(null),
    };

    translateSpy = {
      use: vi.fn().mockReturnValue(of('en')),
      instant: vi.fn().mockImplementation((key: string) => key),
      onLangChange: of({ lang: 'uk' }),
      getCurrentLang: vi.fn().mockReturnValue('uk'),
    };

    TestBed.configureTestingModule({
      imports: [HeaderComponent, TranslateModule.forRoot()],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: AuthService, useValue: authSpy },
        { provide: TranslateService, useValue: translateSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    // HlmSheetContent requires EXPOSES_STATE_TOKEN from a parent BrnSheetComponent.
    // Override the template so no sheet directives are instantiated in tests.
    TestBed.overrideTemplate(HeaderComponent, '<div></div>');

    const fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
  });

  describe('signOut', () => {
    it('calls auth.signOut', async () => {
      await component.signOut();
      expect(authSpy.signOut).toHaveBeenCalled();
    });
  });

  describe('switchLang', () => {
    it('switches from uk to en', () => {
      component.switchLang();
      expect(translateSpy.use).toHaveBeenCalledWith('en');
    });
  });

  describe('userInitials', () => {
    it('returns ? when no user', () => {
      expect(component.userInitials()).toBe('?');
    });

    it('returns initials from display name', () => {
      authSpy = {
        signOut: vi.fn().mockResolvedValue(undefined),
        isAuthenticated: signal(true),
        currentUser: signal({ id: 'u1', displayName: 'Alice Bob', role: 'user', avatarUrl: null, createdAt: '' }),
      };

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [HeaderComponent, TranslateModule.forRoot()],
        providers: [
          provideZonelessChangeDetection(),
          provideRouter([]),
          { provide: AuthService, useValue: authSpy },
          { provide: TranslateService, useValue: translateSpy },
        ],
        schemas: [NO_ERRORS_SCHEMA],
      });
      TestBed.overrideTemplate(HeaderComponent, '<div></div>');
      const fixture = TestBed.createComponent(HeaderComponent);
      expect(fixture.componentInstance.userInitials()).toBe('AB');
    });
  });
});
