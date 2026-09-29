import { DestroyRef, Directive, ElementRef, HostListener, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { Observable, Subscription, debounceTime, of, switchMap } from 'rxjs';

/**
 * Shared open/loading/activeIndex/keyboard-nav/debounce state machine for
 * combobox-style typeahead inputs (address-autocomplete, book-autocomplete).
 * Subclasses provide the actual search/fetch call and any input-specific
 * pre-debounce filtering via `runSearch()`, and implement `select()`.
 */
@Directive()
export abstract class TypeaheadComboboxBase<T> {
  protected readonly elRef = inject(ElementRef);
  protected readonly destroyRef = inject(DestroyRef);

  readonly control = input.required<FormControl<string>>();

  readonly suggestions = signal<T[]>([]);
  readonly isLoading = signal(false);
  readonly isOpen = signal(false);
  readonly activeIndex = signal(-1);

  protected abstract select(item: T): void;

  /**
   * Wires a query stream into the shared suggestions/isLoading/isOpen state.
   * `beforeFetch$` runs right after `debounceTime` and before the min-length
   * check, so subclasses can splice in extra operators (distinctUntilChanged,
   * skip-after-select filters, etc.) without duplicating the rest.
   */
  protected runSearch(
    query$: Observable<string | null>,
    opts: {
      debounceMs: number;
      minLength: number;
      fetch$: (query: string) => Observable<T[]>;
      beforeFetch$?: (source$: Observable<string | null>) => Observable<string | null>;
    },
  ): Subscription {
    let piped$ = query$.pipe(debounceTime(opts.debounceMs));
    if (opts.beforeFetch$) piped$ = opts.beforeFetch$(piped$);

    return piped$.pipe(
      switchMap(q => {
        if (!q || q.length < opts.minLength) {
          this.suggestions.set([]);
          this.isOpen.set(false);
          return of([] as T[]);
        }
        this.isLoading.set(true);
        return opts.fetch$(q);
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: results => {
        this.isLoading.set(false);
        this.suggestions.set(results);
        this.activeIndex.set(-1);
        this.isOpen.set(results.length > 0);
      },
      error: () => {
        this.isLoading.set(false);
        this.suggestions.set([]);
      },
    });
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
