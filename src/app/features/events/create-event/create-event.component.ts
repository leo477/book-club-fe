import {
  Component,
  ChangeDetectionStrategy,
  computed,
  inject,
  signal,
  input,
  resource,
  OnInit,
  DestroyRef,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, filter, switchMap, tap } from 'rxjs';
import { EventService } from '../../../core/services/event.service';
import { QuizService } from '../../../core/services/quiz.service';
import { AddressAutocompleteComponent } from '../../../shared/components/address-autocomplete/address-autocomplete.component';
import { CoverUploadComponent } from '../../../shared/components/cover-upload/cover-upload.component';
import { HlmInput } from '../../../shared/spartan/input/src';
import { HlmButton } from '../../../shared/spartan/button/src';
import { BookCoverService } from '../../../core/services/book-cover.service';
import { GeocodeSuggestion } from '../../../core/services/geocoding.service';

@Component({
  selector: 'app-create-event',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ReactiveFormsModule, AddressAutocompleteComponent, CoverUploadComponent, HlmInput, HlmButton],
  templateUrl: './create-event.component.html',
})
export class CreateEventComponent implements OnInit {
  readonly id = input.required<string>();

  private readonly fb = inject(FormBuilder);
  private readonly eventService = inject(EventService);
  private readonly quizService = inject(QuizService);
  private readonly router = inject(Router);
  private readonly bookCoverService = inject(BookCoverService);
  private readonly destroyRef = inject(DestroyRef);

  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly showAfterVenue = signal(false);
  readonly isFetchingCover = signal(false);
  readonly coverFetchFailed = signal(false);

  private readonly _quizzesResource = resource({
    params: () => {
      const clubId = this.id();
      return clubId ? { clubId } : undefined;
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
      : undefined;

    try {
      const created = await this.eventService.createEvent(this.id(), {
        title: v.title,
        description: v.description || undefined,
        date: new Date(v.date).toISOString(),
        city: v.city,
        address: v.address || undefined,
        lat: v.lat ?? undefined,
        lng: v.lng ?? undefined,
        theme: v.theme || undefined,
        tags,
        durationMinutes: v.durationMinutes ?? undefined,
        afterMeetingVenue,
        coverUrl: v.coverUrl || null,
        bookTitle: v.bookTitle || null,
        quizId: v.quizId ?? null,
      });
      await this.router.navigate(['/events', created.id]);
    } catch {
      this.errorMessage.set('Failed to create event. Please try again.');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
