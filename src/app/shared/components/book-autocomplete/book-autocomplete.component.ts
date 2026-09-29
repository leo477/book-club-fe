import {
  ChangeDetectionStrategy,
  Component,
  InjectionToken,
  inject,
  output,
  signal,
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { SlicePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { catchError, filter, of, switchMap, tap } from 'rxjs';
import { HlmInput } from '../../spartan/input/src';
import { HlmSpinner } from '../../spartan/spinner/src';
import { BookSearchService } from '../../../core/services/book-search.service';
import { BookSuggestion } from '../../../core/models/book.model';
import { TypeaheadComboboxBase } from '../typeahead-combobox-base.component';

/** Override in tests with 0 to skip the 600 ms wait. */
export const BOOK_SEARCH_DEBOUNCE_MS = new InjectionToken<number>('BOOK_SEARCH_DEBOUNCE_MS', {
  factory: () => 600,
});

@Component({
  selector: 'app-book-autocomplete',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, TranslatePipe, HlmInput, HlmSpinner, SlicePipe],
  template: `
<div class="relative">
  <div class="relative">
    <input
      hlmInput
      type="text"
      [formControl]="control()"
      [placeholder]="'CREATE_EVENT.book_title_placeholder' | translate"
      class="w-full pr-8"
      (focus)="isOpen.set(suggestions().length > 0)"
      (keydown)="onKeydown($event)"
      autocomplete="off"
    />
    @if (isLoading()) {
      <div class="absolute right-2.5 top-1/2 -translate-y-1/2">
        <hlm-spinner size="sm" />
      </div>
    }
  </div>
  @if (isOpen() && suggestions().length > 0) {
    <ul role="listbox" class="absolute z-50 mt-1 w-full rounded-xl border border-[var(--color-sepia)] bg-[var(--color-surface)] shadow-[var(--shadow-parchment-lg)] max-h-72 overflow-y-auto">
      @for (s of suggestions(); track s.id; let i = $index) {
        <li role="option" tabindex="0"
            [attr.aria-selected]="activeIndex() === i"
            (click)="select(s)"
            (keydown.enter)="select(s)"
            class="flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors hover:bg-[var(--color-surface-raised)]"
            [class.bg-[var(--color-surface-raised)]]="activeIndex() === i">
          @if (s.thumbnail) {
            <img [src]="s.thumbnail" [alt]="s.title" class="w-8 h-12 object-cover rounded shadow-sm shrink-0" />
          } @else {
            <div class="w-8 h-12 rounded bg-[var(--color-surface-sunken)] flex items-center justify-center shrink-0 text-lg">📚</div>
          }
          <div class="min-w-0">
            <p class="text-sm font-medium text-[var(--color-ink)] truncate">{{ s.title }}</p>
            <p class="text-xs text-[var(--color-ink-muted)] truncate">{{ s.authors.join(', ') }}</p>
            @if (s.publishedDate) {
              <p class="text-xs text-[var(--color-ink-muted)] opacity-70">{{ s.publishedDate | slice:0:4 }}</p>
            }
          </div>
        </li>
      }
    </ul>
  }
  @if (errorState()) {
    <p class="text-xs text-red-500 mt-1">{{ 'BOOK_AUTOCOMPLETE.error' | translate }}</p>
  }
</div>
`,
})
export class BookAutocompleteComponent extends TypeaheadComboboxBase<BookSuggestion> {
  readonly bookSelected = output<BookSuggestion>();

  private readonly bookSearchService = inject(BookSearchService);
  private readonly debounceMs = inject(BOOK_SEARCH_DEBOUNCE_MS);

  readonly errorState = signal(false);
  readonly bookWasSelected = signal(false);

  constructor() {
    super();
    this.runSearch(toObservable(this.control).pipe(switchMap(ctrl => ctrl.valueChanges)), {
      debounceMs: this.debounceMs,
      // Length filtering happens here (not via the base's minLength clear) so
      // a too-short query is silently dropped rather than clearing suggestions,
      // matching the original behavior.
      minLength: 0,
      beforeFetch$: source$ => source$.pipe(
        filter(() => !this.bookWasSelected()),
        tap(() => this.bookWasSelected.set(false)),
        filter(v => v != null && v.length >= 3),
      ),
      fetch$: v => {
        this.errorState.set(false);
        return this.bookSearchService.searchBooks$(v).pipe(
          catchError(() => { this.errorState.set(true); return of([] as BookSuggestion[]); }),
        );
      },
    });
  }

  select(book: BookSuggestion): void {
    this.errorState.set(false);
    this.bookWasSelected.set(true);
    this.control().setValue(book.title, { emitEvent: false });
    this.suggestions.set([]);
    this.isOpen.set(false);
    this.bookSelected.emit(book);
  }
}
