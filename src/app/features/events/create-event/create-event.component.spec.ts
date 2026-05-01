import { TestBed } from '@angular/core/testing';
import { ComponentFixture } from '@angular/core/testing';
import { provideZonelessChangeDetection, NO_ERRORS_SCHEMA } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CreateEventComponent } from './create-event.component';
import { EventService } from '../../../core/services/event.service';
import { GeocodingService, GeocodeSuggestion } from '../../../core/services/geocoding.service';
import { ClubEvent } from '../../../core/models/event.model';
import { of } from 'rxjs';

function makeEvent(overrides: Partial<ClubEvent> = {}): ClubEvent {
  return {
    id: 'e1', clubId: 'c1', clubName: 'Test Club', organizerId: 'u1',
    title: 'Test Event', description: null,
    date: '2025-06-01T10:00:00', city: 'Kyiv',
    address: null, lat: null, lng: null, status: 'scheduled',
    coverUrl: null, theme: null, tags: [],
    durationMinutes: null, afterMeetingVenue: null,
    attendeeCount: 5, isAttending: false, ...overrides,
  };
}

describe('CreateEventComponent', () => {
  let fixture: ComponentFixture<CreateEventComponent>;
  let component: CreateEventComponent;
  let eventServiceSpy: jasmine.SpyObj<EventService>;
  let router: Router;

  beforeEach(() => {
    eventServiceSpy = jasmine.createSpyObj('EventService', ['createEvent']);
    eventServiceSpy.createEvent.and.returnValue(Promise.resolve(makeEvent()));

    const geocodingSpy = jasmine.createSpyObj('GeocodingService', ['autocomplete$']);
    geocodingSpy['autocomplete$'].and.returnValue(of([]));

    TestBed.configureTestingModule({
      imports: [CreateEventComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: EventService, useValue: eventServiceSpy },
        { provide: GeocodingService, useValue: geocodingSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    fixture = TestBed.createComponent(CreateEventComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('clubId', 'c1');
    fixture.detectChanges();
  });

  describe('initial state', () => {
    it('form is invalid on init (required fields empty)', () => {
      expect(component.form.invalid).toBeTrue();
    });

    it('isSubmitting defaults to false', () => {
      expect(component.isSubmitting()).toBeFalse();
    });

    it('errorMessage defaults to null', () => {
      expect(component.errorMessage()).toBeNull();
    });

    it('showAfterVenue defaults to false', () => {
      expect(component.showAfterVenue()).toBeFalse();
    });
  });

  describe('onAddressSelect', () => {
    it('patches city, address, lat, lng from suggestion', () => {
      const suggestion: GeocodeSuggestion = {
        label: 'Kyiv, Ukraine',
        city: 'Kyiv',
        country: 'Ukraine',
        lat: 50.45,
        lng: 30.52,
      };
      component.onAddressSelect(suggestion);
      expect(component.form.controls.city.value).toBe('Kyiv');
      expect(component.form.controls.address.value).toBe('Kyiv, Ukraine');
      expect(component.form.controls.lat.value).toBe(50.45);
      expect(component.form.controls.lng.value).toBe(30.52);
    });

    it('uses label as city when suggestion.city is null', () => {
      const suggestion: GeocodeSuggestion = {
        label: 'Some Place',
        city: null,
        country: 'Ukraine',
        lat: 50.0,
        lng: 30.0,
      };
      component.onAddressSelect(suggestion);
      expect(component.form.controls.city.value).toBe('Some Place');
    });
  });

  describe('toggleAfterVenue', () => {
    it('toggles showAfterVenue to true', () => {
      component.toggleAfterVenue();
      expect(component.showAfterVenue()).toBeTrue();
    });

    it('clears after-venue fields when toggled back to false', () => {
      component.toggleAfterVenue();
      component.form.controls.afterVenueName.setValue('Bar');
      component.form.controls.afterVenueAddress.setValue('Street 1');
      component.toggleAfterVenue();
      expect(component.showAfterVenue()).toBeFalse();
      expect(component.form.controls.afterVenueName.value).toBe('');
      expect(component.form.controls.afterVenueAddress.value).toBe('');
    });
  });

  describe('onSubmit', () => {
    function fillValidForm(): void {
      component.form.controls.title.setValue('Book Club Meetup');
      component.form.controls.date.setValue('2025-08-01T10:00');
      component.form.controls.city.setValue('Kyiv');
    }

    it('does not call createEvent when form is invalid', async () => {
      await component.onSubmit();
      expect(eventServiceSpy.createEvent).not.toHaveBeenCalled();
    });

    it('calls createEvent with clubId and form values when form is valid', async () => {
      fillValidForm();
      await component.onSubmit();
      expect(eventServiceSpy.createEvent).toHaveBeenCalledWith('c1', jasmine.objectContaining({
        title: 'Book Club Meetup',
        city: 'Kyiv',
      }));
    });

    it('navigates to event detail after successful creation', async () => {
      fillValidForm();
      await component.onSubmit();
      expect(router.navigate).toHaveBeenCalledWith(['/events', 'e1']);
    });

    it('sets errorMessage on createEvent failure', async () => {
      fillValidForm();
      eventServiceSpy.createEvent.and.returnValue(Promise.reject(new Error('Server error')));
      await component.onSubmit();
      expect(component.errorMessage()).toBe('Failed to create event. Please try again.');
    });

    it('resets isSubmitting to false after completion', async () => {
      fillValidForm();
      await component.onSubmit();
      expect(component.isSubmitting()).toBeFalse();
    });

    it('resets isSubmitting to false even on error', async () => {
      fillValidForm();
      eventServiceSpy.createEvent.and.returnValue(Promise.reject(new Error('error')));
      await component.onSubmit();
      expect(component.isSubmitting()).toBeFalse();
    });
  });
});
