import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../../core/auth/auth.service';
import { SeoService } from '../../../core/services/seo.service';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let authSpy: jasmine.SpyObj<AuthService>;
  let seoSpy: jasmine.SpyObj<SeoService>;

  beforeEach(() => {
    authSpy = jasmine.createSpyObj('AuthService', ['signUp']);
    authSpy.signUp.and.returnValue(Promise.resolve({ error: null }));

    seoSpy = jasmine.createSpyObj('SeoService', ['setPageI18n', 'injectWebSiteJsonLd']);

    jasmine.clock().install();

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
    jasmine.clock().uninstall();
  });

  it('sets SEO in constructor', () => {
    expect(seoSpy.setPageI18n).toHaveBeenCalledWith('SEO.register_title');
  });

  it('form is visible after 700ms', () => {
    expect(component.formVisible()).toBeFalse();
    jasmine.clock().tick(701);
    expect(component.formVisible()).toBeTrue();
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
      expect(component['passwordStrength']()).toBeNull();
    });

    it('returns weak for short password', () => {
      component.form.controls.password.setValue('abc');
      expect(component['passwordStrength']()).toBe('weak');
    });

    it('returns weak for 8+ chars with no special criteria', () => {
      component.form.controls.password.setValue('abcdefgh');
      expect(component['passwordStrength']()).toBe('weak');
    });

    it('returns medium for 8+ chars with one criterion', () => {
      component.form.controls.password.setValue('abcdefg1');
      expect(component['passwordStrength']()).toBe('medium');
    });

    it('returns strong for 8+ chars with two or more criteria', () => {
      component.form.controls.password.setValue('Abcdefg1!');
      expect(component['passwordStrength']()).toBe('strong');
    });
  });

  describe('passwordMatchValidator', () => {
    it('sets passwordMismatch error when passwords differ', () => {
      component.form.controls.password.setValue('password1');
      component.form.controls.confirmPassword.setValue('password2');
      component.form.controls.confirmPassword.markAsTouched();
      expect(component.form.hasError('passwordMismatch')).toBeTrue();
    });

    it('clears passwordMismatch when passwords match', () => {
      component.form.controls.password.setValue('password1');
      component.form.controls.confirmPassword.setValue('password1');
      expect(component.form.hasError('passwordMismatch')).toBeFalse();
    });
  });

  describe('onSubmit', () => {
    it('marks form as touched when invalid and does not call signUp', async () => {
      await component.onSubmit();
      expect(component.form.touched).toBeTrue();
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
      expect(component.successMessage()).toBeTrue();
      expect(component.bookOpen()).toBeTrue();
      expect(component.errorMessage()).toBeNull();
    });

    it('sets errorMessage on failure', async () => {
      authSpy.signUp.and.returnValue(Promise.resolve({ error: 'Email already exists' }));
      component.form.setValue({
        displayName: 'Ada Lovelace',
        email: 'ada@test.com',
        password: 'Password1!',
        confirmPassword: 'Password1!',
        role: 'user',
      });
      await component.onSubmit();
      expect(component.errorMessage()).toBe('Email already exists');
      expect(component.successMessage()).toBeFalse();
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
      expect(component.isSubmitting()).toBeFalse();
    });
  });
});
