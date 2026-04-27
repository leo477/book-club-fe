import {
  Component, ChangeDetectionStrategy, input, output,
  DestroyRef, signal, inject, ElementRef, HostListener, effect,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { switchMap, debounceTime, distinctUntilChanged, of } from 'rxjs';
import { GeocodingService, GeocodeSuggestion } from '../../../core/services/geocoding.service';
import { HlmInput } from '../../spartan/input/src';

@Component({
  selector: 'app-address-autocomplete',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, HlmInput],
  templateUrl: './address-autocomplete.component.html',
})
export class AddressAutocompleteComponent {
  readonly control = input.required<FormControl<string>>();
  readonly placeholder = input<string>('');
  readonly inputId = input<string>('');
  readonly selected = output<GeocodeSuggestion>();

  private readonly geocoding = inject(GeocodingService);
  private readonly elRef = inject(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  readonly suggestions = signal<GeocodeSuggestion[]>([]);
  readonly isLoading = signal(false);
  readonly isOpen = signal(false);
  readonly activeIndex = signal(-1);

  constructor() {
    effect(() => {
      const ctrl = this.control();
      ctrl.valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(q => {
          if (!q || q.length < 2) {
            this.suggestions.set([]);
            this.isOpen.set(false);
            return of([]);
          }
          this.isLoading.set(true);
          return this.geocoding.autocomplete(q);
        }),
        takeUntilDestroyed(this.destroyRef),
      ).subscribe({
        next: (results) => {
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
    });
  }

  select(s: GeocodeSuggestion): void {
    this.control().setValue(s.label, { emitEvent: false });
    this.suggestions.set([]);
    this.isOpen.set(false);
    this.selected.emit(s);
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
