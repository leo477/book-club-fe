import {
  Component,
  ChangeDetectionStrategy,
  computed,
  inject,
  signal,
  input,
  resource,
  DestroyRef,
  OnInit,
  effect,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { takeUntilDestroyed, rxResource } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, filter, firstValueFrom, map, switchMap, tap } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { EventService } from '../../../core/services/event.service';
import { QuizService } from '../../../core/services/quiz.service';
import { AuthService } from '../../../core/auth/auth.service';
import { AddressAutocompleteComponent } from '../../../shared/components/address-autocomplete/address-autocomplete.component';
import { CoverUploadComponent } from '../../../shared/components/cover-upload/cover-upload.component';
import { HlmInput } from '../../../shared/spartan/input/src';
import { HlmButton } from '../../../shared/spartan/button/src';
import { BookCoverService } from '../../../core/services/book-cover.service';
import { GeocodeSuggestion } from '../../../core/services/geocoding.service';
import { ApiEvent, mapEvent } from '../../../core/api/api-mappers';
import { ClubEvent } from '../../../core/models/event.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-edit-event',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ReactiveFormsModule, TranslateModule, AddressAutocompleteComponent, CoverUploadComponent, HlmInput, HlmButton],
  templateUrl: './edit-event.component.html',
})
export class EditEventComponent implements OnInit {
  readonly id = input.required<string>();

  private readonly http = inject(HttpClient);
  private readonly fb = inject(FormBuilder);
  private readonly eventService = inject(EventService);
  private readonly quizService = inject(QuizService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly bookCoverService = inject(BookCoverService);
  private readonly destroyRef = inject(DestroyRef);

  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly showAfterVenue = signal(false);
  readonly isFetchingCover = signal(false);
  readonly coverFetchFailed = signal(false);
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
    city: ['', Validators.required],
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
    quizId: [null as string | null],
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

  ngOnInit(): void {
    this.form.controls.bookTitle.valueChanges.pipe(
      debounceTime(600),
      distinctUntilChanged(),
      filter(v => v.length > 2),
      tap(() => { this.isFetchingCover.set(true); this.coverFetchFailed.set(false); }),
      switchMap(title => this.bookCoverService.fetchCover$(title)),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(url => {
      this.isFetchingCover.set(false);
      if (url && !this.form.controls.coverUrl.value) {
        this.form.controls.coverUrl.setValue(url);
      } else if (!url) {
        this.coverFetchFailed.set(true);
      }
    });
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
      quizId: ev.quizId ?? null,
      afterVenueName: ev.afterMeetingVenue?.name ?? '',
      afterVenueAddress: ev.afterMeetingVenue?.address ?? '',
      afterVenueDescription: ev.afterMeetingVenue?.description ?? '',
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
      await firstValueFrom(this.eventService.updateEvent(this.id(), {
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
        quizId: v.quizId ?? null,
      }));
      await this.router.navigate(['/events', this.id()]);
    } catch {
      this.errorMessage.set('Failed to save changes. Please try again.');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
