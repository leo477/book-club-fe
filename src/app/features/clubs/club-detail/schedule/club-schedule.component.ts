import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Club } from '../../../../core/models/club.model';

@Component({
  selector: 'app-club-schedule',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, TranslateModule],
  templateUrl: './club-schedule.component.html',
})
export class ClubScheduleComponent {
  readonly club = input.required<Club>();
  readonly isOwner = input.required<boolean>();

  readonly pauseRequested = output<void>();
  readonly cancelRequested = output<void>();
  readonly reschedule = output<string>();

  readonly rescheduleDate = new FormControl<string>('', { nonNullable: true });

  submitReschedule(): void {
    const date = this.rescheduleDate.value;
    if (!date) return;
    this.reschedule.emit(date);
    this.rescheduleDate.reset();
  }
}
