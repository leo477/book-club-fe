import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { AbstractControl, FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-form-field',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <div class="flex flex-col gap-1">
      <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
        {{ label() }}
      </label>
      <input
        [type]="type()"
        [placeholder]="placeholder()"
        [formControl]="formControl()"
        class="w-full rounded-lg border px-4 py-2.5 text-sm text-gray-900 dark:text-white
               bg-white dark:bg-gray-800 placeholder-gray-400
               focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
               transition-colors duration-200"
        [class.border-red-500]="hasError()"
        [class.border-gray-300]="!hasError()"
        [class.dark:border-gray-600]="!hasError()"
      />
      @if (hasError()) {
        <p class="text-xs text-red-500 mt-0.5">{{ errorMessage() }}</p>
      }
    </div>
  `,
})
export class FormFieldComponent {
  readonly label = input.required<string>();
  readonly control = input.required<AbstractControl>();
  readonly type = input<'text' | 'email' | 'password'>('text');
  readonly placeholder = input('');

  /** Cast to FormControl for the [formControl] directive binding */
  readonly formControl = computed(() => this.control() as FormControl<string>);

  readonly hasError = computed(() => {
    const ctrl = this.control();
    return ctrl.invalid && ctrl.touched;
  });

  readonly errorMessage = computed(() => {
    const ctrl = this.control();
    if (!ctrl.errors) return '';
    if (ctrl.errors['required']) return 'This field is required.';
    if (ctrl.errors['email']) return 'Please enter a valid email address.';
    if (ctrl.errors['minlength']) {
      const req = (ctrl.errors['minlength'] as { requiredLength: number }).requiredLength;
      return `Minimum ${req} characters required.`;
    }
    return 'Invalid value.';
  });
}
