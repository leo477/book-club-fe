import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../core/auth/auth.service';
import { SeoService } from '../../../core/services/seo.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let authSpy: { signIn: ReturnType<typeof vi.fn> };
  let routerSpy: { navigate: ReturnType<typeof vi.fn> };
  let seoSpy: { setPageI18n: ReturnType<typeof vi.fn>; injectWebSiteJsonLd: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    authSpy = { signIn: vi.fn().mockResolvedValue({ error: null }) };
    routerSpy = { navigate: vi.fn() };
    seoSpy = { setPageI18n: vi.fn(), injectWebSiteJsonLd: vi.fn() };

    vi.useFakeTimers();

    TestBed.configureTestingModule({
      imports: [LoginComponent, TranslateModule.forRoot()],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpy },
        { provide: SeoService, useValue: seoSpy },
      ],
    });

    const fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('sets SEO in constructor', () => {
    expect(seoSpy.setPageI18n).toHaveBeenCalledWith('SEO.login_title');
  });

  it('form is visible after 700ms', () => {
    expect(component.formVisible()).toBe(false);
    vi.advanceTimersByTime(701);
    expect(component.formVisible()).toBe(true);
  });

  describe('onBookAnimationDone', () => {
    it('navigates to /events', () => {
      component.onBookAnimationDone();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/events']);
    });
  });

  describe('onSubmit', () => {
    it('marks form as touched when invalid', async () => {
      component.form.controls.email.setValue('');
      component.form.controls.password.setValue('');
      await component.onSubmit();
      expect(component.form.touched).toBe(true);
      expect(authSpy.signIn).not.toHaveBeenCalled();
    });

    it('calls signIn with valid form and sets bookOpen on success', async () => {
      component.form.setValue({ email: 'test@test.com', password: 'password123' });
      await component.onSubmit();
      expect(authSpy.signIn).toHaveBeenCalledWith('test@test.com', 'password123');
      expect(component.bookOpen()).toBe(true);
      expect(component.errorMessage()).toBeNull();
    });

    it('sets errorMessage when signIn fails', async () => {
      authSpy.signIn.mockReturnValue(Promise.resolve({ error: 'Invalid credentials' }));
      component.form.setValue({ email: 'test@test.com', password: 'password123' });
      await component.onSubmit();
      expect(component.errorMessage()).toBe('AUTH.error_invalid_credentials');
      expect(component.bookOpen()).toBe(false);
    });

    it('resets isSubmitting after submission', async () => {
      component.form.setValue({ email: 'test@test.com', password: 'password123' });
      await component.onSubmit();
      expect(component.isSubmitting()).toBe(false);
    });
  });
});
