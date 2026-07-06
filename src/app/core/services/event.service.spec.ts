import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TranslateService } from '@ngx-translate/core';
import { EventService } from './event.service';
import { environment } from '../../../environments/environment';

const API = environment.apiUrl;

function makeApiEvent(overrides: Record<string, unknown> = {}) {
  return {
    id: 'e1', clubId: 'c1', clubName: 'Test Club', organizerId: 'u1',
    title: 'Test Event', description: null,
    date: '2025-06-01T10:00:00', city: 'Kyiv',
    address: null, lat: null, lng: null, status: 'scheduled',
    cancelledAt: null, theme: null, tags: [],
    durationMinutes: null, afterMeetingVenue: null,
    attendeeCount: 5, isAttending: false, ...overrides,
  };
}

describe('EventService', () => {
  let service: EventService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        EventService,
        { provide: TranslateService, useValue: { instant: (key: string) => key } },
      ],
    });
    service = TestBed.inject(EventService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => { httpMock.verify(); });

  describe('loadAllEvents', () => {
    it('populates allEvents signal', async () => {
      const p = service.loadAllEvents();
      httpMock.expectOne(`${API}/events?skip=0&limit=50`).flush([makeApiEvent()]);
      await p;
      expect(service.allEvents().length).toBe(1);
      expect(service.allEvents()[0].id).toBe('e1');
    });

    it('passes custom skip and limit params', async () => {
      const p = service.loadAllEvents(10, 20);
      const req = httpMock.expectOne(`${API}/events?skip=10&limit=20`);
      expect(req.request.params.get('skip')).toBe('10');
      expect(req.request.params.get('limit')).toBe('20');
      req.flush([]);
      await p;
    });

    it('sets isLoading to false after success', async () => {
      const p = service.loadAllEvents();
      expect(service.isLoading()).toBe(true);
      httpMock.expectOne(`${API}/events?skip=0&limit=50`).flush([makeApiEvent()]);
      await p;
      expect(service.isLoading()).toBe(false);
    });

    it('sets error on failure', async () => {
      const p = service.loadAllEvents();
      httpMock.expectOne(`${API}/events?skip=0&limit=50`).flush({}, { status: 500, statusText: 'Error' });
      await p;
      expect(service.error()).toBe('EVENTS.load_error');
      expect(service.isLoading()).toBe(false);
    });
  });

  describe('loadMyEvents', () => {
    it('populates myEvents signal', async () => {
      const p = service.loadMyEvents();
      httpMock.expectOne(`${API}/events/my`).flush([makeApiEvent({ id: 'e2' })]);
      await p;
      expect(service.myEvents().length).toBe(1);
      expect(service.myEvents()[0].id).toBe('e2');
    });

    it('sets error on failure', async () => {
      const p = service.loadMyEvents();
      httpMock.expectOne(`${API}/events/my`).flush({}, { status: 500, statusText: 'Error' });
      await p;
      expect(service.error()).toBe('EVENTS.load_my_error');
    });
  });

  describe('getEventById', () => {
    it('returns mapped event on success', async () => {
      const p = service.getEventById('e1');
      httpMock.expectOne(`${API}/events/e1`).flush(makeApiEvent());
      const event = await p;
      expect(event?.id).toBe('e1');
      expect(event?.title).toBe('Test Event');
    });

    it('returns null on 404', async () => {
      const p = service.getEventById('e1');
      httpMock.expectOne(`${API}/events/e1`).flush({}, { status: 404, statusText: 'Not Found' });
      const event = await p;
      expect(event).toBeNull();
    });
  });

  describe('eventById$', () => {
    it('emits the mapped event from GET /events/:id', () => {
      let emitted: { id: string } | undefined;
      service.eventById$('e1').subscribe((e) => (emitted = e));
      httpMock.expectOne(`${API}/events/e1`).flush(makeApiEvent());
      expect(emitted?.id).toBe('e1');
    });
  });

  describe('setCityFilter / filteredAllEvents', () => {
    beforeEach(async () => {
      const p = service.loadAllEvents();
      httpMock.expectOne(`${API}/events?skip=0&limit=50`).flush([
        makeApiEvent({ id: 'e1', city: 'Kyiv' }),
        makeApiEvent({ id: 'e2', city: 'Lviv' }),
        makeApiEvent({ id: 'e3', city: 'Kyiv' }),
      ]);
      await p;
    });

    it('filters events by city', () => {
      service.setCityFilter('Kyiv');
      const filtered = service.filteredAllEvents();
      expect(filtered.length).toBe(2);
      expect(filtered.every(e => e.city === 'Kyiv')).toBe(true);
    });

    it('empty filter returns all events', () => {
      service.setCityFilter('Kyiv');
      service.setCityFilter('');
      expect(service.filteredAllEvents().length).toBe(3);
    });
  });

  describe('availableCities', () => {
    it('returns sorted unique cities from allEvents', async () => {
      const p = service.loadAllEvents();
      httpMock.expectOne(`${API}/events?skip=0&limit=50`).flush([
        makeApiEvent({ id: 'e1', city: 'Lviv' }),
        makeApiEvent({ id: 'e2', city: 'Kyiv' }),
        makeApiEvent({ id: 'e3', city: 'Lviv' }),
      ]);
      await p;
      const cities = service.availableCities();
      expect(cities).toEqual(['Kyiv', 'Lviv']);
    });
  });

  describe('groupedByDate', () => {
    it('groups filtered events by date (YYYY-MM-DD key)', async () => {
      const p = service.loadAllEvents();
      httpMock.expectOne(`${API}/events?skip=0&limit=50`).flush([
        makeApiEvent({ id: 'e1', date: '2025-06-01T10:00:00', city: 'Kyiv' }),
        makeApiEvent({ id: 'e2', date: '2025-06-01T14:00:00', city: 'Kyiv' }),
        makeApiEvent({ id: 'e3', date: '2025-07-15T10:00:00', city: 'Kyiv' }),
      ]);
      await p;
      const grouped = service.groupedByDate();
      expect(grouped['2025-06-01']).toBeDefined();
      expect(grouped['2025-06-01'].length).toBe(2);
      expect(grouped['2025-07-15']).toBeDefined();
      expect(grouped['2025-07-15'].length).toBe(1);
    });
  });

  describe('attendEvent', () => {
    beforeEach(async () => {
      const allP = service.loadAllEvents();
      httpMock.expectOne(`${API}/events?skip=0&limit=50`).flush([
        makeApiEvent({ id: 'e1', attendeeCount: 5, isAttending: false }),
      ]);
      await allP;
      const myP = service.loadMyEvents();
      httpMock.expectOne(`${API}/events/my`).flush([
        makeApiEvent({ id: 'e1', attendeeCount: 5, isAttending: false }),
      ]);
      await myP;
    });

    it('sends POST to /events/:id/attend', async () => {
      const p = service.attendEvent('e1');
      const req = httpMock.expectOne(`${API}/events/e1/attend`);
      expect(req.request.method).toBe('POST');
      req.flush(null);
      await p;
    });

    it('increments attendeeCount and sets isAttending true in allEvents', async () => {
      const p = service.attendEvent('e1');
      httpMock.expectOne(`${API}/events/e1/attend`).flush(null);
      await p;
      const event = service.allEvents().find(e => e.id === 'e1');
      expect(event?.attendeeCount).toBe(6);
      expect(event?.isAttending).toBe(true);
    });

    it('increments attendeeCount and sets isAttending true in myEvents', async () => {
      const p = service.attendEvent('e1');
      httpMock.expectOne(`${API}/events/e1/attend`).flush(null);
      await p;
      const event = service.myEvents().find(e => e.id === 'e1');
      expect(event?.attendeeCount).toBe(6);
      expect(event?.isAttending).toBe(true);
    });

    it('returns joinRequestStatus value from API response', async () => {
      const p = service.attendEvent('e1');
      httpMock.expectOne(`${API}/events/e1/attend`).flush({ attendeeCount: 6, joinRequestStatus: 'pending' });
      const result = await p;
      expect(result.joinRequestStatus).toBe('pending');
    });

    it('does not change unrelated events when patching attendance', async () => {
      // Load a second event
      const allP2 = service.loadAllEvents();
      httpMock.expectOne(`${API}/events?skip=0&limit=50`).flush([
        makeApiEvent({ id: 'e1', attendeeCount: 5, isAttending: false }),
        makeApiEvent({ id: 'e2', attendeeCount: 3, isAttending: false }),
      ]);
      await allP2;

      const p = service.attendEvent('e1');
      httpMock.expectOne(`${API}/events/e1/attend`).flush({ attendeeCount: 6, joinRequestStatus: 'none' });
      await p;

      const e2 = service.allEvents().find(e => e.id === 'e2');
      expect(e2?.attendeeCount).toBe(3);
      expect(e2?.isAttending).toBe(false);
    });
  });

  describe('cancelAttendance', () => {
    beforeEach(async () => {
      const allP = service.loadAllEvents();
      httpMock.expectOne(`${API}/events?skip=0&limit=50`).flush([
        makeApiEvent({ id: 'e1', attendeeCount: 5, isAttending: true }),
      ]);
      await allP;
      const myP = service.loadMyEvents();
      httpMock.expectOne(`${API}/events/my`).flush([
        makeApiEvent({ id: 'e1', attendeeCount: 5, isAttending: true }),
      ]);
      await myP;
    });

    it('sends DELETE to /events/:id/attend', async () => {
      const p = service.cancelAttendance('e1');
      const req = httpMock.expectOne(`${API}/events/e1/attend`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
      await p;
    });

    it('decrements attendeeCount and sets isAttending false in allEvents', async () => {
      const p = service.cancelAttendance('e1');
      httpMock.expectOne(`${API}/events/e1/attend`).flush(null);
      await p;
      const event = service.allEvents().find(e => e.id === 'e1');
      expect(event?.attendeeCount).toBe(4);
      expect(event?.isAttending).toBe(false);
    });

    it('decrements attendeeCount and sets isAttending false in myEvents', async () => {
      const p = service.cancelAttendance('e1');
      httpMock.expectOne(`${API}/events/e1/attend`).flush(null);
      await p;
      const event = service.myEvents().find(e => e.id === 'e1');
      expect(event?.attendeeCount).toBe(4);
      expect(event?.isAttending).toBe(false);
    });
  });

  describe('createEvent', () => {
    it('sends POST to /clubs/:clubId/events and returns mapped event', async () => {
      const payload = {
        title: 'New Event',
        date: '2025-08-01T10:00:00',
        city: 'Odesa',
      };
      const p = service.createEvent('c1', payload);
      const req = httpMock.expectOne(`${API}/clubs/c1/events`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush(makeApiEvent({ id: 'e5', title: 'New Event', city: 'Odesa' }));
      const event = await p;
      expect(event.id).toBe('e5');
      expect(event.title).toBe('New Event');
    });
  });

  describe('rescheduleEvent', () => {
    beforeEach(async () => {
      const p = service.loadAllEvents();
      httpMock.expectOne(`${API}/events?skip=0&limit=50`).flush([
        makeApiEvent({ id: 'e1', date: '2025-06-01T10:00:00' }),
      ]);
      await p;
    });

    it('sends PATCH with newDate, newCity, newAddress', async () => {
      const p = service.rescheduleEvent('e1', '2025-09-01T10:00:00', 'Dnipro', 'New Street 1');
      const req = httpMock.expectOne(`${API}/events/e1/reschedule`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({
        newDate: '2025-09-01T10:00:00',
        newCity: 'Dnipro',
        newAddress: 'New Street 1',
      });
      req.flush(makeApiEvent({ id: 'e1', date: '2025-09-01T10:00:00', city: 'Dnipro' }));
      await p;
    });

    it('sends null for missing newCity and newAddress', async () => {
      const p = service.rescheduleEvent('e1', '2025-09-01T10:00:00');
      const req = httpMock.expectOne(`${API}/events/e1/reschedule`);
      expect(req.request.body).toEqual({
        newDate: '2025-09-01T10:00:00',
        newCity: null,
        newAddress: null,
      });
      req.flush(makeApiEvent({ id: 'e1', date: '2025-09-01T10:00:00' }));
      await p;
    });

    it('updates event in allEvents after reschedule', async () => {
      const p = service.rescheduleEvent('e1', '2025-09-01T10:00:00', 'Dnipro');
      httpMock.expectOne(`${API}/events/e1/reschedule`).flush(
        makeApiEvent({ id: 'e1', date: '2025-09-01T10:00:00', city: 'Dnipro' }),
      );
      await p;
      const event = service.allEvents().find(e => e.id === 'e1');
      expect(event?.city).toBe('Dnipro');
      expect(event?.date).toBe('2025-09-01T10:00:00');
    });
  });

  describe('cancelEvent', () => {
    beforeEach(async () => {
      const p = service.loadAllEvents();
      httpMock.expectOne(`${API}/events?skip=0&limit=50`).flush([
        makeApiEvent({ id: 'e1', status: 'scheduled' }),
      ]);
      await p;
    });

    it('sends PATCH to /events/:id/cancel', async () => {
      const p = service.cancelEvent('e1');
      const req = httpMock.expectOne(`${API}/events/e1/cancel`);
      expect(req.request.method).toBe('PATCH');
      req.flush(makeApiEvent({ id: 'e1', status: 'cancelled' }));
      await p;
    });

    it('updates event status to cancelled in allEvents', async () => {
      const p = service.cancelEvent('e1');
      httpMock.expectOne(`${API}/events/e1/cancel`).flush(
        makeApiEvent({ id: 'e1', status: 'cancelled' }),
      );
      await p;
      const event = service.allEvents().find(e => e.id === 'e1');
      expect(event?.status).toBe('cancelled');
    });
  });

  describe('updateEvent', () => {
    beforeEach(async () => {
      const allP = service.loadAllEvents();
      httpMock.expectOne(`${API}/events?skip=0&limit=50`).flush([
        makeApiEvent({ id: 'e1', title: 'Old Title', city: 'Kyiv' }),
      ]);
      await allP;
      const myP = service.loadMyEvents();
      httpMock.expectOne(`${API}/events/my`).flush([
        makeApiEvent({ id: 'e1', title: 'Old Title', city: 'Kyiv' }),
      ]);
      await myP;
    });

    it('sends PATCH to /events/:id with payload', async () => {
      const promise = service.updateEvent('e1', { title: 'New Title' });
      const req = httpMock.expectOne(`${API}/events/e1`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ title: 'New Title' });
      req.flush(makeApiEvent({ id: 'e1', title: 'New Title' }));
      await promise;
    });

    it('returns mapped ClubEvent on success', async () => {
      const promise = service.updateEvent('e1', { title: 'New Title' });
      httpMock.expectOne(`${API}/events/e1`).flush(makeApiEvent({ id: 'e1', title: 'New Title' }));
      const event = await promise;
      expect(event.id).toBe('e1');
      expect(event.title).toBe('New Title');
    });

    it('updates the event in allEvents signal', async () => {
      const promise = service.updateEvent('e1', { title: 'Updated' });
      httpMock.expectOne(`${API}/events/e1`).flush(makeApiEvent({ id: 'e1', title: 'Updated' }));
      await promise;
      expect(service.allEvents().find(e => e.id === 'e1')?.title).toBe('Updated');
    });

    it('updates the event in myEvents signal', async () => {
      const promise = service.updateEvent('e1', { title: 'Updated' });
      httpMock.expectOne(`${API}/events/e1`).flush(makeApiEvent({ id: 'e1', title: 'Updated' }));
      await promise;
      expect(service.myEvents().find(e => e.id === 'e1')?.title).toBe('Updated');
    });
  });

  describe('setEventWinner', () => {
    it('sends PATCH to /events/:id/winner', async () => {
      const promise = service.setEventWinner('e1', 'u2');
      const req = httpMock.expectOne(`${API}/events/e1/winner`);
      expect(req.request.method).toBe('PATCH');
      req.flush(null);
      await promise;
    });

    it('sends body with winner_id', async () => {
      const promise = service.setEventWinner('e1', 'u2');
      const req = httpMock.expectOne(`${API}/events/e1/winner`);
      expect(req.request.body).toEqual({ winner_id: 'u2' });
      req.flush(null);
      await promise;
    });
  });
});
