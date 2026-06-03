import { TestBed } from '@angular/core/testing';
import { ComponentFixture } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { EventsFeedComponent } from './events-feed.component';
import { EventService } from '../../../core/services/event.service';
import { AuthService } from '../../../core/auth/auth.service';
import { makeClubEvent as makeEvent } from '../../../../testing/event-test.helpers';

function buildEventServiceMock() {
  return {
    loadAllEvents: vi.fn().mockResolvedValue(undefined),
    loadMyEvents: vi.fn().mockResolvedValue(undefined),
    attendEvent: vi.fn().mockResolvedValue(undefined),
    cancelAttendance: vi.fn().mockResolvedValue(undefined),
    setCityFilter: vi.fn(),
    groupedByDate: vi.fn().mockReturnValue({}),
    filteredAllEvents: vi.fn().mockReturnValue([]),
    myEvents: vi.fn().mockReturnValue([]),
    allEvents: vi.fn().mockReturnValue([]),
    isLoading: vi.fn().mockReturnValue(false),
    error: vi.fn().mockReturnValue(null),
    cityFilter: vi.fn().mockReturnValue(''),
    availableCities: vi.fn().mockReturnValue([]),
  };
}

describe('EventsFeedComponent', () => {
  let fixture: ComponentFixture<EventsFeedComponent>;
  let component: EventsFeedComponent;
  let eventServiceMock: ReturnType<typeof buildEventServiceMock>;
  let authSpy: { isAuthenticated: ReturnType<typeof vi.fn>; isOrganizer: ReturnType<typeof vi.fn>; currentUser: ReturnType<typeof vi.fn> };

  function setup(isAuthenticated = false) {
    eventServiceMock = buildEventServiceMock();
    authSpy = {
      isAuthenticated: vi.fn().mockReturnValue(isAuthenticated),
      isOrganizer: vi.fn().mockReturnValue(false),
      currentUser: vi.fn().mockReturnValue(null),
    };

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

    it('creates component', () => {
      expect(component).toBeTruthy();
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
      eventServiceMock.attendEvent.mockImplementation(async (id: string) => {
        idDuringCall = component.attendingEventId();
        return id as unknown;
      });
      await component.onAttend(makeEvent());
      expect(idDuringCall as string).toBe('e1');
      expect(component.attendingEventId()).toBeNull();
    });

    it('clears attendingEventId even when attendEvent throws', async () => {
      eventServiceMock.attendEvent.mockReturnValue(Promise.reject(new Error('Network error')));
      await component.onAttend(makeEvent());
      expect(component.attendingEventId()).toBeNull();
    });
  });

  describe('onCancelAttend', () => {
    beforeEach(() => setup(true));

    it('sets attendingEventId during the call and clears it after', async () => {
      let idDuringCall: unknown = null;
      eventServiceMock.cancelAttendance.mockImplementation(async (id: string) => {
        idDuringCall = component.attendingEventId();
        return id as unknown;
      });
      await component.onCancelAttend(makeEvent());
      expect(idDuringCall as string).toBe('e1');
      expect(component.attendingEventId()).toBeNull();
    });

    it('clears attendingEventId even when cancelAttendance throws', async () => {
      eventServiceMock.cancelAttendance.mockReturnValue(Promise.reject(new Error('Network error')));
      await component.onCancelAttend(makeEvent());
      expect(component.attendingEventId()).toBeNull();
    });
  });
});
