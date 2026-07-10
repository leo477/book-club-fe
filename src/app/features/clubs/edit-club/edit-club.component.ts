import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  input,
  OnInit,
} from '@angular/core';
import {
  ReactiveFormsModule,
  FormControl,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { toast } from '@spartan-ng/brain/sonner';
import { ClubService } from '../../../core/services/club.service';
import { CoverUploadComponent } from '../../../shared/components/cover-upload/cover-upload.component';
import { HlmFieldImports } from '../../../shared/spartan/field/src';
import { HlmInput } from '../../../shared/spartan/input/src';
import { HlmButton } from '../../../shared/spartan/button/src';
import { HlmSpinner } from '../../../shared/spartan/spinner/src';

function venueAddressRequired(control: AbstractControl): ValidationErrors | null {
  const name = (control.parent?.get('venueName')?.value as string | undefined)?.trim();
  const address = (control.value as string | null)?.trim();
  return name && !address ? { required: true } : null;
}

interface EditClubForm {
  name: FormControl<string>;
  description: FormControl<string>;
  isPublic: FormControl<boolean>;
  city: FormControl<string>;
  coverUrl: FormControl<string>;
  tags: FormControl<string>;
  meetingDurationMinutes: FormControl<number | null>;
  venueName: FormControl<string>;
  venueAddress: FormControl<string>;
  venueDescription: FormControl<string>;
}

@Component({
  selector: 'app-edit-club',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, TranslatePipe, CoverUploadComponent, ...HlmFieldImports, HlmInput, HlmButton, HlmSpinner],
  templateUrl: './edit-club.component.html',
})
export class EditClubComponent implements OnInit {
  readonly id = input.required<string>();

  private readonly clubService = inject(ClubService);
  private readonly router = inject(Router);
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
    tags: new FormControl('', { nonNullable: true }),
    meetingDurationMinutes: new FormControl<number | null>(null, {
      validators: [Validators.min(1), Validators.max(480)],
    }),
    venueName: new FormControl('', { nonNullable: true }),
    venueAddress: new FormControl('', { nonNullable: true, validators: [venueAddressRequired] }),
    venueDescription: new FormControl('', { nonNullable: true }),
  });

  constructor() {
    this.form.controls.venueName.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.form.controls.venueAddress.updateValueAndValidity());
  }

  async ngOnInit(): Promise<void> {
    const club = await this.clubService.getClubById(this.id());
    if (!club) {
      this._errorMessage.set(this.translate.instant('EDIT_CLUB.not_found'));
      this._isLoadingClub.set(false);
      return;
    }
    this.form.patchValue({
      name: club.name,
      description: club.description ?? '',
      isPublic: club.isPublic,
      city: club.city ?? '',
      coverUrl: club.coverUrl ?? '',
      tags: club.tags.join(', '),
      meetingDurationMinutes: club.meetingDurationMinutes,
      venueName: club.afterMeetingVenue?.name ?? '',
      venueAddress: club.afterMeetingVenue?.address ?? '',
      venueDescription: club.afterMeetingVenue?.description ?? '',
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

    const {
      name, description, isPublic, city, coverUrl, tags,
      meetingDurationMinutes, venueName, venueAddress, venueDescription,
    } = this.form.getRawValue();
    const venueNameTrimmed = venueName.trim();
    try {
      await this.clubService.updateClub(this.id(), {
        name,
        description,
        isPublic,
        city: city || undefined,
        coverUrl: coverUrl || null,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        meetingDurationMinutes: meetingDurationMinutes ?? null,
        afterMeetingVenue: venueNameTrimmed
          ? { name: venueNameTrimmed, address: venueAddress.trim(), description: venueDescription.trim() }
          : null,
      });
      toast.success(this.translate.instant('EDIT_CLUB.success'));
      this.router.navigate(['/clubs', this.id()]);
    } catch (err) {
      this._errorMessage.set(err instanceof Error ? err.message : this.translate.instant('EDIT_CLUB.update_error'));
    } finally {
      this._isSubmitting.set(false);
    }
  }
}
