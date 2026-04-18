import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Club } from '../../../../core/models/club.model';
import { TranslateModule } from '@ngx-translate/core';
import { InitialsPipe } from '../../../../shared/pipes/initials.pipe';
import { FormatDatePipe } from '../../../../shared/pipes/format-date.pipe';

@Component({
  selector: 'app-club-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslateModule, InitialsPipe, FormatDatePipe],
  templateUrl: './club-card.component.html',
})
export class ClubCardComponent {
  readonly club = input.required<Club>();
  readonly isMember = input.required<boolean>();
  readonly isOwned = input<boolean>(false);
  readonly isAuthenticated = input<boolean>(false);
  readonly joining = input<boolean>(false);

  readonly join = output<void>();

  protected daysUntil(dateStr: string): number {
    const now = new Date();
    const meeting = new Date(dateStr);
    return Math.ceil((meeting.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }
}
