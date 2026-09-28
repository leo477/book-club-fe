import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { HlmButton } from '../../../../shared/spartan/button/src';

@Component({
  selector: 'app-club-manage-tools',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink, TranslateModule, HlmButton],
  templateUrl: './club-manage-tools.component.html',
})
export class ClubManageToolsComponent {
  readonly id = input.required<string>();

  readonly newRoomName = input.required<string>();
  readonly isCreatingRoom = input.required<boolean>();
  readonly roomError = input.required<string | null>();

  readonly showRescheduleInput = input.required<boolean>();
  readonly rescheduleDate = input.required<string>();
  readonly showCancelConfirm = input.required<boolean>();
  readonly showDeleteConfirm = input.required<boolean>();
  readonly isDeleting = input.required<boolean>();

  readonly newRoomNameChange = output<string>();
  readonly createRoom = output<void>();

  readonly pauseClub = output<void>();

  readonly showCancelConfirmChange = output<boolean>();
  readonly cancelClub = output<void>();

  readonly showRescheduleInputChange = output<boolean>();
  readonly rescheduleDateChange = output<string>();
  readonly reschedule = output<void>();

  readonly showDeleteConfirmChange = output<boolean>();
  readonly delete = output<void>();
}
