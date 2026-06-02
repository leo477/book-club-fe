import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { toast } from '@spartan-ng/brain/sonner';
import { EventService } from '../../../core/services/event.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ClubService } from '../../../core/services/club.service';
import { BackendHttpError } from '../../../core/interceptors/auth.interceptor';
import { ClubEvent } from '../../../core/models/event.model';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { EventCardComponent } from '../event-card/event-card.component';
import { HlmSpinner } from '../../../shared/spartan/spinner/src';
import { FormatDatePipe } from '../../../shared/pipes/format-date.pipe';

@Component({
  selector: 'app-events-feed',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, FormsModule, TranslateModule, EmptyStateComponent, EventCardComponent, HlmSpinner, NgTemplateOutlet, FormatDatePipe],
  templateUrl: './events-feed.component.html',
})
export class EventsFeedComponent implements OnInit {
  readonly eventService = inject(EventService);
  readonly auth = inject(AuthService);
  private readonly clubService = inject(ClubService);
  private readonly translate = inject(TranslateService);

  readonly createEventLink = computed(() => {
    const owned = this.clubService.myOwnedClubs();
    return owned.length === 1 ? `/clubs/${owned[0].id}/events/create` : '/clubs';
  });

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
      const result = await this.eventService.attendEvent(event.id);
      if (result.auto_joined) {
        toast.success(this.translate.instant('EVENTS.event_auto_joined') as string);
      }
    } catch (err) {
      if (err instanceof BackendHttpError && err.status === 400) {
        toast.error(this.translate.instant('EVENTS.registration_closed') as string);
      }
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
