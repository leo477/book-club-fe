import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal } from '@angular/core';
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
    translateSpy.use.and.returnValue(of('en') as any);
    translateSpy.instant.and.callFake((key: string) => key);

    TestBed.configureTestingModule({
      imports: [HeaderComponent, TranslateModule.forRoot()],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: AuthService, useValue: authSpy },
        { provide: TranslateService, useValue: translateSpy },
      ],
    });

    const fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
  });

  it('starts with menu and dropdown closed', () => {
    expect(component.isMenuOpen()).toBeFalse();
    expect(component.isDropdownOpen()).toBeFalse();
  });

  describe('toggleMenu', () => {
    it('opens menu', () => {
      component.toggleMenu();
      expect(component.isMenuOpen()).toBeTrue();
    });

    it('closes menu when toggled again', () => {
      component.toggleMenu();
      component.toggleMenu();
      expect(component.isMenuOpen()).toBeFalse();
    });

    it('closes dropdown when opening menu', () => {
      component.isDropdownOpen.set(true);
      component.toggleMenu();
      expect(component.isDropdownOpen()).toBeFalse();
    });
  });

  describe('toggleDropdown', () => {
    it('opens dropdown', () => {
      component.toggleDropdown();
      expect(component.isDropdownOpen()).toBeTrue();
    });

    it('closes dropdown when toggled again', () => {
      component.toggleDropdown();
      component.toggleDropdown();
      expect(component.isDropdownOpen()).toBeFalse();
    });
  });

  describe('closeDropdown', () => {
    it('closes dropdown', () => {
      component.isDropdownOpen.set(true);
      component.closeDropdown();
      expect(component.isDropdownOpen()).toBeFalse();
    });
  });

  describe('signOut', () => {
    it('calls auth.signOut and closes menu', async () => {
      component.isMenuOpen.set(true);
      component.isDropdownOpen.set(true);
      await component.signOut();
      expect(authSpy.signOut).toHaveBeenCalled();
      expect(component.isMenuOpen()).toBeFalse();
      expect(component.isDropdownOpen()).toBeFalse();
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
      });
      const fixture = TestBed.createComponent(HeaderComponent);
      expect(fixture.componentInstance.userInitials()).toBe('AB');
    });
  });
});
