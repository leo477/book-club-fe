import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { AbstractControl, FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-form-field',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  templateUrl: './form-field.component.html',
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
