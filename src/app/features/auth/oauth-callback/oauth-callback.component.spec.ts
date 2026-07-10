import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { OAuthCallbackComponent } from './oauth-callback.component';
import { AuthService } from '../../../core/auth/auth.service';

function makeAuthService() {
  return {
    exchangeOAuthCode: vi.fn().mockResolvedValue({ error: null }),
  };
}

function makeActivatedRoute(code: string | null) {
  return {
    snapshot: {
      queryParamMap: { get: (key: string) => (key === 'code' ? code : null) },
    },
  };
}

describe('OAuthCallbackComponent', () => {
  let authSvc: ReturnType<typeof makeAuthService>;
  let router: Router;

  async function setup(code: string | null = null) {
    authSvc = makeAuthService();
    await TestBed.configureTestingModule({
      imports: [OAuthCallbackComponent, TranslateModule.forRoot()],
      providers: [
        provideZonelessChangeDetection(),
        { provide: AuthService, useValue: authSvc },
        { provide: ActivatedRoute, useValue: makeActivatedRoute(code) },
      ],
    }).compileComponents();
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    vi.spyOn(history, 'replaceState').mockImplementation(() => undefined);
    const fixture = TestBed.createComponent(OAuthCallbackComponent);
    await fixture.componentInstance.ngOnInit();
    return { fixture };
  }

  it('strips the code from history before exchanging it', async () => {
    await setup('the-code');
    expect(history.replaceState).toHaveBeenCalledWith({}, '', '/auth/callback');
  });

  it('exchanges the code when present in the query params', async () => {
    await setup('the-code');
    expect(authSvc.exchangeOAuthCode).toHaveBeenCalledWith('the-code');
  });

  it('treats a missing code as a failed OAuth attempt and navigates to /login', async () => {
    await setup(null);
    expect(authSvc.exchangeOAuthCode).not.toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('navigates to /events on success', async () => {
    await setup('the-code');
    expect(router.navigate).toHaveBeenCalledWith(['/events']);
  });

  it('navigates to /login and shows a toast on failure', async () => {
    authSvc = makeAuthService();
    authSvc.exchangeOAuthCode.mockResolvedValue({ error: 'oauth_denied' });
    await TestBed.configureTestingModule({
      imports: [OAuthCallbackComponent, TranslateModule.forRoot()],
      providers: [
        provideZonelessChangeDetection(),
        { provide: AuthService, useValue: authSvc },
        { provide: ActivatedRoute, useValue: makeActivatedRoute('bad-code') },
      ],
    }).compileComponents();
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    vi.spyOn(history, 'replaceState').mockImplementation(() => undefined);
    const fixture = TestBed.createComponent(OAuthCallbackComponent);

    await fixture.componentInstance.ngOnInit();

    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
