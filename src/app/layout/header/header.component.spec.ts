import { TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, provideZonelessChangeDetection, signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { HeaderComponent } from './header.component';
import { AuthService } from '../../core/auth/auth.service';
import { of } from 'rxjs';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let authSpy: jasmine.SpyObj<AuthService>;
  let translateSpy: jasmine.SpyObj<TranslateService>;

  beforeEach(() => {
    authSpy = jasmine.createSpyObj('AuthService', ['signOut'], {
      isAuthenticated: signal(false),
      currentUser: signal(null),
    });
    authSpy.signOut.and.returnValue(Promise.resolve());

    translateSpy = jasmine.createSpyObj('TranslateService', ['use', 'instant'], {
      onLangChange: of({ lang: 'uk' }),
      currentLang: 'uk',
    });
    translateSpy.use.and.returnValue(of('en') as unknown as ReturnType<typeof translateSpy.use>);
    translateSpy.instant.and.callFake((key: string) => key);

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
      authSpy = jasmine.createSpyObj('AuthService', ['signOut'], {
        isAuthenticated: signal(true),
        currentUser: signal({ id: 'u1', displayName: 'Alice Bob', role: 'user', avatarUrl: null, createdAt: '' }),
      });
      authSpy.signOut.and.returnValue(Promise.resolve());

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
