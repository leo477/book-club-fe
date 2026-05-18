import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../core/auth/auth.service';
import { BookIntroComponent } from '../../../shared/components/book-intro/book-intro.component';
import { SeoService } from '../../../core/services/seo.service';
import { HlmFieldImports } from '../../../shared/spartan/field/src';
import { HlmInput } from '../../../shared/spartan/input/src';
import { HlmButton } from '../../../shared/spartan/button/src';
import { HlmSpinner } from '../../../shared/spartan/spinner/src';

interface LoginForm {
  email: FormControl<string>;
  password: FormControl<string>;
}

@Component({
  selector: 'app-login',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, TranslateModule, BookIntroComponent, ...HlmFieldImports, HlmInput, HlmButton, HlmSpinner],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly seo = inject(SeoService);
  private readonly translate = inject(TranslateService);

  readonly errorMessage = signal<string | null>(null);
  readonly isSubmitting = signal(false);
  /** Triggers book opening animation on successful login. */
  readonly bookOpen = signal(false);
  /** Delays form appearance until book entrance settles (~700ms). */
  readonly formVisible = signal(false);

  constructor() {
    this.seo.setPageI18n('SEO.login_title');
    setTimeout(() => this.formVisible.set(true), 300);
  }

  onBookAnimationDone(): void {
    this.router.navigate(['/clubs']);
  }

  readonly form = new FormGroup<LoginForm>({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(8)],
    }),
  });

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const { email, password } = this.form.getRawValue();
    const { error } = await this.auth.signIn(email, password);

    this.isSubmitting.set(false);

    if (error) {
      const translatedError = error === 'Invalid credentials'
        ? this.translate.instant('AUTH.error_invalid_credentials')
        : error;
      this.errorMessage.set(translatedError);
    } else {
      // Trigger book animation; navigate in onBookAnimationDone()
      this.bookOpen.set(true);
    }
  }
}
