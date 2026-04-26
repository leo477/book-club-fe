import {
  Component,
  ChangeDetectionStrategy,
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

@Component({
  selector: 'app-event-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslateModule, FormatDatePipe, ...HlmCardImports, HlmButton, HlmBadge],
  templateUrl: './event-card.component.html',
})
export class EventCardComponent {
  readonly event = input.required<ClubEvent>();
  readonly isAuthenticated = input<boolean>(false);
  readonly attending = input<boolean>(false);

  readonly attend = output<void>();
  readonly cancelAttend = output<void>();
}
