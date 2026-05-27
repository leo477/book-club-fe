import {
  Component,
  ChangeDetectionStrategy,
  computed,
  inject,
  signal,
  input,
  resource,
  DestroyRef,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormControl, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { EventService } from '../../../core/services/event.service';
import { QuizService } from '../../../core/services/quiz.service';
import { AddressAutocompleteComponent } from '../../../shared/components/address-autocomplete/address-autocomplete.component';
import { CoverUploadComponent } from '../../../shared/components/cover-upload/cover-upload.component';
import { HlmInput } from '../../../shared/spartan/input/src';
import { HlmButton } from '../../../shared/spartan/button/src';
import { GeocodeSuggestion } from '../../../core/services/geocoding.service';
import { BookAutocompleteComponent } from '../../../shared/components/book-autocomplete/book-autocomplete.component';
import { BookSuggestion } from '../../../core/models/book.model';

@Component({
  selector: 'app-create-event',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ReactiveFormsModule, TranslateModule, AddressAutocompleteComponent, CoverUploadComponent, HlmInput, HlmButton, BookAutocompleteComponent],
  templateUrl: './create-event.component.html',
})
export class CreateEventComponent {
  readonly id = input.required<string>();

  private readonly fb = inject(FormBuilder);
  private readonly eventService = inject(EventService);
  private readonly quizService = inject(QuizService);
  private readonly router = inject(Router);

  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly showAfterVenue = signal(false);

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
    googleBookId: new FormControl<string | null>(null),
    quizId: [null as string | null],
    hasWinner: new FormControl(false, { nonNullable: true }),
  });

  onBookSelected(book: BookSuggestion): void {
    this.form.controls.bookTitle.setValue(book.title);
    if (book.thumbnail) this.form.controls.coverUrl.setValue(book.thumbnail);
    (this.form.controls as any).googleBookId?.setValue(book.id);
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
        google_book_id: v.googleBookId ?? null,
        quizId: v.quizId ?? null,
        has_winner: v.hasWinner,
      });
      await this.router.navigate(['/events', created.id]);
    } catch {
      this.errorMessage.set('Failed to create event. Please try again.');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
