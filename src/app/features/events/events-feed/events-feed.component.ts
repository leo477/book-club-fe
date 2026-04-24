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
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { EventCardComponent } from '../event-card/event-card.component';

@Component({
  selector: 'app-events-feed',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, TranslateModule, LoadingSpinnerComponent, EmptyStateComponent, EventCardComponent],
  templateUrl: './events-feed.component.html',
})
export class EventsFeedComponent implements OnInit {
  readonly eventService = inject(EventService);
  readonly auth = inject(AuthService);

  readonly activeTab = signal<'upcoming' | 'my'>('upcoming');
  readonly attendingEventId = signal<string | null>(null);

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
