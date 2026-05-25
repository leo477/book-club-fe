import {
  Component,
  ChangeDetectionStrategy,
  computed,
  input,
  output,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { FormatDatePipe } from '../../../shared/pipes/format-date.pipe';
import { ClubEvent } from '../../../core/models/event.model';
import { HlmCardImports } from '../../../shared/spartan/card/src';
import { HlmButton } from '../../../shared/spartan/button/src';
import { HlmBadge } from '../../../shared/spartan/badge/src';
import { HlmSpinner } from '../../../shared/spartan/spinner/src';
import { EventCountdownComponent } from '../event-countdown/event-countdown.component';
import { EventRsvpButtonComponent } from '../../../shared/components/event-rsvp-button/event-rsvp-button.component';

@Component({
  selector: 'app-event-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslateModule, FormatDatePipe, ...HlmCardImports, HlmButton, HlmBadge, HlmSpinner, EventCountdownComponent, EventRsvpButtonComponent],
  templateUrl: './event-card.component.html',
})
export class EventCardComponent {
  readonly event = input.required<ClubEvent>();
  readonly isAuthenticated = input<boolean>(false);
  readonly attending = input<boolean>(false);
  readonly isOrganizer = input<boolean>(false);

  readonly attend = output<void>();
  readonly cancelAttend = output<void>();

  readonly daysToEvent = computed(() =>
    Math.ceil((new Date(this.event().date).getTime() - Date.now()) / 86400000)
  );
}
