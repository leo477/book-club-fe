import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { FormatDatePipe } from '../../../../shared/pipes/format-date.pipe';
import { ClubEvent } from '../../../../core/models/event.model';

@Component({
  selector: 'app-club-event-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslateModule, FormatDatePipe],
  templateUrl: './club-event-card.component.html',
  styleUrl: './club-event-card.component.scss',
})
export class ClubEventCardComponent {
  readonly event = input.required<ClubEvent>();
  readonly isAuthenticated = input<boolean>(false);
  readonly attending = input<boolean>(false);
  readonly index = input<number>(0);

  readonly attend = output<void>();
  readonly cancelAttend = output<void>();
}
