import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  OnInit,
} from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ClubService } from '../../../core/services/club.service';
import { AuthService } from '../../../core/auth/auth.service';

interface CreateClubForm {
  name: FormControl<string>;
  description: FormControl<string>;
  isPublic: FormControl<boolean>;
}

@Component({
  selector: 'app-create-club',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div class="w-full max-w-lg">

        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="font-display text-3xl font-bold text-gray-900 dark:text-white">📚 Book Club</h1>
          <p class="text-gray-500 dark:text-gray-400 mt-2">Start a new reading community</p>
        </div>

        <!-- Card -->
        <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">Create a Club</h2>

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-5" novalidate>

            <!-- Name -->
            <div>
              <label for="club-name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Club Name <span class="text-red-500" aria-hidden="true">*</span>
              </label>
              <input
                id="club-name"
                type="text"
                formControlName="name"
                placeholder="e.g. The Midnight Readers"
                class="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800
                       px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400
                       focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                       transition-colors duration-150"
                [class.border-red-400]="form.controls.name.invalid && form.controls.name.touched"
                aria-describedby="name-error"
              />
              @if (form.controls.name.invalid && form.controls.name.touched) {
                <p id="name-error" class="mt-1 text-xs text-red-600 dark:text-red-400" role="alert">
                  @if (form.controls.name.errors?.['required']) { Club name is required. }
                  @else if (form.controls.name.errors?.['minlength']) { Name must be at least 3 characters. }
                </p>
              }
            </div>

            <!-- Description -->
            <div>
              <label for="club-description" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                id="club-description"
                formControlName="description"
                rows="3"
                placeholder="What will your club read? Who's it for?"
                class="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800
                       px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 resize-none
                       focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                       transition-colors duration-150"
              ></textarea>
            </div>

            <!-- Visibility toggle -->
            <div class="flex items-center justify-between rounded-xl bg-gray-50 dark:bg-gray-800 px-4 py-3">
              <div>
                <p class="text-sm font-medium text-gray-700 dark:text-gray-300">Public Club</p>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Anyone can discover and join</p>
              </div>
              <button
                type="button"
                role="switch"
                [attr.aria-checked]="form.controls.isPublic.value"
                (click)="togglePublic()"
                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                [class.bg-primary-600]="form.controls.isPublic.value"
                [class.bg-gray-300]="!form.controls.isPublic.value"
                [class.dark:bg-gray-600]="!form.controls.isPublic.value"
              >
                <span
                  class="inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200"
                  [class.translate-x-6]="form.controls.isPublic.value"
                  [class.translate-x-1]="!form.controls.isPublic.value"
                ></span>
              </button>
            </div>

            <!-- Error alert -->
            @if (errorMessage()) {
              <div
                class="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400"
                role="alert"
              >
                <span class="mt-0.5 shrink-0" aria-hidden="true">⚠️</span>
                <span>{{ errorMessage() }}</span>
              </div>
            }

            <!-- Actions -->
            <div class="flex gap-3 pt-2">
              <button
                type="button"
                (click)="cancel()"
                class="flex-1 rounded-xl border border-gray-300 dark:border-gray-600 px-4 py-2.5
                       text-sm font-semibold text-gray-700 dark:text-gray-300
                       hover:bg-gray-50 dark:hover:bg-gray-800
                       focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2
                       transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                [disabled]="isSubmitting()"
                class="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5
                       text-sm font-semibold text-white shadow-sm
                       hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                       disabled:opacity-60 disabled:cursor-not-allowed
                       transition-colors duration-200"
              >
                @if (isSubmitting()) {
                  <svg class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  Creating…
                } @else {
                  Create Club
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
})
export class CreateClubComponent {
  private readonly clubService = inject(ClubService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly errorMessage = signal<string | null>(null);
  readonly isSubmitting = signal(false);

  readonly form = new FormGroup<CreateClubForm>({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3)],
    }),
    description: new FormControl('', { nonNullable: true }),
    isPublic: new FormControl(true, { nonNullable: true }),
  });

  togglePublic(): void {
    const current = this.form.controls.isPublic.value;
    this.form.controls.isPublic.setValue(!current);
  }

  cancel(): void {
    this.router.navigate(['/clubs']);
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const { name, description, isPublic } = this.form.getRawValue();

    try {
      const club = await this.clubService.createClub({ name, description, isPublic });
      this.router.navigate(['/clubs', club.id]);
    } catch (err) {
      this.errorMessage.set(err instanceof Error ? err.message : 'Failed to create club');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
