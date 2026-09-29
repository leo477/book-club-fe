import {
  Component, ChangeDetectionStrategy, input, output, inject, effect,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { distinctUntilChanged } from 'rxjs';
import { GeocodingService, GeocodeSuggestion } from '../../../core/services/geocoding.service';
import { HlmInput } from '../../spartan/input/src';
import { TypeaheadComboboxBase } from '../typeahead-combobox-base.component';

@Component({
  selector: 'app-address-autocomplete',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, HlmInput],
  templateUrl: './address-autocomplete.component.html',
})
export class AddressAutocompleteComponent extends TypeaheadComboboxBase<GeocodeSuggestion> {
  private static nextId = 0;

  readonly placeholder = input<string>('');
  readonly inputId = input<string>('');
  readonly selected = output<GeocodeSuggestion>();

  readonly listboxId = `address-autocomplete-listbox-${AddressAutocompleteComponent.nextId++}`;

  private readonly geocoding = inject(GeocodingService);

  constructor() {
    super();
    effect(() => {
      const ctrl = this.control();
      this.runSearch(ctrl.valueChanges, {
        debounceMs: 300,
        minLength: 2,
        fetch$: q => this.geocoding.autocomplete$(q),
        beforeFetch$: source$ => source$.pipe(distinctUntilChanged()),
      });
    });
  }

  select(s: GeocodeSuggestion): void {
    if (s.place_id && s.lat == null) {
      this.isLoading.set(true);
      this.control().setValue(s.label, { emitEvent: false });
      this.suggestions.set([]);
      this.isOpen.set(false);
      this.geocoding.getPlaceDetails$(s.place_id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (resolved) => {
            this.isLoading.set(false);
            this.selected.emit(resolved);
          },
          error: () => {
            this.isLoading.set(false);
            this.selected.emit(s);
          },
        });
      return;
    }
    this.geocoding.resetSessionToken();
    this.control().setValue(s.label, { emitEvent: false });
    this.suggestions.set([]);
    this.isOpen.set(false);
    this.selected.emit(s);
  }
}
