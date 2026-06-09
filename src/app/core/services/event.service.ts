import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom, map } from 'rxjs';
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
  coverUrl?: string | null;
  bookTitle?: string | null;
  googleBookId?: string | null;
}

export interface UpdateEventPayload {
  title?: string;
  description?: string | null;
  date?: string;
  city?: string;
  address?: string | null;
  lat?: number | null;
  lng?: number | null;
  theme?: string | null;
  tags?: string[];
  duration_minutes?: number | null;
  after_meeting_venue?: AfterMeetingVenue | null;
  cover_url?: string | null;
  google_book_id?: string | null;
  has_winner?: boolean;
}

@Injectable({ providedIn: 'root' })
export class EventService {
  private readonly http = inject(HttpClient);

  private readonly _allEvents = signal<ClubEvent[]>([]);
  private readonly _myEvents = signal<ClubEvent[]>([]);
  private readonly _isLoading = signal(false);
  private readonly _error = signal<string | null>(null);
  private readonly _cityFilter = signal<string>('');

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
    const byKey = new Map<string, string>();
    for (const e of this._allEvents()) {
      const original = e.city?.trim();
      if (!original) continue;
      const key = original.toLowerCase();
      if (!byKey.has(key)) byKey.set(key, original);
    }
    return [...byKey.values()].sort((a, b) => a.localeCompare(b));
  });

  readonly groupedByDate = computed<Record<string, ClubEvent[]>>(() => {
    return this.filteredAllEvents().reduce<Record<string, ClubEvent[]>>((acc, e) => {
      const day = e.date.slice(0, 10);
      if (!acc[day]) acc[day] = [];
      acc[day].push(e);
      return acc;
    }, {});
  });

  setCityFilter(city: string): void {
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

  async attendEvent(
    eventId: string,
  ): Promise<{ attendeeCount: number; joinRequestStatus: 'none' | 'pending' | 'member' }> {
    const result = await firstValueFrom(
      this.http.post<{ attendeeCount: number; joinRequestStatus: 'none' | 'pending' | 'member' }>(
        `${environment.apiUrl}/events/${eventId}/attend`,
        {},
      ),
    );
    this._patchEventAttending(eventId, true);
    return result;
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

  async updateEvent(eventId: string, payload: UpdateEventPayload): Promise<ClubEvent> {
    const raw = await firstValueFrom(
      this.http.patch<ApiEvent>(`${environment.apiUrl}/events/${eventId}`, payload).pipe(map(mapEvent)),
    );
    this._updateEvent(raw);
    return raw;
  }

  async setEventWinner(eventId: string, winnerId: string): Promise<void> {
    await firstValueFrom(
      this.http.patch<void>(`${environment.apiUrl}/events/${eventId}/winner`, { winner_id: winnerId }),
    );
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
