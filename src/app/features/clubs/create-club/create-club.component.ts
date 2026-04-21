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
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

interface CreateClubForm {
  name: FormControl<string>;
  description: FormControl<string>;
  isPublic: FormControl<boolean>;
  city: FormControl<string>;
  address: FormControl<string>;
  tags: FormControl<string>;
  meetingDurationMinutes: FormControl<number | null>;
  nextMeetingDate: FormControl<string | null>;
  afterMeetingVenueName: FormControl<string>;
  afterMeetingVenueAddress: FormControl<string>;
  afterMeetingVenueDescription: FormControl<string>;
}

@Component({
  selector: 'app-create-club',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, TranslatePipe, LoadingSpinnerComponent],
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

  readonly showAfterMeeting = signal(false);

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
    city: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(100)],
    }),
    address: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(200)],
    }),
    tags: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(300)],
    }),
    meetingDurationMinutes: new FormControl<number | null>(null, {
      validators: [Validators.min(15), Validators.max(480)],
    }),
    nextMeetingDate: new FormControl<string | null>(null),
    afterMeetingVenueName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(150)],
    }),
    afterMeetingVenueAddress: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(200)],
    }),
    afterMeetingVenueDescription: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(300)],
    }),
  });

  togglePublic(): void {
    const current = this.form.controls.isPublic.value;
    this.form.controls.isPublic.setValue(!current);
  }

  toggleAfterMeeting(): void {
    this.showAfterMeeting.update(v => !v);
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

    const {
      name,
      description,
      isPublic,
      city,
      tags,
      meetingDurationMinutes,
      nextMeetingDate,
      afterMeetingVenueName,
      afterMeetingVenueAddress,
      afterMeetingVenueDescription,
    } = this.form.getRawValue();

    const parsedTags = tags
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const afterMeetingVenue = afterMeetingVenueName
      ? {
          name: afterMeetingVenueName,
          address: afterMeetingVenueAddress,
          description: afterMeetingVenueDescription || undefined,
        }
      : null;

    try {
      const club = await this.clubService.createClub({
        name,
        description,
        isPublic,
        city,
        tags: parsedTags,
        meetingDurationMinutes: meetingDurationMinutes ?? undefined,
        nextMeetingDate: nextMeetingDate || null,
        afterMeetingVenue,
      });
      this.router.navigate(['/clubs', club.id]);
    } catch (err) {
      this._errorMessage.set(err instanceof Error ? err.message : 'Failed to create club');
    } finally {
      this._isSubmitting.set(false);
    }
  }
}
