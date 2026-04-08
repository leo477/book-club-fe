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
  templateUrl: './register.component.html',
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
