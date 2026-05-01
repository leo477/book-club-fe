import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  resource,
  input,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { EventService } from '../../../core/services/event.service';
import { AuthService } from '../../../core/auth/auth.service';
import { FormatDatePipe } from '../../../shared/pipes/format-date.pipe';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslateModule, FormatDatePipe],
  templateUrl: './event-detail.component.html',
})
export class EventDetailComponent {
  readonly id = input.required<string>();

  private readonly eventService = inject(EventService);
  readonly auth = inject(AuthService);

  readonly isActioning = signal(false);

  private readonly _eventResource = resource({
    params: () => this.id(),
    loader: async ({ params: eventId }) => {
      const found = await this.eventService.getEventById(eventId);
      if (!found) throw new Error('Event not found.');
      return found;
    },
  });

  readonly event = computed(() => this._eventResource.value() ?? null);
  readonly isLoading = computed(() => this._eventResource.isLoading());
  readonly errorMessage = computed<string | null>(() => {
    const err = this._eventResource.error();
    if (!err) return null;
    return err instanceof Error ? err.message : 'Failed to load event.';
  });

  readonly isOrganizer = computed(
    () => !!this.auth.currentUser() && this.event()?.organizerId === this.auth.currentUser()?.id,
  );

  async onAttend(): Promise<void> {
    this.isActioning.set(true);
    try {
      await this.eventService.attendEvent(this.id());
      this._eventResource.reload();
    } finally {
      this.isActioning.set(false);
    }
  }

  async onCancelAttend(): Promise<void> {
    this.isActioning.set(true);
    try {
      await this.eventService.cancelAttendance(this.id());
      this._eventResource.reload();
    } finally {
      this.isActioning.set(false);
    }
  }

  async onCancelEvent(): Promise<void> {
    if (!confirm('Cancel this event?')) return;
    this.isActioning.set(true);
    try {
      await this.eventService.cancelEvent(this.id());
      this._eventResource.reload();
    } finally {
      this.isActioning.set(false);
    }
  }
}
