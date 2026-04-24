import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiEvent, mapEvent } from '../api/api-mappers';
import { AfterMeetingVenue, ClubEvent } from '../models/event.model';

export interface CreateEventPayload {
  title: string;
  description?: string | null;
  date: string;
  city: string;
  address?: string | null;
  lat?: number | null;
  lng?: number | null;
  theme?: string | null;
  tags?: string[];
  durationMinutes?: number | null;
  afterMeetingVenue?: AfterMeetingVenue | null;
}

@Injectable({ providedIn: 'root' })
export class EventService {
  private readonly http = inject(HttpClient);

  private readonly _allEvents = signal<ClubEvent[]>([]);
  private readonly _myEvents = signal<ClubEvent[]>([]);
  private readonly _isLoading = signal(false);
  private readonly _error = signal<string | null>(null);
  private readonly _cityFilter = signal<string | null>(null);

  readonly allEvents = this._allEvents.asReadonly();
  readonly myEvents = this._myEvents.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly cityFilter = this._cityFilter.asReadonly();

  readonly filteredAllEvents = computed(() => {
    const city = this._cityFilter();
    const events = this._allEvents();
    return city ? events.filter(e => e.city === city) : events;
  });

  readonly availableCities = computed<string[]>(() => {
    const seen = new Set<string>();
    for (const e of this._allEvents()) seen.add(e.city);
    return [...seen].sort((a, b) => a.localeCompare(b));
  });

  readonly groupedByDate = computed<Record<string, ClubEvent[]>>(() => {
    return this.filteredAllEvents().reduce<Record<string, ClubEvent[]>>((acc, e) => {
      const day = e.date.slice(0, 10);
      (acc[day] ??= []).push(e);
      return acc;
    }, {});
  });

  setCityFilter(city: string | null): void {
    this._cityFilter.set(city);
  }

  async loadAllEvents(skip = 0, limit = 50): Promise<void> {
    this._isLoading.set(true);
    this._error.set(null);
    try {
      const raw = await firstValueFrom(
        this.http.get<ApiEvent[]>(`${environment.apiUrl}/events`, {
          params: { skip: String(skip), limit: String(limit) },
        }),
      );
      this._allEvents.set(raw.map(mapEvent));
    } catch {
      this._error.set('Failed to load events');
    } finally {
      this._isLoading.set(false);
    }
  }

  async loadMyEvents(): Promise<void> {
    try {
      const raw = await firstValueFrom(
        this.http.get<ApiEvent[]>(`${environment.apiUrl}/events/my`),
      );
      this._myEvents.set(raw.map(mapEvent));
    } catch {
      this._error.set('Failed to load my events');
    }
  }

  async getEventById(id: string): Promise<ClubEvent | null> {
    try {
      const raw = await firstValueFrom(
        this.http.get<ApiEvent>(`${environment.apiUrl}/events/${id}`),
      );
      return mapEvent(raw);
    } catch {
      return null;
    }
  }

  async attendEvent(eventId: string): Promise<void> {
    await firstValueFrom(
      this.http.post(`${environment.apiUrl}/events/${eventId}/attend`, {}),
    );
    this._patchEventAttending(eventId, true);
  }

  async cancelAttendance(eventId: string): Promise<void> {
    await firstValueFrom(
      this.http.delete(`${environment.apiUrl}/events/${eventId}/attend`),
    );
    this._patchEventAttending(eventId, false);
  }

  async createEvent(clubId: string, payload: CreateEventPayload): Promise<ClubEvent> {
    const raw = await firstValueFrom(
      this.http.post<ApiEvent>(`${environment.apiUrl}/clubs/${clubId}/events`, payload),
    );
    return mapEvent(raw);
  }

  async rescheduleEvent(eventId: string, newDate: string, newCity?: string, newAddress?: string): Promise<void> {
    const raw = await firstValueFrom(
      this.http.patch<ApiEvent>(`${environment.apiUrl}/events/${eventId}/reschedule`, {
        newDate,
        newCity: newCity ?? null,
        newAddress: newAddress ?? null,
      }),
    );
    const updated = mapEvent(raw);
    this._updateEvent(updated);
  }

  async cancelEvent(eventId: string): Promise<void> {
    const raw = await firstValueFrom(
      this.http.patch<ApiEvent>(`${environment.apiUrl}/events/${eventId}/cancel`, {}),
    );
    const updated = mapEvent(raw);
    this._updateEvent(updated);
  }

  private _patchEventAttending(eventId: string, attending: boolean): void {
    const patch = (list: ClubEvent[]) =>
      list.map(e =>
        e.id === eventId
          ? { ...e, isAttending: attending, attendeeCount: e.attendeeCount + (attending ? 1 : -1) }
          : e,
      );
    this._allEvents.update(patch);
    this._myEvents.update(patch);
  }

  private _updateEvent(updated: ClubEvent): void {
    this._allEvents.update(list => list.map(e => (e.id === updated.id ? updated : e)));
    this._myEvents.update(list => list.map(e => (e.id === updated.id ? updated : e)));
  }
}
