import { Component, ChangeDetectionStrategy, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { toast } from '@spartan-ng/brain/sonner';
import { AuthService } from '../../../core/auth/auth.service';
import { HlmSpinner } from '../../../shared/spartan/spinner/src';

/**
 * Landing route after the backend completes the Google OAuth exchange. The
 * refresh cookie is already set server-side; here we restore the session and
 * route the user onward.
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
  private readonly translate = inject(TranslateService);

  async ngOnInit(): Promise<void> {
    const { error } = await this.auth.completeOAuthSession();
    if (error) {
      toast.error(this.translate.instant('AUTH.oauth_failed') as string);
      await this.router.navigate(['/login']);
      return;
    }
    await this.router.navigate(['/events']);
  }
}
