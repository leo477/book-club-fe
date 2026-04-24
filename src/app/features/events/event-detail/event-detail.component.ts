import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  effect,
  input,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { EventService } from '../../../core/services/event.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ClubEvent } from '../../../core/models/event.model';
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

  readonly event = signal<ClubEvent | null>(null);
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly isActioning = signal(false);

  readonly isOrganizer = computed(
    () => !!this.auth.currentUser() && this.event()?.organizerId === this.auth.currentUser()?.id,
  );

  constructor() {
    effect((onCleanup) => {
      const eventId = this.id();
      let cancelled = false;
      onCleanup(() => { cancelled = true; });

      this.isLoading.set(true);
      this.eventService.getEventById(eventId).then(found => {
        if (cancelled) return;
        this.event.set(found);
        if (!found) this.errorMessage.set('Event not found.');
      }).catch(() => {
        if (!cancelled) this.errorMessage.set('Failed to load event.');
      }).finally(() => {
        if (!cancelled) this.isLoading.set(false);
      });
    });
  }

  async onAttend(): Promise<void> {
    this.isActioning.set(true);
    try {
      await this.eventService.attendEvent(this.id());
      const updated = await this.eventService.getEventById(this.id());
      if (updated) this.event.set(updated);
    } finally {
      this.isActioning.set(false);
    }
  }

  async onCancelAttend(): Promise<void> {
    this.isActioning.set(true);
    try {
      await this.eventService.cancelAttendance(this.id());
      const updated = await this.eventService.getEventById(this.id());
      if (updated) this.event.set(updated);
    } finally {
      this.isActioning.set(false);
    }
  }

  async onCancelEvent(): Promise<void> {
    if (!confirm('Cancel this event?')) return;
    this.isActioning.set(true);
    try {
      await this.eventService.cancelEvent(this.id());
      const updated = await this.eventService.getEventById(this.id());
      if (updated) this.event.set(updated);
    } finally {
      this.isActioning.set(false);
    }
  }
}
