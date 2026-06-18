import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
} from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { FormatDatePipe } from '../../../../shared/pipes/format-date.pipe';
import { ClubEvent } from '../../../../core/models/event.model';
import { EventRsvpButtonComponent } from '../../../../shared/components/event-rsvp-button/event-rsvp-button.component';

@Component({
  selector: 'app-club-event-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgOptimizedImage, RouterLink, TranslateModule, FormatDatePipe, EventRsvpButtonComponent],
  templateUrl: './club-event-card.component.html',
  styleUrl: './club-event-card.component.scss',
})
export class ClubEventCardComponent {
  readonly event = input.required<ClubEvent>();
  readonly isAuthenticated = input<boolean>(false);
  readonly attending = input<boolean>(false);
  readonly isOrganizer = input<boolean>(false);
  readonly index = input<number>(0);

  readonly attend = output<void>();
  readonly cancelAttend = output<void>();
}
