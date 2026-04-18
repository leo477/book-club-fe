import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiClub, ApiClubMember, ApiBanRecord, mapClub, mapClubMember, mapBanRecord } from '../api/api-mappers';
import { AuthService } from '../auth/auth.service';
import { AfterMeetingVenue, BanDuration, BanRecord, Club, ClubMemberDetail } from '../models/club.model';

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

  readonly clubs = this._clubs.asReadonly();
  readonly myClubs = this._myClubs.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly searchQuery = this._searchQuery.asReadonly();
  readonly cityFilter = this._cityFilter.asReadonly();

  readonly myOwnedClubs = computed<Club[]>(() => {
    const userId = this.auth.currentUser()?.id;
    if (!userId) return [];
    return this._clubs().filter(c => c.organizerId === userId);
  });

  readonly myOwnedClubIds = computed<Set<string>>(() =>
    new Set(this.myOwnedClubs().map(c => c.id)),
  );

  readonly myClubIds = computed(() => new Set(this._myClubs().map(c => c.id)));

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

  readonly availableCities = computed<string[]>(() => {
    const seen = new Set<string>();
    for (const c of this._clubs()) if (c.city) seen.add(c.city);
    return [...seen].sort((a, b) => a.localeCompare(b));
  });

  readonly upcomingByCity = computed<Record<string, Club[]>>(() => {
    const filter = this._cityFilter();
    const clubs = this._clubs()
      .filter(c => c.nextMeetingDate !== null)
      .filter(c => !filter || c.city === filter)
      .sort((a, b) => {
        const aDate = a.nextMeetingDate ?? '';
        const bDate = b.nextMeetingDate ?? '';
        return new Date(aDate).getTime() - new Date(bDate).getTime();
      });

    return clubs.reduce<Record<string, Club[]>>((acc, club) => {
      const city = club.city ?? 'Other';
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
    try {
      const raw = await firstValueFrom(
        this.http.get<ApiClub[]>(`${environment.apiUrl}/clubs/my`),
      );
      this._myClubs.set(raw.map(mapClub));
    } catch {
      this._error.set('Failed to load my clubs');
    }
  }

  async getClubById(id: string): Promise<Club | null> {
    try {
      const raw = await firstValueFrom(
        this.http.get<ApiClub>(`${environment.apiUrl}/clubs/${id}`),
      );
      return mapClub(raw);
    } catch {
      return null;
    }
  }

  async createClub(payload: {
    name: string;
    description: string;
    isPublic: boolean;
    city?: string;
    tags?: string[];
    meetingDurationMinutes?: number | null;
    afterMeetingVenue?: AfterMeetingVenue | null;
  }): Promise<Club> {
    const raw = await firstValueFrom(
      this.http.post<ApiClub>(`${environment.apiUrl}/clubs`, {
        name: payload.name,
        description: payload.description,
        is_public: payload.isPublic,
        city: payload.city,
        tags: payload.tags ?? [],
        meeting_duration_minutes: payload.meetingDurationMinutes ?? null,
        after_meeting_venue: payload.afterMeetingVenue ?? null,
      }),
    );
    const club = mapClub(raw);
    this._clubs.update(existing => [club, ...existing]);
    this._myClubs.update(existing => [club, ...existing]);
    return club;
  }

  async joinClub(clubId: string): Promise<void> {
    await firstValueFrom(
      this.http.post<{ member_count: number }>(`${environment.apiUrl}/clubs/${clubId}/join`, {}),
    );
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
    this._clubs.update(list =>
      list.map(c =>
        c.id === clubId ? { ...c, memberCount: Math.max(0, c.memberCount - 1) } : c,
      ),
    );
    this._myClubs.update(list => list.filter(c => c.id !== clubId));
  }

  async pauseClub(clubId: string): Promise<void> {
    const raw = await firstValueFrom(
      this.http.patch<ApiClub>(`${environment.apiUrl}/clubs/${clubId}/pause`, {}),
    );
    this._updateClub(mapClub(raw));
  }

  async cancelClub(clubId: string): Promise<void> {
    const raw = await firstValueFrom(
      this.http.patch<ApiClub>(`${environment.apiUrl}/clubs/${clubId}/cancel`, {}),
    );
    this._updateClub(mapClub(raw));
  }

  async rescheduleMeeting(clubId: string, newDate: string): Promise<void> {
    const raw = await firstValueFrom(
      this.http.patch<ApiClub>(`${environment.apiUrl}/clubs/${clubId}/reschedule`, {
        new_date: newDate,
      }),
    );
    this._updateClub(mapClub(raw));
  }

  async getClubMembers(clubId: string): Promise<ClubMemberDetail[]> {
    const raw = await firstValueFrom(
      this.http.get<ApiClubMember[]>(`${environment.apiUrl}/clubs/${clubId}/members`),
    );
    return raw.map(mapClubMember);
  }

  async kickMember(clubId: string, userId: string): Promise<void> {
    await firstValueFrom(
      this.http.delete(`${environment.apiUrl}/clubs/${clubId}/members/${userId}`),
    );
  }

  async banMember(clubId: string, userId: string, duration: BanDuration): Promise<void> {
    await firstValueFrom(
      this.http.post(`${environment.apiUrl}/clubs/${clubId}/members/${userId}/ban`, { duration }),
    );
  }

  async getBans(clubId: string): Promise<BanRecord[]> {
    const raw = await firstValueFrom(
      this.http.get<ApiBanRecord[]>(`${environment.apiUrl}/clubs/${clubId}/bans`),
    );
    return raw.map(mapBanRecord);
  }

  msUntilDeletion(club: Club): number | null {
    if (club.status !== 'cancelled' || !club.cancelledAt) return null;
    const elapsed = Date.now() - new Date(club.cancelledAt).getTime();
    const remaining = 24 * 60 * 60 * 1000 - elapsed;
    return remaining > 0 ? remaining : null;
  }

  private _updateClub(updated: Club): void {
    this._clubs.update(list => list.map(c => (c.id === updated.id ? updated : c)));
    this._myClubs.update(list => list.map(c => (c.id === updated.id ? updated : c)));
  }
}
