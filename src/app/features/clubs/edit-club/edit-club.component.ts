import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  input,
  OnInit,
} from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ClubService } from '../../../core/services/club.service';
import { ToastService } from '../../../core/services/toast.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

interface EditClubForm {
  name: FormControl<string>;
  description: FormControl<string>;
  isPublic: FormControl<boolean>;
  city: FormControl<string>;
  coverUrl: FormControl<string>;
}

@Component({
  selector: 'app-edit-club',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, TranslatePipe, LoadingSpinnerComponent],
  templateUrl: './edit-club.component.html',
})
export class EditClubComponent implements OnInit {
  readonly id = input.required<string>();

  private readonly clubService = inject(ClubService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly translate = inject(TranslateService);

  private readonly _isLoadingClub = signal(true);
  readonly isLoadingClub = this._isLoadingClub.asReadonly();

  private readonly _isSubmitting = signal(false);
  readonly isSubmitting = this._isSubmitting.asReadonly();

  private readonly _errorMessage = signal<string | null>(null);
  readonly errorMessage = this._errorMessage.asReadonly();

  readonly form = new FormGroup<EditClubForm>({
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

  async ngOnInit(): Promise<void> {
    const club = await this.clubService.getClubById(this.id());
    if (!club) {
      this._errorMessage.set('Club not found.');
      this._isLoadingClub.set(false);
      return;
    }
    this.form.patchValue({
      name: club.name,
      description: club.description ?? '',
      isPublic: club.isPublic,
      city: club.city ?? '',
      coverUrl: club.coverUrl ?? '',
    });
    this._isLoadingClub.set(false);
  }

  togglePublic(): void {
    this.form.controls.isPublic.setValue(!this.form.controls.isPublic.value);
  }

  cancel(): void {
    this.router.navigate(['/clubs', this.id()]);
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
      await this.clubService.updateClub(this.id(), {
        name,
        description,
        isPublic,
        city: city || undefined,
        coverUrl: coverUrl || null,
      });
      this.toast.show(this.translate.instant('EDIT_CLUB.success'), 'success');
      this.router.navigate(['/clubs', this.id()]);
    } catch (err) {
      this._errorMessage.set(err instanceof Error ? err.message : 'Failed to update club');
    } finally {
      this._isSubmitting.set(false);
    }
  }
}
