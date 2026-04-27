import { TestBed } from '@angular/core/testing';
import { ComponentFixture } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { EventDetailComponent } from './event-detail.component';
import { EventService } from '../../../core/services/event.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ClubEvent } from '../../../core/models/event.model';

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

describe('EventDetailComponent', () => {
  let fixture: ComponentFixture<EventDetailComponent>;
  let component: EventDetailComponent;
  let eventServiceSpy: jasmine.SpyObj<EventService>;
  let authSpy: jasmine.SpyObj<AuthService>;

  function setup(currentUser: { id: string } | null = null, event: ClubEvent | null = makeEvent()) {
    eventServiceSpy = jasmine.createSpyObj('EventService', [
      'getEventById', 'attendEvent', 'cancelAttendance', 'cancelEvent',
    ]);
    eventServiceSpy.getEventById.and.returnValue(Promise.resolve(event));
    eventServiceSpy.attendEvent.and.returnValue(Promise.resolve());
    eventServiceSpy.cancelAttendance.and.returnValue(Promise.resolve());
    eventServiceSpy.cancelEvent.and.returnValue(Promise.resolve());

    authSpy = jasmine.createSpyObj('AuthService', [], {
      currentUser: jasmine.createSpy().and.returnValue(currentUser),
      isAuthenticated: jasmine.createSpy().and.returnValue(currentUser !== null),
    });

    TestBed.configureTestingModule({
      imports: [EventDetailComponent, TranslateModule.forRoot()],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: EventService, useValue: eventServiceSpy },
        { provide: AuthService, useValue: authSpy },
      ],
    });

    fixture = TestBed.createComponent(EventDetailComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('id', 'e1');
    fixture.detectChanges();
  }

  describe('effect — load event on id change', () => {
    it('calls getEventById with the provided id', async () => {
      setup();
      await fixture.whenStable();
      expect(eventServiceSpy.getEventById).toHaveBeenCalledWith('e1');
    });

    it('sets event signal after successful load', async () => {
      setup();
      await fixture.whenStable();
      expect(component.event()?.id).toBe('e1');
    });

    it('sets isLoading to false after load', async () => {
      setup();
      await eventServiceSpy.getEventById.calls.mostRecent().returnValue;
      await Promise.resolve();
      await Promise.resolve();
      expect(component.isLoading()).toBeFalse();
    });

    it('sets errorMessage when event is not found', async () => {
      setup(null, null);
      await fixture.whenStable();
      expect(component.errorMessage()).toContain('not found');
      expect(component.event()).toBeNull();
    });
  });

  describe('isOrganizer', () => {
    it('returns true when currentUser id matches organizerId', async () => {
      setup({ id: 'u1' });
      await fixture.whenStable();
      expect(component.isOrganizer()).toBeTrue();
    });

    it('returns false when currentUser id does not match organizerId', async () => {
      setup({ id: 'other-user' });
      await fixture.whenStable();
      expect(component.isOrganizer()).toBeFalse();
    });

    it('returns false when not authenticated', async () => {
      setup(null);
      await fixture.whenStable();
      expect(component.isOrganizer()).toBeFalse();
    });
  });

  describe('onAttend', () => {
    it('calls attendEvent and reloads the resource', async () => {
      setup();
      await fixture.whenStable();
      eventServiceSpy.getEventById.calls.reset();

      await component.onAttend();
      await fixture.whenStable();

      expect(eventServiceSpy.attendEvent).toHaveBeenCalledWith('e1');
      expect(eventServiceSpy.getEventById).toHaveBeenCalledWith('e1');
    });

    it('sets isActioning to false after completion', async () => {
      setup();
      await fixture.whenStable();
      await component.onAttend();
      expect(component.isActioning()).toBeFalse();
    });
  });

  describe('onCancelAttend', () => {
    it('calls cancelAttendance and reloads the resource', async () => {
      setup();
      await fixture.whenStable();
      eventServiceSpy.getEventById.calls.reset();

      await component.onCancelAttend();
      await fixture.whenStable();

      expect(eventServiceSpy.cancelAttendance).toHaveBeenCalledWith('e1');
      expect(eventServiceSpy.getEventById).toHaveBeenCalledWith('e1');
    });

    it('sets isActioning to false after completion', async () => {
      setup();
      await fixture.whenStable();
      await component.onCancelAttend();
      expect(component.isActioning()).toBeFalse();
    });
  });

  describe('onCancelEvent', () => {
    it('does nothing when confirm returns false', async () => {
      setup({ id: 'u1' });
      await fixture.whenStable();
      spyOn(window, 'confirm').and.returnValue(false);

      await component.onCancelEvent();

      expect(eventServiceSpy.cancelEvent).not.toHaveBeenCalled();
    });

    it('calls cancelEvent and reloads the resource when confirmed', async () => {
      setup({ id: 'u1' });
      await fixture.whenStable();
      spyOn(window, 'confirm').and.returnValue(true);
      eventServiceSpy.getEventById.calls.reset();

      await component.onCancelEvent();
      await fixture.whenStable();

      expect(eventServiceSpy.cancelEvent).toHaveBeenCalledWith('e1');
      expect(eventServiceSpy.getEventById).toHaveBeenCalledWith('e1');
    });

    it('sets isActioning to false after confirmed cancel', async () => {
      setup({ id: 'u1' });
      await fixture.whenStable();
      spyOn(window, 'confirm').and.returnValue(true);

      await component.onCancelEvent();
      expect(component.isActioning()).toBeFalse();
    });
  });
});
