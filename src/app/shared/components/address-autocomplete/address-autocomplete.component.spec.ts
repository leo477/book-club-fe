import { TestBed } from '@angular/core/testing';
import { ComponentFixture } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { of, throwError, Subject } from 'rxjs';
import { AddressAutocompleteComponent } from './address-autocomplete.component';
import { GeocodingService, GeocodeSuggestion } from '../../../core/services/geocoding.service';

const placeIdSuggestion: GeocodeSuggestion = { label: 'Place', city: null, country: null, lat: null, lng: null, place_id: 'pid123' };
const resolvedSuggestion: GeocodeSuggestion = { label: 'Place', city: 'Kyiv', country: 'Ukraine', lat: 50.45, lng: 30.52, place_id: 'pid123' };

function setupWithPlaceDetails(result: GeocodeSuggestion | Error) {
  const geocodingSpy = {
    autocomplete$: vi.fn().mockReturnValue(of([])),
    resetSessionToken: vi.fn(),
    getPlaceDetails$: result instanceof Error
      ? vi.fn().mockReturnValue(throwError(() => result))
      : vi.fn().mockReturnValue(of(result)),
  };
  TestBed.configureTestingModule({
    imports: [AddressAutocompleteComponent, ReactiveFormsModule],
    providers: [provideZonelessChangeDetection(), { provide: GeocodingService, useValue: geocodingSpy }],
  });
  const fixture = TestBed.createComponent(AddressAutocompleteComponent);
  const component = fixture.componentInstance;
  const control = new FormControl<string>('', { nonNullable: true });
  fixture.componentRef.setInput('control', control);
  fixture.detectChanges();
  return { fixture, component, control, geocodingSpy };
}

const DEBOUNCE = 350; // slightly over the 300ms component debounce
const JASMINE_TIMEOUT = 3000;

const mockSuggestions: GeocodeSuggestion[] = [
  { label: 'Київ, Україна', city: 'Київ', country: 'Україна', lat: 50.45, lng: 30.52 },
  { label: 'Київська область', city: 'Київська область', country: 'Україна', lat: 50.5, lng: 30.8 },
];

function setup(geocodingResult: GeocodeSuggestion[] | Error = mockSuggestions) {
  const geocodingSpy = {
    autocomplete$: geocodingResult instanceof Error
      ? vi.fn().mockReturnValue(throwError(() => geocodingResult))
      : vi.fn().mockReturnValue(of(geocodingResult)),
    resetSessionToken: vi.fn(),
  };

  TestBed.configureTestingModule({
    imports: [AddressAutocompleteComponent, ReactiveFormsModule],
    providers: [
      provideZonelessChangeDetection(),
      { provide: GeocodingService, useValue: geocodingSpy },
    ],
  });

  const fixture: ComponentFixture<AddressAutocompleteComponent> = TestBed.createComponent(AddressAutocompleteComponent);
  const component = fixture.componentInstance;
  const control = new FormControl<string>('', { nonNullable: true });
  fixture.componentRef.setInput('control', control);
  fixture.detectChanges();
  return { fixture, component, control, geocodingSpy };
}

describe('AddressAutocompleteComponent', () => {

  describe('initial state', () => {
    it('starts with empty suggestions, closed, not loading', () => {
      const { component } = setup();
      expect(component.suggestions()).toEqual([]);
      expect(component.isOpen()).toBe(false);
      expect(component.isLoading()).toBe(false);
      expect(component.activeIndex()).toBe(-1);
    });
  });

  describe('valueChanges → debounce → autocomplete', () => {
    it('does not call autocomplete for query shorter than 2 chars', () => {
      const { geocodingSpy, control } = setup();
      control.setValue('K');
      return new Promise<void>((resolve) => setTimeout(() => {
        expect(geocodingSpy.autocomplete$).not.toHaveBeenCalled();
        resolve();
      }, DEBOUNCE));
    }, JASMINE_TIMEOUT);

    it('calls autocomplete and opens dropdown for query ≥ 2 chars', () => {
      const { component, control, geocodingSpy } = setup();
      control.setValue('Ки');
      return new Promise<void>((resolve) => setTimeout(() => {
        expect(geocodingSpy.autocomplete$).toHaveBeenCalledWith('Ки');
        expect(component.suggestions()).toEqual(mockSuggestions);
        expect(component.isOpen()).toBe(true);
        expect(component.activeIndex()).toBe(-1);
        resolve();
      }, DEBOUNCE));
    }, JASMINE_TIMEOUT);

    it('clears suggestions and closes dropdown for empty query', () => {
      const { component, control } = setup();
      control.setValue('Ки');
      return new Promise<void>((resolve) => setTimeout(() => {
        expect(component.isOpen()).toBe(true);
        control.setValue('');
        setTimeout(() => {
          expect(component.isOpen()).toBe(false);
          expect(component.suggestions()).toEqual([]);
          resolve();
        }, DEBOUNCE);
      }, DEBOUNCE));
    }, JASMINE_TIMEOUT * 2);

    it('closes dropdown when autocomplete returns empty array', () => {
      const { component, control } = setup([]);
      control.setValue('Ки');
      return new Promise<void>((resolve) => setTimeout(() => {
        expect(component.isOpen()).toBe(false);
        expect(component.suggestions()).toEqual([]);
        resolve();
      }, DEBOUNCE));
    }, JASMINE_TIMEOUT);

    it('clears suggestions and stops loading on HTTP error', () => {
      const { component, control } = setup(new Error('network'));
      control.setValue('Ки');
      return new Promise<void>((resolve) => setTimeout(() => {
        expect(component.suggestions()).toEqual([]);
        expect(component.isLoading()).toBe(false);
        resolve();
      }, DEBOUNCE));
    }, JASMINE_TIMEOUT);

    it('sets isLoading true while waiting for results then false after results arrive', () => {
      const subject$ = new Subject<GeocodeSuggestion[]>();
      const geocodingSpy = {
        autocomplete$: vi.fn().mockReturnValue(subject$.asObservable()),
        resetSessionToken: vi.fn(),
      };

      TestBed.configureTestingModule({
        imports: [AddressAutocompleteComponent, ReactiveFormsModule],
        providers: [provideZonelessChangeDetection(), { provide: GeocodingService, useValue: geocodingSpy }],
      });
      const fixture = TestBed.createComponent(AddressAutocompleteComponent);
      const component = fixture.componentInstance;
      const control = new FormControl<string>('', { nonNullable: true });
      fixture.componentRef.setInput('control', control);
      fixture.detectChanges();

      control.setValue('Ки');
      return new Promise<void>((resolve) => setTimeout(() => {
        expect(component.isLoading()).toBe(true);

        subject$.next([]);
        subject$.complete();

        expect(component.isLoading()).toBe(false);
        resolve();
      }, DEBOUNCE));
    }, JASMINE_TIMEOUT);
  });

  describe('select()', () => {
    it('sets control value, closes dropdown, emits selected suggestion', () => {
      const { component, control } = setup();
      component.suggestions.set(mockSuggestions);
      component.isOpen.set(true);

      const emitted: GeocodeSuggestion[] = [];
      component.selected.subscribe(s => emitted.push(s));

      component.select(mockSuggestions[0]);
      expect(control.value).toBe('Київ, Україна');
      expect(component.isOpen()).toBe(false);
      expect(component.suggestions()).toEqual([]);
      expect(emitted).toEqual([mockSuggestions[0]]);
    });

    it('does not re-trigger the autocomplete pipeline (emitEvent: false)', () => {
      const { component, geocodingSpy } = setup();
      component.suggestions.set(mockSuggestions);
      component.isOpen.set(true);
      component.select(mockSuggestions[0]);
      return new Promise<void>((resolve) => setTimeout(() => {
        expect(geocodingSpy.autocomplete$).not.toHaveBeenCalled();
        resolve();
      }, DEBOUNCE));
    }, JASMINE_TIMEOUT);

    describe('place_id resolution path', () => {
      it('fetches place details and emits resolved suggestion', () => {
        const { component } = setupWithPlaceDetails(resolvedSuggestion);
        const emitted: GeocodeSuggestion[] = [];
        component.selected.subscribe(s => emitted.push(s));
        component.select(placeIdSuggestion);
        expect(emitted).toEqual([resolvedSuggestion]);
      });

      it('sets isLoading true then false during resolution', () => {
        let loadingDuring = false;
        const geocodingSpy = {
          autocomplete$: vi.fn().mockReturnValue(of([])),
          resetSessionToken: vi.fn(),
          getPlaceDetails$: vi.fn().mockImplementation(() => {
            loadingDuring = true;
            return of(resolvedSuggestion);
          }),
        };
        TestBed.configureTestingModule({
          imports: [AddressAutocompleteComponent, ReactiveFormsModule],
          providers: [provideZonelessChangeDetection(), { provide: GeocodingService, useValue: geocodingSpy }],
        });
        const fixture = TestBed.createComponent(AddressAutocompleteComponent);
        const component = fixture.componentInstance;
        const control = new FormControl<string>('', { nonNullable: true });
        fixture.componentRef.setInput('control', control);
        fixture.detectChanges();
        component.select(placeIdSuggestion);
        expect(loadingDuring).toBe(true);
        expect(component.isLoading()).toBe(false);
      });

      it('on getPlaceDetails$ error, emits original suggestion', () => {
        const { component } = setupWithPlaceDetails(new Error('network'));
        const emitted: GeocodeSuggestion[] = [];
        component.selected.subscribe(s => emitted.push(s));
        component.select(placeIdSuggestion);
        expect(emitted).toEqual([placeIdSuggestion]);
      });

      it('calls resetSessionToken and emits directly when suggestion has place_id AND lat is not null', () => {
        const suggestionWithCoords: GeocodeSuggestion = {
          label: 'Place With Coords', city: 'Kyiv', country: 'Ukraine',
          lat: 50.45, lng: 30.52, place_id: 'pid-with-coords',
        };
        const geocodingSpy = {
          autocomplete$: vi.fn().mockReturnValue(of([])),
          resetSessionToken: vi.fn(),
          getPlaceDetails$: vi.fn(),
        };
        TestBed.configureTestingModule({
          imports: [AddressAutocompleteComponent, ReactiveFormsModule],
          providers: [provideZonelessChangeDetection(), { provide: GeocodingService, useValue: geocodingSpy }],
        });
        const fixture = TestBed.createComponent(AddressAutocompleteComponent);
        const component = fixture.componentInstance;
        const control = new FormControl<string>('', { nonNullable: true });
        fixture.componentRef.setInput('control', control);
        fixture.detectChanges();

        const emitted: GeocodeSuggestion[] = [];
        component.selected.subscribe(s => emitted.push(s));
        component.select(suggestionWithCoords);

        expect(geocodingSpy.resetSessionToken).toHaveBeenCalled();
        expect(geocodingSpy.getPlaceDetails$).not.toHaveBeenCalled();
        expect(emitted).toEqual([suggestionWithCoords]);
        expect(control.value).toBe('Place With Coords');
        expect(component.isOpen()).toBe(false);
      });
    });
  });

  describe('onKeydown()', () => {
    it('does nothing when dropdown is closed', () => {
      const { component } = setup();
      component.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
      expect(component.activeIndex()).toBe(-1);
    });

    it('ArrowDown increments activeIndex', () => {
      const { component } = setup();
      component.suggestions.set(mockSuggestions);
      component.isOpen.set(true);
      component.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
      expect(component.activeIndex()).toBe(0);
      component.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
      expect(component.activeIndex()).toBe(1);
    });

    it.each<[string, 'ArrowDown' | 'ArrowUp', number, number]>([
      ['ArrowDown wraps from last item to first', 'ArrowDown', 1, 0],
      ['ArrowUp decrements activeIndex', 'ArrowUp', 1, 0],
      ['ArrowUp wraps from first item to last', 'ArrowUp', 0, 1],
    ])('%s', (_label, key, startIndex, expectedIndex) => {
      const { component } = setup();
      component.suggestions.set(mockSuggestions);
      component.isOpen.set(true);
      component.activeIndex.set(startIndex);
      component.onKeydown(new KeyboardEvent('keydown', { key }));
      expect(component.activeIndex()).toBe(expectedIndex);
    });

    it('Enter selects the active suggestion', () => {
      const { component, control } = setup();
      component.suggestions.set(mockSuggestions);
      component.isOpen.set(true);
      component.activeIndex.set(0);

      const emitted: GeocodeSuggestion[] = [];
      component.selected.subscribe(s => emitted.push(s));

      component.onKeydown(new KeyboardEvent('keydown', { key: 'Enter' }));
      expect(control.value).toBe(mockSuggestions[0].label);
      expect(emitted).toEqual([mockSuggestions[0]]);
    });

    it('Enter does nothing when activeIndex is -1', () => {
      const { component } = setup();
      component.suggestions.set(mockSuggestions);
      component.isOpen.set(true);
      component.onKeydown(new KeyboardEvent('keydown', { key: 'Enter' }));
      expect(component.isOpen()).toBe(true);
    });

    it('Escape closes the dropdown', () => {
      const { component } = setup();
      component.isOpen.set(true);
      component.onKeydown(new KeyboardEvent('keydown', { key: 'Escape' }));
      expect(component.isOpen()).toBe(false);
    });
  });

  describe('onDocumentClick()', () => {
    it('closes dropdown when clicking outside the component', () => {
      const { component } = setup();
      component.isOpen.set(true);
      const outsideEl = document.createElement('div');
      document.body.appendChild(outsideEl);
      component.onDocumentClick({ target: outsideEl } as unknown as MouseEvent);
      expect(component.isOpen()).toBe(false);
      outsideEl.remove();
    });

    it('keeps dropdown open when clicking inside the component', () => {
      const { fixture, component } = setup();
      component.isOpen.set(true);
      component.onDocumentClick({ target: fixture.nativeElement } as unknown as MouseEvent);
      expect(component.isOpen()).toBe(true);
    });
  });

  describe('destroy', () => {
    it('stops reacting to valueChanges after component is destroyed', () => {
      const { fixture, control, geocodingSpy } = setup();
      fixture.destroy();
      control.setValue('Ки');
      return new Promise<void>((resolve) => setTimeout(() => {
        expect(geocodingSpy.autocomplete$).not.toHaveBeenCalled();
        resolve();
      }, DEBOUNCE));
    }, JASMINE_TIMEOUT);
  });
});
