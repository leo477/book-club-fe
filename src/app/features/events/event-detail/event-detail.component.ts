import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  input,
  effect,
  DestroyRef,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { SlicePipe } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { toast } from '@spartan-ng/brain/sonner';
import { EventService } from '../../../core/services/event.service';
import { AuthService } from '../../../core/auth/auth.service';
import { BackendHttpError } from '../../../core/interceptors/auth.interceptor';
import { ApiEvent, mapEvent } from '../../../core/api/api-mappers';
import { ClubEvent } from '../../../core/models/event.model';
import { FormatDatePipe } from '../../../shared/pipes/format-date.pipe';
import { environment } from '../../../../environments/environment';
import { ChatService } from '../../../core/services/chat.service';
import { ChatRoom } from '../../../core/models/chat.model';
import { HlmButton } from '../../../shared/spartan/button/src';
import { HlmSpinner } from '../../../shared/spartan/spinner/src';
import { EventRsvpButtonComponent } from '../../../shared/components/event-rsvp-button/event-rsvp-button.component';
import { BookStoresComponent } from '../../../shared/book-stores/book-stores.component';
import { BookSearchService } from '../../../core/services/book-search.service';
import { BookDetails } from '../../../core/models/book.model';
import { EventMapComponent } from '../../../shared/components/event-map/event-map.component';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslateModule, FormatDatePipe, HlmButton, HlmSpinner, EventRsvpButtonComponent, BookStoresComponent, SlicePipe, EventMapComponent],
  templateUrl: './event-detail.component.html',
})
export class EventDetailComponent {
  readonly id = input.required<string>();

  private readonly http = inject(HttpClient);
  private readonly eventService = inject(EventService);
  private readonly translate = inject(TranslateService);
  readonly auth = inject(AuthService);
  private readonly chatService = inject(ChatService);
  private readonly bookSearchService = inject(BookSearchService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly _eventResource = rxResource<ClubEvent | null, string>({
    params: () => this.id(),
    stream: ({ params: id }) =>
      this.http.get<ApiEvent>(`${environment.apiUrl}/events/${id}`).pipe(
        map(mapEvent),
      ),
  });

  readonly event = computed(() => this._eventResource.value() ?? null);
  readonly isLoading = this._eventResource.isLoading;
  readonly errorMessage = computed(() =>
    !this._eventResource.isLoading() && this._eventResource.error() ? 'EVENT.LOAD_ERROR' : null,
  );
  readonly isActioning = signal(false);

  readonly bookDetailsOpen = signal(false);
  readonly bookDetails = signal<BookDetails | null>(null);
  readonly isLoadingBookDetails = signal(false);

  readonly isOrganizer = computed(
    () => !!this.auth.currentUser() && this.event()?.organizerId === this.auth.currentUser()?.id,
  );

  private readonly _eventRoom = signal<ChatRoom | null>(null);
  readonly eventRoom = this._eventRoom.asReadonly();

  constructor() {
    effect(() => {
      if (!this._eventResource.hasValue()) return;
      const ev = this.event();
      if (ev && this.auth.currentUser()) {
        this.chatService.getEventRoom(ev.id).then(room => this._eventRoom.set(room));
      }
    });
  }

  openBookDetails(): void {
    this.bookDetailsOpen.update(v => !v);
    if (!this.bookDetailsOpen() || this.bookDetails() || !this.event()?.googleBookId) return;
    const bookId = this.event()?.googleBookId;
    if (!bookId) return;
    this.isLoadingBookDetails.set(true);
    this.bookSearchService.getBookDetails(bookId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: d => { this.bookDetails.set(d); this.isLoadingBookDetails.set(false); },
        error: () => this.isLoadingBookDetails.set(false),
      });
  }

  async openEventChat(): Promise<void> {
    const ev = this.event();
    if (!ev) return;
    let room = this._eventRoom();
    if (!room && this.isOrganizer()) {
      room = await this.chatService.createEventChatRoom(ev.id);
      this._eventRoom.set(room);
    }
    if (room) this.chatService.openAndFocusRoom(room);
  }

  async onAttend(): Promise<void> {
    this.isActioning.set(true);
    try {
      const result = await this.eventService.attendEvent(this.id());
      if (result.auto_joined) {
        toast.success(this.translate.instant('EVENTS.event_auto_joined') as string);
      }
      this._eventResource.reload();
    } catch (err) {
      if (err instanceof BackendHttpError && err.status === 400) {
        toast.error(this.translate.instant('EVENTS.registration_closed') as string);
      }
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
    if (!confirm(this.translate.instant('EVENTS.cancel_confirm'))) return;
    this.isActioning.set(true);
    try {
      await this.eventService.cancelEvent(this.id());
      this._eventResource.reload();
    } finally {
      this.isActioning.set(false);
    }
  }
}
