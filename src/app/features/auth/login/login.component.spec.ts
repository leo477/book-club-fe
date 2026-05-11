import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../core/auth/auth.service';
import { SeoService } from '../../../core/services/seo.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let authSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let seoSpy: jasmine.SpyObj<SeoService>;

  beforeEach(() => {
    authSpy = jasmine.createSpyObj('AuthService', ['signIn']);
    authSpy.signIn.and.returnValue(Promise.resolve({ error: null }));

    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    seoSpy = jasmine.createSpyObj('SeoService', ['setPageI18n', 'injectWebSiteJsonLd']);

    jasmine.clock().install();

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
    jasmine.clock().uninstall();
  });

  it('sets SEO in constructor', () => {
    expect(seoSpy.setPageI18n).toHaveBeenCalledWith('SEO.login_title');
  });

  it('form is visible after 700ms', () => {
    expect(component.formVisible()).toBeFalse();
    jasmine.clock().tick(701);
    expect(component.formVisible()).toBeTrue();
  });

  describe('onBookAnimationDone', () => {
    it('navigates to /clubs', () => {
      component.onBookAnimationDone();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/clubs']);
    });
  });

  describe('onSubmit', () => {
    it('marks form as touched when invalid', async () => {
      component.form.controls.email.setValue('');
      component.form.controls.password.setValue('');
      await component.onSubmit();
      expect(component.form.touched).toBeTrue();
      expect(authSpy.signIn).not.toHaveBeenCalled();
    });

    it('calls signIn with valid form and sets bookOpen on success', async () => {
      component.form.setValue({ email: 'test@test.com', password: 'password123' });
      await component.onSubmit();
      expect(authSpy.signIn).toHaveBeenCalledWith('test@test.com', 'password123');
      expect(component.bookOpen()).toBeTrue();
      expect(component.errorMessage()).toBeNull();
    });

    it('sets errorMessage when signIn fails', async () => {
      authSpy.signIn.and.returnValue(Promise.resolve({ error: 'Invalid credentials' }));
      component.form.setValue({ email: 'test@test.com', password: 'password123' });
      await component.onSubmit();
      expect(component.errorMessage()).toBe('AUTH.error_invalid_credentials');
      expect(component.bookOpen()).toBeFalse();
    });

    it('resets isSubmitting after submission', async () => {
      component.form.setValue({ email: 'test@test.com', password: 'password123' });
      await component.onSubmit();
      expect(component.isSubmitting()).toBeFalse();
    });
  });
});
