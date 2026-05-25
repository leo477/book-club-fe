import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  output,
} from '@angular/core';
import {
  ReactiveFormsModule,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ClubService } from '../../../core/services/club.service';
import { HlmFieldImports } from '../../../shared/spartan/field/src';
import { HlmInput } from '../../../shared/spartan/input/src';
import { HlmButton } from '../../../shared/spartan/button/src';
import { HlmSpinner } from '../../../shared/spartan/spinner/src';

interface ClubCreateForm {
  name: FormControl<string>;
  description: FormControl<string>;
  city: FormControl<string>;
  isPublic: FormControl<boolean>;
}

@Component({
  selector: 'app-club-create-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    TranslateModule,
    ...HlmFieldImports,
    HlmInput,
    HlmButton,
    HlmSpinner,
  ],
  templateUrl: './club-create-form.component.html',
})
export class ClubCreateFormComponent {
  private readonly clubService = inject(ClubService);
  private readonly router = inject(Router);

  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly created = output<void>();

  readonly form = new FormGroup<ClubCreateForm>({
    name: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
      ],
    }),
    description: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(500)],
    }),
    city: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(100)],
    }),
    isPublic: new FormControl(true, { nonNullable: true }),
  });

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    const { name, description, city, isPublic } = this.form.getRawValue();
    try {
      const club = await this.clubService.createClub({
        name,
        description,
        isPublic,
        city,
      });
      this.created.emit();
      await this.router.navigate(['/clubs', club.id]);
    } catch (err: unknown) {
      this.errorMessage.set(
        (err instanceof Error ? err.message : null) ?? 'Failed to create club',
      );
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
