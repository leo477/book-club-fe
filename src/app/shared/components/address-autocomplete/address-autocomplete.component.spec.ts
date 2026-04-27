import { TestBed } from '@angular/core/testing';
import { ComponentFixture } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { AddressAutocompleteComponent } from './address-autocomplete.component';
import { GeocodingService, GeocodeSuggestion } from '../../../core/services/geocoding.service';

const DEBOUNCE = 350; // slightly over the 300ms component debounce
const JASMINE_TIMEOUT = 3000;

const mockSuggestions: GeocodeSuggestion[] = [
  { label: 'Київ, Україна', city: 'Київ', country: 'Україна', lat: 50.45, lng: 30.52 },
  { label: 'Київська область', city: 'Київська область', country: 'Україна', lat: 50.5, lng: 30.8 },
];

function setup(geocodingResult: GeocodeSuggestion[] | Error = mockSuggestions) {
  const geocodingSpy = jasmine.createSpyObj<GeocodingService>('GeocodingService', ['autocomplete']);
  if (geocodingResult instanceof Error) {
    geocodingSpy.autocomplete.and.returnValue(throwError(() => geocodingResult));
  } else {
    geocodingSpy.autocomplete.and.returnValue(of(geocodingResult));
  }

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
      expect(component.isOpen()).toBeFalse();
      expect(component.isLoading()).toBeFalse();
      expect(component.activeIndex()).toBe(-1);
    });
  });

  describe('valueChanges → debounce → autocomplete', () => {
    it('does not call autocomplete for query shorter than 2 chars', (done) => {
      const { geocodingSpy, control } = setup();
      control.setValue('K');
      setTimeout(() => {
        expect(geocodingSpy.autocomplete).not.toHaveBeenCalled();
        done();
      }, DEBOUNCE);
    }, JASMINE_TIMEOUT);

    it('calls autocomplete and opens dropdown for query ≥ 2 chars', (done) => {
      const { component, control, geocodingSpy } = setup();
      control.setValue('Ки');
      setTimeout(() => {
        expect(geocodingSpy.autocomplete).toHaveBeenCalledWith('Ки');
        expect(component.suggestions()).toEqual(mockSuggestions);
        expect(component.isOpen()).toBeTrue();
        expect(component.activeIndex()).toBe(-1);
        done();
      }, DEBOUNCE);
    }, JASMINE_TIMEOUT);

    it('clears suggestions and closes dropdown for empty query', (done) => {
      const { component, control } = setup();
      control.setValue('Ки');
      setTimeout(() => {
        expect(component.isOpen()).toBeTrue();
        control.setValue('');
        setTimeout(() => {
          expect(component.isOpen()).toBeFalse();
          expect(component.suggestions()).toEqual([]);
          done();
        }, DEBOUNCE);
      }, DEBOUNCE);
    }, JASMINE_TIMEOUT * 2);

    it('closes dropdown when autocomplete returns empty array', (done) => {
      const { component, control } = setup([]);
      control.setValue('Ки');
      setTimeout(() => {
        expect(component.isOpen()).toBeFalse();
        expect(component.suggestions()).toEqual([]);
        done();
      }, DEBOUNCE);
    }, JASMINE_TIMEOUT);

    it('clears suggestions and stops loading on HTTP error', (done) => {
      const { component, control } = setup(new Error('network'));
      control.setValue('Ки');
      setTimeout(() => {
        expect(component.suggestions()).toEqual([]);
        expect(component.isLoading()).toBeFalse();
        done();
      }, DEBOUNCE);
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
      expect(component.isOpen()).toBeFalse();
      expect(component.suggestions()).toEqual([]);
      expect(emitted).toEqual([mockSuggestions[0]]);
    });

    it('does not re-trigger the autocomplete pipeline (emitEvent: false)', (done) => {
      const { component, geocodingSpy } = setup();
      component.suggestions.set(mockSuggestions);
      component.isOpen.set(true);
      component.select(mockSuggestions[0]);
      setTimeout(() => {
        expect(geocodingSpy.autocomplete).not.toHaveBeenCalled();
        done();
      }, DEBOUNCE);
    }, JASMINE_TIMEOUT);
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

    it('ArrowDown wraps from last item to first', () => {
      const { component } = setup();
      component.suggestions.set(mockSuggestions);
      component.isOpen.set(true);
      component.activeIndex.set(1);
      component.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
      expect(component.activeIndex()).toBe(0);
    });

    it('ArrowUp decrements activeIndex', () => {
      const { component } = setup();
      component.suggestions.set(mockSuggestions);
      component.isOpen.set(true);
      component.activeIndex.set(1);
      component.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
      expect(component.activeIndex()).toBe(0);
    });

    it('ArrowUp wraps from first item to last', () => {
      const { component } = setup();
      component.suggestions.set(mockSuggestions);
      component.isOpen.set(true);
      component.activeIndex.set(0);
      component.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
      expect(component.activeIndex()).toBe(1);
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
      expect(component.isOpen()).toBeTrue();
    });

    it('Escape closes the dropdown', () => {
      const { component } = setup();
      component.isOpen.set(true);
      component.onKeydown(new KeyboardEvent('keydown', { key: 'Escape' }));
      expect(component.isOpen()).toBeFalse();
    });
  });

  describe('onDocumentClick()', () => {
    it('closes dropdown when clicking outside the component', () => {
      const { component } = setup();
      component.isOpen.set(true);
      const outsideEl = document.createElement('div');
      document.body.appendChild(outsideEl);
      component.onDocumentClick({ target: outsideEl } as unknown as MouseEvent);
      expect(component.isOpen()).toBeFalse();
      outsideEl.remove();
    });

    it('keeps dropdown open when clicking inside the component', () => {
      const { fixture, component } = setup();
      component.isOpen.set(true);
      component.onDocumentClick({ target: fixture.nativeElement } as unknown as MouseEvent);
      expect(component.isOpen()).toBeTrue();
    });
  });

  describe('destroy', () => {
    it('stops reacting to valueChanges after component is destroyed', (done) => {
      const { fixture, control, geocodingSpy } = setup();
      fixture.destroy();
      control.setValue('Ки');
      setTimeout(() => {
        expect(geocodingSpy.autocomplete).not.toHaveBeenCalled();
        done();
      }, DEBOUNCE);
    }, JASMINE_TIMEOUT);
  });
});
