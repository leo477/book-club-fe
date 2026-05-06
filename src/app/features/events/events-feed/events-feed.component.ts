import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { EventService } from '../../../core/services/event.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ClubEvent } from '../../../core/models/event.model';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { EventCardComponent } from '../event-card/event-card.component';
import { HlmSpinner } from '../../../shared/spartan/spinner/src';

@Component({
  selector: 'app-events-feed',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, TranslateModule, EmptyStateComponent, EventCardComponent, HlmSpinner],
  templateUrl: './events-feed.component.html',
})
export class EventsFeedComponent implements OnInit {
  readonly eventService = inject(EventService);
  readonly auth = inject(AuthService);

  readonly attendingEventId = signal<string | null>(null);
  readonly activeTab = signal<'upcoming' | 'my'>('upcoming');

  readonly sortedDates = computed(() =>
    Object.keys(this.eventService.groupedByDate()).sort((a, b) => a.localeCompare(b)),
  );

  async ngOnInit(): Promise<void> {
    await this.eventService.loadAllEvents();
    if (this.auth.isAuthenticated()) {
      await this.eventService.loadMyEvents();
    }
  }

  async onAttend(event: ClubEvent): Promise<void> {
    this.attendingEventId.set(event.id);
    try {
      await this.eventService.attendEvent(event.id);
    } catch {
      // handled in service
    } finally {
      this.attendingEventId.set(null);
    }
  }

  async onCancelAttend(event: ClubEvent): Promise<void> {
    this.attendingEventId.set(event.id);
    try {
      await this.eventService.cancelAttendance(event.id);
    } catch {
      // handled in service
    } finally {
      this.attendingEventId.set(null);
    }
  }
}
