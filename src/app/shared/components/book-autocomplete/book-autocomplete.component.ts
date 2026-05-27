import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { SlicePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { catchError, debounceTime, distinctUntilChanged, filter, of, switchMap } from 'rxjs';
import { HlmInput } from '../../spartan/input/src';
import { HlmSpinner } from '../../spartan/spinner/src';
import { BookSearchService } from '../../../core/services/book-search.service';
import { BookSuggestion } from '../../../core/models/book.model';

@Component({
  selector: 'app-book-autocomplete',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, TranslateModule, HlmInput, HlmSpinner, SlicePipe],
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
        <li role="option" [attr.aria-selected]="activeIndex() === i" (click)="select(s)"
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
</div>
`,
})
export class BookAutocompleteComponent {
  readonly control = input.required<FormControl<string>>();
  readonly bookSelected = output<BookSuggestion>();

  private readonly bookSearchService = inject(BookSearchService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly elRef = inject(ElementRef);

  readonly suggestions = signal<BookSuggestion[]>([]);
  readonly isLoading = signal(false);
  readonly isOpen = signal(false);
  readonly activeIndex = signal(-1);

  constructor() {
    // Use effect-like pattern via constructor to subscribe once control is available
    // We use a direct approach: subscribe in constructor after the first effect
    // Since input() signals are available after construction, we do it this way:
    queueMicrotask(() => this._setupSubscription());
  }

  private _setupSubscription(): void {
    this.control().valueChanges.pipe(
      debounceTime(600),
      distinctUntilChanged(),
      filter(v => v != null && v.length >= 3),
      switchMap(v => {
        this.isLoading.set(true);
        return this.bookSearchService.searchBooks(v).pipe(
          catchError(() => of([] as BookSuggestion[])),
        );
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(results => {
      this.isLoading.set(false);
      this.suggestions.set(results);
      this.activeIndex.set(-1);
      this.isOpen.set(results.length > 0);
    });
  }

  select(book: BookSuggestion): void {
    this.control().setValue(book.title, { emitEvent: false });
    this.suggestions.set([]);
    this.isOpen.set(false);
    this.bookSelected.emit(book);
  }

  onKeydown(event: KeyboardEvent): void {
    if (!this.isOpen()) return;
    const len = this.suggestions().length;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.activeIndex.update(i => (i + 1) % len);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.activeIndex.update(i => (i - 1 + len) % len);
    } else if (event.key === 'Enter' && this.activeIndex() >= 0) {
      event.preventDefault();
      this.select(this.suggestions()[this.activeIndex()]);
    } else if (event.key === 'Escape') {
      this.isOpen.set(false);
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }
}
