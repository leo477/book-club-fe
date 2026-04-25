import { TestBed } from '@angular/core/testing';
import { ComponentFixture } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { EventsFeedComponent } from './events-feed.component';
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

function buildEventServiceMock() {
  return {
    loadAllEvents: jasmine.createSpy().and.returnValue(Promise.resolve()),
    loadMyEvents: jasmine.createSpy().and.returnValue(Promise.resolve()),
    attendEvent: jasmine.createSpy().and.returnValue(Promise.resolve()),
    cancelAttendance: jasmine.createSpy().and.returnValue(Promise.resolve()),
    setCityFilter: jasmine.createSpy(),
    groupedByDate: jasmine.createSpy().and.returnValue({}),
    filteredAllEvents: jasmine.createSpy().and.returnValue([]),
    myEvents: jasmine.createSpy().and.returnValue([]),
    allEvents: jasmine.createSpy().and.returnValue([]),
    isLoading: jasmine.createSpy().and.returnValue(false),
    error: jasmine.createSpy().and.returnValue(null),
    cityFilter: jasmine.createSpy().and.returnValue(null),
    availableCities: jasmine.createSpy().and.returnValue([]),
  };
}

describe('EventsFeedComponent', () => {
  let fixture: ComponentFixture<EventsFeedComponent>;
  let component: EventsFeedComponent;
  let eventServiceMock: ReturnType<typeof buildEventServiceMock>;
  let authSpy: jasmine.SpyObj<AuthService>;

  function setup(isAuthenticated = false) {
    eventServiceMock = buildEventServiceMock();
    authSpy = jasmine.createSpyObj('AuthService', [], {
      isAuthenticated: jasmine.createSpy().and.returnValue(isAuthenticated),
      currentUser: jasmine.createSpy().and.returnValue(null),
    });

    TestBed.configureTestingModule({
      imports: [EventsFeedComponent, TranslateModule.forRoot()],
      providers: [
        provideZonelessChangeDetection(),
        { provide: EventService, useValue: eventServiceMock },
        { provide: AuthService, useValue: authSpy },
      ],
    });

    fixture = TestBed.createComponent(EventsFeedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  describe('initial state', () => {
    beforeEach(() => setup());

    it('activeTab defaults to upcoming', () => {
      expect(component.activeTab()).toBe('upcoming');
    });

    it('attendingEventId defaults to null', () => {
      expect(component.attendingEventId()).toBeNull();
    });
  });

  describe('ngOnInit', () => {
    it('calls loadAllEvents on init', async () => {
      setup();
      await component.ngOnInit();
      expect(eventServiceMock.loadAllEvents).toHaveBeenCalled();
    });

    it('calls loadMyEvents when authenticated', async () => {
      setup(true);
      await component.ngOnInit();
      expect(eventServiceMock.loadMyEvents).toHaveBeenCalled();
    });

    it('does not call loadMyEvents when not authenticated', async () => {
      setup(false);
      await component.ngOnInit();
      expect(eventServiceMock.loadMyEvents).not.toHaveBeenCalled();
    });
  });

  describe('sortedDates', () => {
    it('returns empty array when no events are grouped', () => {
      setup();
      expect(component.sortedDates()).toEqual([]);
    });
  });

  describe('onAttend', () => {
    beforeEach(() => setup(true));

    it('sets attendingEventId during the call and clears it after', async () => {
      let idDuringCall: unknown = null;
      eventServiceMock.attendEvent.and.callFake(async (id: string) => {
        idDuringCall = component.attendingEventId();
        return id as unknown;
      });
      await component.onAttend(makeEvent());
      expect(idDuringCall as string).toBe('e1');
      expect(component.attendingEventId()).toBeNull();
    });

    it('clears attendingEventId even when attendEvent throws', async () => {
      eventServiceMock.attendEvent.and.returnValue(Promise.reject(new Error('Network error')));
      await component.onAttend(makeEvent());
      expect(component.attendingEventId()).toBeNull();
    });
  });

  describe('onCancelAttend', () => {
    beforeEach(() => setup(true));

    it('sets attendingEventId during the call and clears it after', async () => {
      let idDuringCall: unknown = null;
      eventServiceMock.cancelAttendance.and.callFake(async (id: string) => {
        idDuringCall = component.attendingEventId();
        return id as unknown;
      });
      await component.onCancelAttend(makeEvent());
      expect(idDuringCall as string).toBe('e1');
      expect(component.attendingEventId()).toBeNull();
    });

    it('clears attendingEventId even when cancelAttendance throws', async () => {
      eventServiceMock.cancelAttendance.and.returnValue(Promise.reject(new Error('Network error')));
      await component.onCancelAttend(makeEvent());
      expect(component.attendingEventId()).toBeNull();
    });
  });
});
