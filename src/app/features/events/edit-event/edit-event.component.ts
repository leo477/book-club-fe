import {
  Component,
  ChangeDetectionStrategy,
  computed,
  inject,
  signal,
  input,
  resource,
  effect,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormControl, Validators } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { EventService } from '../../../core/services/event.service';
import { QuizService } from '../../../core/services/quiz.service';
import { AuthService } from '../../../core/auth/auth.service';
import { AddressAutocompleteComponent } from '../../../shared/components/address-autocomplete/address-autocomplete.component';
import { CoverUploadComponent } from '../../../shared/components/cover-upload/cover-upload.component';
import { HlmInput } from '../../../shared/spartan/input/src';
import { HlmButton } from '../../../shared/spartan/button/src';
import { GeocodeSuggestion } from '../../../core/services/geocoding.service';
import { ApiEvent, mapEvent } from '../../../core/api/api-mappers';
import { ClubEvent } from '../../../core/models/event.model';
import { environment } from '../../../../environments/environment';
import { BookAutocompleteComponent } from '../../../shared/components/book-autocomplete/book-autocomplete.component';
import { BookSuggestion } from '../../../core/models/book.model';

@Component({
  selector: 'app-edit-event',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ReactiveFormsModule, TranslateModule, AddressAutocompleteComponent, CoverUploadComponent, HlmInput, HlmButton, BookAutocompleteComponent],
  templateUrl: './edit-event.component.html',
})
export class EditEventComponent {
  readonly id = input.required<string>();

  private readonly http = inject(HttpClient);
  private readonly fb = inject(FormBuilder);
  private readonly eventService = inject(EventService);
  private readonly quizService = inject(QuizService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly showAfterVenue = signal(false);
  private _formPatched = false;

  private readonly _eventResource = rxResource<ClubEvent | null, string>({
    params: () => this.id(),
    stream: ({ params: id }) =>
      this.http.get<ApiEvent>(`${environment.apiUrl}/events/${id}`).pipe(map(mapEvent)),
  });

  readonly event = computed(() => this._eventResource.value() ?? null);
  readonly isLoading = this._eventResource.isLoading;

  private readonly _quizzesResource = resource({
    params: () => {
      const ev = this.event();
      return ev ? { clubId: ev.clubId } : undefined;
    },
    loader: ({ params }) => this.quizService.getClubQuizzes(params.clubId),
  });

  readonly activeQuizzes = computed(() =>
    (this._quizzesResource.value() ?? []).filter(
      q => q.status === 'active' || q.status === 'live',
    ),
  );

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(120)]],
    description: [''],
    date: ['', Validators.required],
    city: [''],
    address: [''],
    lat: [null as number | null],
    lng: [null as number | null],
    theme: [''],
    tagsRaw: [''],
    durationMinutes: [null as number | null, [Validators.min(15), Validators.max(480)]],
    afterVenueName: [''],
    afterVenueAddress: [''],
    afterVenueDescription: [''],
    coverUrl: [''],
    bookTitle: [''],
    googleBookId: new FormControl<string | null>(null),
    quizId: [null as string | null],
    hasWinner: new FormControl(false, { nonNullable: true }),
  });

  constructor() {
    effect(() => {
      const ev = this.event();
      const user = this.auth.currentUser();
      if (!this._eventResource.isLoading() && ev && user && ev.organizerId !== user.id) {
        this.router.navigate(['/events']);
      }
    });

    effect(() => {
      const ev = this.event();
      if (ev && !this._formPatched) {
        this._formPatched = true;
        this._patchForm(ev);
      }
    });
  }

  onBookSelected(book: BookSuggestion): void {
    this.form.controls.bookTitle.setValue(book.title);
    if (book.thumbnail) this.form.controls.coverUrl.setValue(book.thumbnail);
    this.form.get('googleBookId')?.setValue(book.id);
  }

  private _patchForm(ev: ClubEvent): void {
    const localDate = ev.date ? new Date(ev.date).toISOString().slice(0, 16) : '';
    this.form.patchValue({
      title: ev.title,
      description: ev.description ?? '',
      date: localDate,
      city: ev.city,
      address: ev.address ?? '',
      lat: ev.lat,
      lng: ev.lng,
      theme: ev.theme ?? '',
      tagsRaw: ev.tags.join(', '),
      durationMinutes: ev.durationMinutes,
      coverUrl: ev.coverUrl ?? '',
      bookTitle: ev.bookTitle ?? '',
      googleBookId: ev.googleBookId ?? null,
      quizId: ev.quizId ?? null,
      afterVenueName: ev.afterMeetingVenue?.name ?? '',
      afterVenueAddress: ev.afterMeetingVenue?.address ?? '',
      afterVenueDescription: ev.afterMeetingVenue?.description ?? '',
      hasWinner: ev.hasWinner,
    });
    if (ev.afterMeetingVenue?.name) {
      this.showAfterVenue.set(true);
    }
  }

  onAddressSelect(suggestion: GeocodeSuggestion): void {
    this.form.patchValue({
      city: suggestion.city ?? suggestion.label,
      address: suggestion.label,
      lat: suggestion.lat,
      lng: suggestion.lng,
    });
  }

  toggleAfterVenue(): void {
    this.showAfterVenue.update(v => !v);
    if (!this.showAfterVenue()) {
      this.form.patchValue({ afterVenueName: '', afterVenueAddress: '', afterVenueDescription: '' });
    }
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid || this.isSubmitting()) return;
    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const v = this.form.getRawValue();
    const tags = v.tagsRaw.split(',').map(t => t.trim()).filter(Boolean);
    const afterMeetingVenue = this.showAfterVenue() && v.afterVenueName
      ? { name: v.afterVenueName, address: v.afterVenueAddress, description: v.afterVenueDescription || undefined }
      : null;

    try {
      await this.eventService.updateEvent(this.id(), {
        title: v.title,
        description: v.description || null,
        date: new Date(v.date).toISOString(),
        city: v.city,
        address: v.address || null,
        lat: v.lat ?? null,
        lng: v.lng ?? null,
        theme: v.theme || null,
        tags,
        durationMinutes: v.durationMinutes ?? null,
        afterMeetingVenue,
        coverUrl: v.coverUrl || null,
        bookTitle: v.bookTitle || null,
        google_book_id: v.googleBookId ?? null,
        quizId: v.quizId ?? null,
        has_winner: v.hasWinner,
      });
      await this.router.navigate(['/events', this.id()]);
    } catch {
      this.errorMessage.set('Failed to save changes. Please try again.');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
