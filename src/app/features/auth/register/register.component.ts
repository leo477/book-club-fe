import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { UserRole } from '../../../core/models/user.model';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';

interface RegisterForm {
  displayName: FormControl<string>;
  email: FormControl<string>;
  password: FormControl<string>;
  role: FormControl<UserRole>;
}

@Component({
  selector: 'app-register',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, FormFieldComponent],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div class="w-full max-w-md">

        <!-- Logo / Brand -->
        <div class="text-center mb-8">
          <h1 class="font-display text-3xl font-bold text-gray-900 dark:text-white">📚 Book Club</h1>
          <p class="text-gray-500 dark:text-gray-400 mt-2">Create your account</p>
        </div>

        @if (successMessage()) {
          <!-- Success state -->
          <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 text-center">
            <div class="text-5xl mb-4">📬</div>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">Check your email</h2>
            <p class="text-gray-500 dark:text-gray-400 text-sm">
              We sent a confirmation link to <strong>{{ registeredEmail() }}</strong>.
              Click it to activate your account.
            </p>
            <a routerLink="/login"
               class="mt-6 inline-block text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium">
              Back to sign in
            </a>
          </div>

        } @else {
          <!-- Registration card -->
          <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">Create account</h2>

            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4" novalidate>

              <!-- Display name -->
              <app-form-field
                label="Display name"
                type="text"
                placeholder="Ada Lovelace"
                [control]="form.controls.displayName"
              />

              <!-- Email -->
              <app-form-field
                label="Email"
                type="email"
                placeholder="you@example.com"
                [control]="form.controls.email"
              />

              <!-- Password -->
              <app-form-field
                label="Password"
                type="password"
                placeholder="At least 8 characters"
                [control]="form.controls.password"
              />

              <!-- Role selector -->
              <div class="flex flex-col gap-1.5">
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">I want to…</span>
                <div class="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    (click)="setRole('user')"
                    [class.ring-2]="selectedRole() === 'user'"
                    [class.ring-primary-500]="selectedRole() === 'user'"
                    [class.bg-primary-50]="selectedRole() === 'user'"
                    [class.dark:bg-primary-900]="selectedRole() === 'user'"
                    [class.bg-gray-50]="selectedRole() !== 'user'"
                    [class.hover:bg-gray-100]="selectedRole() !== 'user'"
                    class="p-4 rounded-xl border border-gray-200 dark:border-gray-700 text-left transition-all focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <div class="text-2xl mb-1">📖</div>
                    <div class="font-medium text-sm text-gray-900 dark:text-white">Reader</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">Join clubs &amp; take quizzes</div>
                  </button>

                  <button
                    type="button"
                    (click)="setRole('organizer')"
                    [class.ring-2]="selectedRole() === 'organizer'"
                    [class.ring-primary-500]="selectedRole() === 'organizer'"
                    [class.bg-primary-50]="selectedRole() === 'organizer'"
                    [class.dark:bg-primary-900]="selectedRole() === 'organizer'"
                    [class.bg-gray-50]="selectedRole() !== 'organizer'"
                    [class.hover:bg-gray-100]="selectedRole() !== 'organizer'"
                    class="p-4 rounded-xl border border-gray-200 dark:border-gray-700 text-left transition-all focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <div class="text-2xl mb-1">🎯</div>
                    <div class="font-medium text-sm text-gray-900 dark:text-white">Organizer</div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">Create clubs &amp; build quizzes</div>
                  </button>
                </div>

                @if (form.controls.role.invalid && form.controls.role.touched) {
                  <p class="text-xs text-red-500 mt-0.5">Please select a role.</p>
                }
              </div>

              <!-- Error alert -->
              @if (errorMessage()) {
                <div class="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
                  <span class="mt-0.5 shrink-0">⚠️</span>
                  <span>{{ errorMessage() }}</span>
                </div>
              }

              <!-- Submit button -->
              <button
                type="submit"
                [disabled]="isSubmitting()"
                class="w-full flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5
                       text-sm font-semibold text-white shadow-sm
                       hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                       disabled:opacity-60 disabled:cursor-not-allowed
                       transition-colors duration-200 mt-2"
              >
                @if (isSubmitting()) {
                  <svg class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  Creating account…
                } @else {
                  Create account
                }
              </button>
            </form>

            <p class="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
              Already have an account?
              <a routerLink="/login" class="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium">
                Sign in
              </a>
            </p>
          </div>
        }
      </div>
    </div>
  `,
})
export class RegisterComponent {
  private readonly auth = inject(AuthService);

  readonly errorMessage = signal<string | null>(null);
  readonly isSubmitting = signal(false);
  readonly successMessage = signal(false);
  readonly registeredEmail = signal('');
  readonly selectedRole = signal<UserRole>('user');

  readonly form = new FormGroup<RegisterForm>({
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
    role: new FormControl<UserRole>('user', {
      nonNullable: true,
      validators: [Validators.required],
    }),
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
      this.successMessage.set(true);
    }
  }
}
