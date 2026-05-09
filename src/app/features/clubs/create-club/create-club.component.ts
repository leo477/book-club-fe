import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
} from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ClubService } from '../../../core/services/club.service';
import { AuthService } from '../../../core/auth/auth.service';
import { HlmFieldImports } from '../../../shared/spartan/field/src';
import { HlmInput } from '../../../shared/spartan/input/src';
import { HlmButton } from '../../../shared/spartan/button/src';
import { HlmSpinner } from '../../../shared/spartan/spinner/src';

interface CreateClubForm {
  name: FormControl<string>;
  description: FormControl<string>;
  isPublic: FormControl<boolean>;
  city: FormControl<string>;
  coverUrl: FormControl<string>;
}

@Component({
  selector: 'app-create-club',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, TranslatePipe, ...HlmFieldImports, HlmInput, HlmButton, HlmSpinner],
  templateUrl: './create-club.component.html',
})
export class CreateClubComponent {
  private readonly clubService = inject(ClubService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  private readonly _errorMessage = signal<string | null>(null);
  readonly errorMessage = this._errorMessage.asReadonly();

  private readonly _isSubmitting = signal(false);
  readonly isSubmitting = this._isSubmitting.asReadonly();

  private readonly _showAfterMeeting = signal(false);
  readonly showAfterMeeting = this._showAfterMeeting.asReadonly();

  readonly form = new FormGroup<CreateClubForm>({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3), Validators.maxLength(100)],
    }),
    description: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(500)],
    }),
    isPublic: new FormControl(true, { nonNullable: true }),
    city: new FormControl('', { nonNullable: true }),
    coverUrl: new FormControl('', { nonNullable: true, validators: [Validators.pattern(/^https?:\/\/.+\..+/)] }),
  });

  togglePublic(): void {
    const current = this.form.controls.isPublic.value;
    this.form.controls.isPublic.setValue(!current);
  }

  toggleAfterMeeting(): void {
    this._showAfterMeeting.update(v => !v);
  }

  cancel(): void {
    this.router.navigate(['/clubs']);
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this._isSubmitting.set(true);
    this._errorMessage.set(null);

    const { name, description, isPublic, city, coverUrl } = this.form.getRawValue();

    try {
      const club = await this.clubService.createClub({ name, description, isPublic, city, coverUrl: coverUrl || null });
      this.router.navigate(['/clubs', club.id]);
    } catch (err) {
      this._errorMessage.set(err instanceof Error ? err.message : 'Failed to create club');
    } finally {
      this._isSubmitting.set(false);
    }
  }
}
