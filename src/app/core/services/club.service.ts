import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';
import { ApiClub, ApiClubMember, ApiBanRecord, ApiEvent, mapClub, mapClubMember, mapBanRecord, mapEvent } from '../api/api-mappers';
import { AuthService } from '../auth/auth.service';
import { SUPPRESS_ERROR_TOAST } from '../interceptors/auth.interceptor';
import { BanDuration, BanRecord, Club, ClubMemberDetail, ClubStats } from '../models/club.model';
import { AfterMeetingVenue, ClubEvent } from '../models/event.model';

export interface JoinRequest {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  status: string;
  source: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class ClubService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly translate = inject(TranslateService);

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
    const byKey = new Map<string, string>();
    for (const club of this._clubs()) {
      const original = club.city?.trim();
      if (!original) continue;
      const key = original.toLowerCase();
      if (!byKey.has(key)) byKey.set(key, original);
    }
    return [...byKey.values()].sort((a, b) => a.localeCompare(b));
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
      this._error.set(this.translate.instant('CLUBS.load_error'));
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
        this._error.set(this.translate.instant('CLUBS.load_my_error'));
      } finally {
        this._loadMyClubsInFlight = null;
      }
    })();

    return this._loadMyClubsInFlight;
  }

  async ensureMyClubsLoaded(maxAgeMs = 30_000): Promise<void> {
    if (this.myClubsLoadedAt > 0 && Date.now() - this.myClubsLoadedAt < maxAgeMs) return;
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
    tags?: string[];
    meetingDurationMinutes?: number | null;
    afterMeetingVenue?: AfterMeetingVenue | null;
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

  async joinClub(clubId: string): Promise<'pending' | 'already_requested' | 'member'> {
    const { status } = await firstValueFrom(
      this.http.post<{ status: 'pending' | 'already_requested' | 'member' }>(
        `${environment.apiUrl}/clubs/${clubId}/join`,
        {},
      ),
    );
    this.clubByIdCache.delete(clubId);
    return status;
  }

  async getMyMembership(
    clubId: string,
  ): Promise<{ isMember: boolean; role: string | null; joinRequestStatus: 'none' | 'pending' | 'rejected' }> {
    return firstValueFrom(
      this.http.get<{
        isMember: boolean;
        role: string | null;
        joinRequestStatus: 'none' | 'pending' | 'rejected';
      }>(`${environment.apiUrl}/clubs/${clubId}/my-membership`),
    );
  }

  async getJoinRequests(clubId: string): Promise<JoinRequest[]> {
    return firstValueFrom(
      this.http.get<JoinRequest[]>(`${environment.apiUrl}/clubs/${clubId}/join-requests`),
    );
  }

  async approveJoinRequest(clubId: string, userId: string): Promise<void> {
    await firstValueFrom(
      this.http.post<{ memberCount: number }>(
        `${environment.apiUrl}/clubs/${clubId}/join-requests/${userId}/approve`,
        {},
      ),
    );
    this.membersCache.delete(clubId);
    this.clubByIdCache.delete(clubId);
    this._clubs.update(list =>
      list.map(c => (c.id === clubId ? { ...c, memberCount: c.memberCount + 1 } : c)),
    );
  }

  async rejectJoinRequest(clubId: string, userId: string): Promise<void> {
    await firstValueFrom(
      this.http.post(`${environment.apiUrl}/clubs/${clubId}/join-requests/${userId}/reject`, {}),
    );
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
      this.http.get<ApiBanRecord[]>(`${environment.apiUrl}/clubs/${clubId}/bans`, {
        context: new HttpContext().set(SUPPRESS_ERROR_TOAST, true),
      }),
    );
    return raw.map(mapBanRecord);
  }

  async unbanMember(clubId: string, userId: string): Promise<void> {
    await firstValueFrom(
      this.http.delete(`${environment.apiUrl}/clubs/${clubId}/bans/${userId}`),
    );
    this.clubByIdCache.delete(clubId);
  }

  async updateMemberRole(
    clubId: string,
    userId: string,
    role: 'organizer' | 'member',
  ): Promise<void> {
    await firstValueFrom(
      this.http.patch(`${environment.apiUrl}/clubs/${clubId}/members/${userId}/role`, { role }),
    );
    this.membersCache.delete(clubId);
    this.clubByIdCache.delete(clubId);
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

  async getClubStats(clubId: string): Promise<ClubStats> {
    return firstValueFrom(this.http.get<ClubStats>(`${environment.apiUrl}/clubs/${clubId}/stats`));
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
    this.clubByIdCache.delete(clubId);
    const updated = mapClub(raw);
    this._clubs.update(list => list.map(c => (c.id === clubId ? updated : c)));
    this._myClubs.update(list => list.map(c => (c.id === clubId ? updated : c)));
  }

}
