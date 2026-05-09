import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../core/auth/auth.service';
import { UserRole } from '../../../core/models/user.model';
import { BookIntroComponent } from '../../../shared/components/book-intro/book-intro.component';
import { SeoService } from '../../../core/services/seo.service';
import { HlmFieldImports } from '../../../shared/spartan/field/src';
import { HlmInput } from '../../../shared/spartan/input/src';
import { HlmButton } from '../../../shared/spartan/button/src';
import { HlmSpinner } from '../../../shared/spartan/spinner/src';

const passwordMatchValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const password = group.get('password')?.value as string;
  const confirmPassword = group.get('confirmPassword')?.value as string;
  return password === confirmPassword ? null : { passwordMismatch: true };
};

interface RegisterForm {
  displayName: FormControl<string>;
  email: FormControl<string>;
  password: FormControl<string>;
  confirmPassword: FormControl<string>;
  role: FormControl<UserRole>;
}

@Component({
  selector: 'app-register',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, TranslateModule, BookIntroComponent, ...HlmFieldImports, HlmInput, HlmButton, HlmSpinner],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private readonly auth = inject(AuthService);
  private readonly seo = inject(SeoService);

  readonly errorMessage = signal<string | null>(null);
  readonly isSubmitting = signal(false);
  readonly successMessage = signal(false);
  readonly registeredEmail = signal('');
  readonly registeredName = signal('');
  readonly selectedRole = signal<UserRole>('user');
  /** Triggers book opening animation on successful registration. */
  readonly bookOpen = signal(false);
  /** Delays form appearance until book entrance settles (~700ms). */
  readonly formVisible = signal(false);

  constructor() {
    this.seo.setPageI18n('SEO.register_title');
    setTimeout(() => this.formVisible.set(true), 700);
  }

  onBookAnimationDone(): void {
    // Book animation done; success message is already visible
  }

  readonly form = new FormGroup<RegisterForm>(
    {
      displayName: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(2)],
      }),
      email: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.email],
      }),
      password: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(8)],
      }),
      confirmPassword: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      role: new FormControl<UserRole>('user', {
        nonNullable: true,
        validators: [Validators.required],
      }),
    },
    { validators: passwordMatchValidator },
  );

  private readonly _passwordValue = toSignal(this.form.controls.password.valueChanges, {
    initialValue: '',
  });

  readonly passwordStrength = computed<'weak' | 'medium' | 'strong' | null>(() => {
    const pw = this._passwordValue();
    if (!pw || pw.length === 0) return null;
    if (pw.length < 8) return 'weak';
    const hasUpper = /[A-Z]/.test(pw);
    const hasNumber = /\d/.test(pw);
    const hasSpecial = /[^A-Za-z0-9]/.test(pw);
    const score = [hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
    if (score >= 2) return 'strong';
    if (score === 1) return 'medium';
    return 'weak';
  });

  setRole(role: UserRole): void {
    this.selectedRole.set(role);
    this.form.controls.role.setValue(role);
    this.form.controls.role.markAsTouched();
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const { displayName, email, password, role } = this.form.getRawValue();
    const { error } = await this.auth.signUp(email, password, displayName, role);

    this.isSubmitting.set(false);

    if (error) {
      this.errorMessage.set(error);
    } else {
      this.registeredEmail.set(email);
      this.registeredName.set(displayName);
      this.successMessage.set(true);
      // Trigger book opening animation on success
      this.bookOpen.set(true);
    }
  }
}
