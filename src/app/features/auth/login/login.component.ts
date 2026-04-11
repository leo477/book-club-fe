import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../core/auth/auth.service';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';
import { BookIntroComponent } from '../../../shared/components/book-intro/book-intro.component';
import { SeoService } from '../../../core/services/seo.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

interface LoginForm {
  email: FormControl<string>;
  password: FormControl<string>;
}

@Component({
  selector: 'app-login',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, FormFieldComponent, TranslateModule, BookIntroComponent, LoadingSpinnerComponent],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly seo = inject(SeoService);

  readonly errorMessage = signal<string | null>(null);
  readonly isSubmitting = signal(false);
  /** Triggers book opening animation on successful login. */
  readonly bookOpen = signal(false);
  /** Delays form appearance until book entrance settles (~700ms). */
  readonly formVisible = signal(false);

  constructor() {
    this.seo.setPage({ title: 'Вхід | Book Club' });
    setTimeout(() => this.formVisible.set(true), 700);
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
      this.errorMessage.set(error);
    } else {
      // Trigger book animation; navigate in onBookAnimationDone()
      this.bookOpen.set(true);
    }
  }
}
