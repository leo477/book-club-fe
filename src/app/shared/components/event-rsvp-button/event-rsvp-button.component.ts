import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { HlmButton } from '../../spartan/button/src';
import { HlmSpinner } from '../../spartan/spinner/src';

@Component({
  selector: 'app-event-rsvp-button',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule, HlmButton, HlmSpinner],
  template: `
    @if (attending()) {
      <button
        hlmBtn
        type="button"
        [size]="size()"
        [disabled]="loading() || closed()"
        (click)="clicked.emit()"
        class="bg-[var(--color-accent-600)] hover:bg-[var(--color-accent-700)] text-white"
      >
        @if (loading()) {
          <hlm-spinner size="xs" />
        } @else if (closed()) {
          {{ 'EVENTS.registration_closed' | translate }}
        } @else if (showCancel()) {
          {{ 'events.rsvp.attending' | translate }} · {{ 'events.rsvp.cancel' | translate }}
        } @else {
          {{ 'events.rsvp.attending' | translate }}
        }
      </button>
    } @else {
      <button
        hlmBtn
        type="button"
        [size]="size()"
        [disabled]="loading() || closed()"
        (click)="clicked.emit()"
        class="bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)] text-white"
      >
        @if (loading()) {
          <hlm-spinner size="xs" />
        } @else if (closed()) {
          {{ 'EVENTS.registration_closed' | translate }}
        } @else {
          {{ 'events.rsvp.join' | translate }}
        }
      </button>
    }
  `,
})
export class EventRsvpButtonComponent {
  readonly attending = input<boolean>(false);
  readonly loading = input<boolean>(false);
  readonly closed = input<boolean>(false);
  /** When true the attending button also shows the cancel affordance (club-detail context). */
  readonly showCancel = input<boolean>(false);
  readonly size = input<'default' | 'sm' | 'lg' | 'icon'>('sm');

  readonly clicked = output<void>();
}
