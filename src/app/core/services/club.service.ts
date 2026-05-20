import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiClub, ApiClubMember, ApiBanRecord, ApiEvent, mapClub, mapClubMember, mapBanRecord, mapEvent } from '../api/api-mappers';
import { AuthService } from '../auth/auth.service';
import { BanDuration, BanRecord, Club, ClubMemberDetail } from '../models/club.model';
import { ClubEvent } from '../models/event.model';

@Injectable({ providedIn: 'root' })
export class ClubService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  private readonly _clubs = signal<Club[]>([]);
  private readonly _myClubs = signal<Club[]>([]);
  private readonly _isLoading = signal(false);
  private readonly _error = signal<string | null>(null);
  private readonly _searchQuery = signal('');
  private readonly _cityFilter = signal<string | null>(null);
  private myClubsLoadedAt = 0;

  private readonly CLUB_CACHE_TTL_MS = 60_000;
  private readonly clubByIdCache = new Map<string, { data: Club; fetchedAt: number }>();
  private readonly membersCache = new Map<string, { data: ClubMemberDetail[]; fetchedAt: number }>();
  private readonly eventsCache = new Map<string, { data: ClubEvent[]; fetchedAt: number }>();

  /** Deduplicates concurrent loadMyClubs() calls — all callers share one in-flight request. */
  private _loadMyClubsInFlight: Promise<void> | null = null;

  private cacheRead<T>(cache: Map<string, { data: T; fetchedAt: number }>, key: string): T | null {
    const entry = cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.fetchedAt > this.CLUB_CACHE_TTL_MS) {
      cache.delete(key);
      return null;
    }
    return entry.data;
  }

  readonly clubs = this._clubs.asReadonly();
  readonly myClubs = this._myClubs.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly searchQuery = this._searchQuery.asReadonly();

  readonly myOwnedClubs = computed<Club[]>(() => {
    const userId = this.auth.currentUser()?.id;
    if (!userId) return [];
    return this._clubs().filter(c => c.organizerId === userId);
  });

  readonly myOwnedClubIds = computed<Set<string>>(() =>
    new Set(this.myOwnedClubs().map(c => c.id)),
  );

  readonly myClubIds = computed(() => new Set(this._myClubs().map(c => c.id)));

  readonly availableCities = computed<string[]>(() => {
    const cities = [...new Set(this._clubs().map(c => c.city).filter(Boolean))];
    return cities.sort((a, b) => a.localeCompare(b));
  });

  readonly filteredClubs = computed(() => {
    const q = this._searchQuery().toLowerCase().trim();
    const city = this._cityFilter();
    let clubs = this._clubs();
    if (q) {
      clubs = clubs.filter(
        c =>
          c.name.toLowerCase().includes(q) ||
          (c.description?.toLowerCase().includes(q) ?? false),
      );
    }
    if (city) {
      clubs = clubs.filter(c => c.city === city);
    }
    return clubs;
  });

  readonly upcomingByCity = computed<Record<string, Club[]>>(() => {
    const clubs = this.filteredClubs();
    return clubs.reduce<Record<string, Club[]>>((acc, club) => {
      const city = club.city || '';
      if (!acc[city]) acc[city] = [];
      acc[city].push(club);
      return acc;
    }, {});
  });

  readonly myParticipatedClubs = computed<Club[]>(() => []);
  readonly myMissedClubs = computed<Club[]>(() => []);

  setSearchQuery(query: string): void {
    this._searchQuery.set(query);
  }

  setCityFilter(city: string | null): void {
    this._cityFilter.set(city);
  }

  async loadPublicClubs(): Promise<void> {
    this._isLoading.set(true);
    this._error.set(null);
    try {
      const raw = await firstValueFrom(
        this.http.get<ApiClub[]>(`${environment.apiUrl}/clubs`),
      );
      this._clubs.set(raw.map(mapClub));
    } catch {
      this._error.set('Failed to load clubs');
    } finally {
      this._isLoading.set(false);
    }
  }

  async loadMyClubs(): Promise<void> {
    // Deduplicate: if a request is already in flight, return the same promise
    // so concurrent callers (e.g. clubs-list ngOnInit + chat-widget effect)
    // share one HTTP request instead of issuing duplicates.
    if (this._loadMyClubsInFlight) return this._loadMyClubsInFlight;

    this._loadMyClubsInFlight = (async () => {
      try {
        const raw = await firstValueFrom(
          this.http.get<ApiClub[]>(`${environment.apiUrl}/clubs/my`),
        );
        this._myClubs.set(raw.map(mapClub));
        this.myClubsLoadedAt = Date.now();
      } catch {
        this._error.set('Failed to load my clubs');
      } finally {
        this._loadMyClubsInFlight = null;
      }
    })();

    return this._loadMyClubsInFlight;
  }

  async ensureMyClubsLoaded(maxAgeMs = 30_000): Promise<void> {
    if (Date.now() - this.myClubsLoadedAt < maxAgeMs && this._myClubs().length > 0) return;
    await this.loadMyClubs();
  }

  async getClubById(id: string): Promise<Club | null> {
    const cached = this.cacheRead(this.clubByIdCache, id);
    if (cached) return cached;
    try {
      const raw = await firstValueFrom(
        this.http.get<ApiClub>(`${environment.apiUrl}/clubs/${id}`),
      );
      const club = mapClub(raw);
      this.clubByIdCache.set(id, { data: club, fetchedAt: Date.now() });
      return club;
    } catch {
      return null;
    }
  }

  async createClub(payload: {
    name: string;
    description: string;
    isPublic: boolean;
    coverUrl?: string | null;
    city?: string;
    tags?: string[];
    meetingDurationMinutes?: number | null;
    afterMeetingVenue?: { name: string; address: string; description: string } | null;
  }): Promise<Club> {
    const raw = await firstValueFrom(
      this.http.post<ApiClub>(`${environment.apiUrl}/clubs`, {
        name: payload.name,
        description: payload.description,
        isPublic: payload.isPublic,
        coverUrl: payload.coverUrl ?? null,
        city: payload.city,
        tags: payload.tags,
        meetingDurationMinutes: payload.meetingDurationMinutes,
        afterMeetingVenue: payload.afterMeetingVenue,
      }),
    );
    const club = mapClub(raw);
    this._clubs.update(existing => [club, ...existing]);
    this._myClubs.update(existing => [club, ...existing]);
    return club;
  }

  async updateClub(clubId: string, payload: {
    name: string;
    description: string;
    isPublic: boolean;
    city?: string;
    coverUrl?: string | null;
  }): Promise<Club> {
    const raw = await firstValueFrom(
      this.http.patch<ApiClub>(`${environment.apiUrl}/clubs/${clubId}`, payload),
    );
    this.clubByIdCache.delete(clubId);
    const club = mapClub(raw);
    this._clubs.update(list => list.map(c => (c.id === clubId ? club : c)));
    this._myClubs.update(list => list.map(c => (c.id === clubId ? club : c)));
    return club;
  }

  async joinClub(clubId: string): Promise<void> {
    await firstValueFrom(
      this.http.post<{ memberCount: number }>(`${environment.apiUrl}/clubs/${clubId}/join`, {}),
    );
    this.clubByIdCache.delete(clubId);
    this.membersCache.delete(clubId);
    this._clubs.update(list =>
      list.map(c => (c.id === clubId ? { ...c, memberCount: c.memberCount + 1 } : c)),
    );
    const club = this._clubs().find(c => c.id === clubId);
    if (club && !this.myClubIds().has(clubId)) {
      this._myClubs.update(list => [club, ...list]);
    }
  }

  async leaveClub(clubId: string): Promise<void> {
    await firstValueFrom(
      this.http.delete(`${environment.apiUrl}/clubs/${clubId}/leave`),
    );
    this.clubByIdCache.delete(clubId);
    this.membersCache.delete(clubId);
    this._clubs.update(list =>
      list.map(c =>
        c.id === clubId ? { ...c, memberCount: Math.max(0, c.memberCount - 1) } : c,
      ),
    );
    this._myClubs.update(list => list.filter(c => c.id !== clubId));
  }

  async getClubMembers(clubId: string): Promise<ClubMemberDetail[]> {
    const cached = this.cacheRead(this.membersCache, clubId);
    if (cached) return cached;
    const raw = await firstValueFrom(
      this.http.get<ApiClubMember[]>(`${environment.apiUrl}/clubs/${clubId}/members`),
    );
    const members = raw.map(mapClubMember);
    this.membersCache.set(clubId, { data: members, fetchedAt: Date.now() });
    return members;
  }

  async kickMember(clubId: string, userId: string): Promise<void> {
    await firstValueFrom(
      this.http.delete(`${environment.apiUrl}/clubs/${clubId}/members/${userId}`),
    );
    this.membersCache.delete(clubId);
  }

  async banMember(clubId: string, userId: string, duration: BanDuration): Promise<void> {
    await firstValueFrom(
      this.http.post(`${environment.apiUrl}/clubs/${clubId}/members/${userId}/ban`, { duration }),
    );
    this.membersCache.delete(clubId);
  }

  async getBans(clubId: string): Promise<BanRecord[]> {
    const raw = await firstValueFrom(
      this.http.get<ApiBanRecord[]>(`${environment.apiUrl}/clubs/${clubId}/bans`),
    );
    return raw.map(mapBanRecord);
  }

  async loadClubEvents(clubId: string, includePast = false): Promise<ClubEvent[]> {
    if (!includePast) {
      const cached = this.cacheRead(this.eventsCache, clubId);
      if (cached) return cached;
    }
    const raw = await firstValueFrom(
      this.http.get<ApiEvent[]>(`${environment.apiUrl}/clubs/${clubId}/events`, {
        params: { include_past: String(includePast) },
      }),
    );
    const events = raw.map(mapEvent);
    if (!includePast) {
      this.eventsCache.set(clubId, { data: events, fetchedAt: Date.now() });
    }
    return events;
  }

  async deleteClub(clubId: string): Promise<void> {
    await firstValueFrom(
      this.http.delete(`${environment.apiUrl}/clubs/${clubId}`),
    );
    this.clubByIdCache.delete(clubId);
    this.membersCache.delete(clubId);
    this.eventsCache.delete(clubId);
    this._clubs.update(list => list.filter(c => c.id !== clubId));
    this._myClubs.update(list => list.filter(c => c.id !== clubId));
  }

  async pauseClub(clubId: string): Promise<void> {
    await this.patchClubAndSync(clubId, 'pause');
  }

  async cancelClub(clubId: string): Promise<void> {
    await this.patchClubAndSync(clubId, 'cancel');
  }

  async rescheduleMeeting(clubId: string, newDate: string): Promise<void> {
    await this.patchClubAndSync(clubId, 'reschedule', { newDate });
  }

  private async patchClubAndSync(clubId: string, action: string, body: object = {}): Promise<void> {
    const raw = await firstValueFrom(
      this.http.patch<ApiClub>(`${environment.apiUrl}/clubs/${clubId}/${action}`, body),
    );
    const updated = mapClub(raw);
    this._clubs.update(list => list.map(c => (c.id === clubId ? updated : c)));
  }

  msUntilDeletion(club: Club): number | null {
    if (club.status !== 'cancelled' || !club.cancelledAt) return null;
    const deletionTime = new Date(club.cancelledAt).getTime() + 24 * 60 * 60 * 1000;
    const remaining = deletionTime - Date.now();
    return remaining > 0 ? remaining : null;
  }
}
