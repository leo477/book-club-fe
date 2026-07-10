import { Component, ChangeDetectionStrategy, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { toast } from '@spartan-ng/brain/sonner';
import { AuthService } from '../../../core/auth/auth.service';
import { HlmSpinner } from '../../../shared/spartan/spinner/src';

/**
 * Landing route after the backend completes the Google OAuth exchange. The
 * backend redirects here with a one-time `code` query param, which we
 * exchange for the access token (and, during rollout, the auth cookies);
 * an absent code is treated as a failed OAuth attempt.
 */
@Component({
  selector: 'app-oauth-callback',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule, HlmSpinner],
  template: `
    <div class="min-h-screen flex flex-col items-center justify-center gap-4">
      <hlm-spinner />
      <p class="text-muted-foreground">{{ 'AUTH.signing_in' | translate }}</p>
    </div>
  `,
})
export class OAuthCallbackComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly translate = inject(TranslateService);

  async ngOnInit(): Promise<void> {
    const code = this.route.snapshot.queryParamMap.get('code');
    // Strip the one-time code from the URL/history before exchanging or
    // redirecting so it isn't retained in browser history or leaked via Referer.
    history.replaceState({}, '', '/auth/callback');
    const { error } = code
      ? await this.auth.exchangeOAuthCode(code)
      : { error: 'OAUTH_FAILED' };
    if (error) {
      toast.error(this.translate.instant('AUTH.oauth_failed') as string);
      await this.router.navigate(['/login']);
      return;
    }
    await this.router.navigate(['/events']);
  }
}
