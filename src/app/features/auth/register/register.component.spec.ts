import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../../core/auth/auth.service';
import { SeoService } from '../../../core/services/seo.service';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let authSpy: { signUp: ReturnType<typeof vi.fn>; isAuthenticated: ReturnType<typeof vi.fn> };
  let seoSpy: { setPageI18n: ReturnType<typeof vi.fn>; injectWebSiteJsonLd: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    authSpy = { signUp: vi.fn().mockResolvedValue({ error: null }), isAuthenticated: vi.fn().mockReturnValue(false) };
    seoSpy = { setPageI18n: vi.fn(), injectWebSiteJsonLd: vi.fn() };

    vi.useFakeTimers();

    TestBed.configureTestingModule({
      imports: [RegisterComponent, TranslateModule.forRoot()],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: AuthService, useValue: authSpy },
        { provide: SeoService, useValue: seoSpy },
      ],
    });

    const fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('sets SEO in constructor', () => {
    expect(seoSpy.setPageI18n).toHaveBeenCalledWith('SEO.register_title');
  });

  it('form is visible after 700ms', () => {
    expect(component.formVisible()).toBe(false);
    vi.advanceTimersByTime(701);
    expect(component.formVisible()).toBe(true);
  });

  describe('setRole', () => {
    it('updates selectedRole signal and form control', () => {
      component.setRole('organizer');
      expect(component.selectedRole()).toBe('organizer');
      expect(component.form.controls.role.value).toBe('organizer');
    });

    it('defaults to user role', () => {
      expect(component.selectedRole()).toBe('user');
      expect(component.form.controls.role.value).toBe('user');
    });
  });

  describe('passwordStrength', () => {
    it('returns null for empty password', () => {
      component.form.controls.password.setValue('');
      expect(component.passwordStrength()).toBeNull();
    });

    it('returns weak for short password', () => {
      component.form.controls.password.setValue('abc');
      expect(component.passwordStrength()).toBe('weak');
    });

    it('returns weak for 8+ chars with no special criteria', () => {
      component.form.controls.password.setValue('abcdefgh');
      expect(component.passwordStrength()).toBe('weak');
    });

    it('returns medium for 8+ chars with one criterion', () => {
      component.form.controls.password.setValue('abcdefg1');
      expect(component.passwordStrength()).toBe('medium');
    });

    it('returns strong for 8+ chars with two or more criteria', () => {
      component.form.controls.password.setValue('Abcdefg1!');
      expect(component.passwordStrength()).toBe('strong');
    });
  });

  describe('passwordMatchValidator', () => {
    it('sets passwordMismatch error when passwords differ', () => {
      component.form.controls.password.setValue('password1');
      component.form.controls.confirmPassword.setValue('password2');
      component.form.controls.confirmPassword.markAsTouched();
      expect(component.form.hasError('passwordMismatch')).toBe(true);
    });

    it('clears passwordMismatch when passwords match', () => {
      component.form.controls.password.setValue('password1');
      component.form.controls.confirmPassword.setValue('password1');
      expect(component.form.hasError('passwordMismatch')).toBe(false);
    });
  });

  describe('onSubmit', () => {
    it('marks form as touched when invalid and does not call signUp', async () => {
      await component.onSubmit();
      expect(component.form.touched).toBe(true);
      expect(authSpy.signUp).not.toHaveBeenCalled();
    });

    it('calls signUp with form values on valid submit', async () => {
      component.form.setValue({
        displayName: 'Ada Lovelace',
        email: 'ada@test.com',
        password: 'Password1!',
        confirmPassword: 'Password1!',
        role: 'user',
      });
      await component.onSubmit();
      expect(authSpy.signUp).toHaveBeenCalledWith('ada@test.com', 'Password1!', 'Ada Lovelace', 'user');
    });

    it('sets successMessage and bookOpen on success', async () => {
      component.form.setValue({
        displayName: 'Ada Lovelace',
        email: 'ada@test.com',
        password: 'Password1!',
        confirmPassword: 'Password1!',
        role: 'user',
      });
      await component.onSubmit();
      expect(component.successMessage()).toBe(true);
      expect(component.bookOpen()).toBe(true);
      expect(component.errorMessage()).toBeNull();
    });

    it('sets errorMessage on failure', async () => {
      authSpy.signUp.mockReturnValue(Promise.resolve({ error: 'Email already exists' }));
      component.form.setValue({
        displayName: 'Ada Lovelace',
        email: 'ada@test.com',
        password: 'Password1!',
        confirmPassword: 'Password1!',
        role: 'user',
      });
      await component.onSubmit();
      expect(component.errorMessage()).toBe('Email already exists');
      expect(component.successMessage()).toBe(false);
    });

    it('resets isSubmitting after submission', async () => {
      component.form.setValue({
        displayName: 'Ada Lovelace',
        email: 'ada@test.com',
        password: 'Password1!',
        confirmPassword: 'Password1!',
        role: 'user',
      });
      await component.onSubmit();
      expect(component.isSubmitting()).toBe(false);
    });
  });
});
