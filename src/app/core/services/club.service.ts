import { Injectable, inject, signal, computed } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Club, ClubMemberDetail, ClubStatus } from '../models/club.model';
import { MOCK_CLUBS, MOCK_CLUB_MEMBERS, MOCK_MY_CLUB_IDS, MOCK_PARTICIPATION, MOCK_USERS } from '../mocks/mock-data';

let nextClubId = MOCK_CLUBS.length + 1;

@Injectable({ providedIn: 'root' })
export class ClubService {
  private readonly auth = inject(AuthService);

  private readonly _clubs = signal<Club[]>([...MOCK_CLUBS]);
  private readonly _myClubs = signal<Club[]>(
    MOCK_CLUBS.filter(c => MOCK_MY_CLUB_IDS.has(c.id)),
  );
  private readonly _isLoading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly clubs = this._clubs.asReadonly();
  readonly myClubs = this._myClubs.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly myOwnedClubs = computed<Club[]>(() => {
    const userId = this.auth.currentUser()?.id;
    if (!userId) return [];
    return this._clubs().filter(c => c.organizerId === userId);
  });

  readonly myOwnedClubIds = computed<Set<string>>(() =>
    new Set(this.myOwnedClubs().map(c => c.id)),
  );

  constructor() {
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
    setInterval(() => {
      const now = Date.now();
      this._clubs.update(clubs =>
        clubs.filter(c => {
          if (c.status !== 'cancelled' || !c.cancelledAt) return true;
          return now - new Date(c.cancelledAt).getTime() < TWENTY_FOUR_HOURS;
        }),
      );
    }, 60_000);
  }

  msUntilDeletion(club: Club): number | null {
    if (club.status !== 'cancelled' || !club.cancelledAt) return null;
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
    const elapsed = Date.now() - new Date(club.cancelledAt).getTime();
    const remaining = TWENTY_FOUR_HOURS - elapsed;
    return remaining > 0 ? remaining : null;
  }

  private readonly _searchQuery = signal('');
  readonly searchQuery = this._searchQuery.asReadonly();

  setSearchQuery(query: string): void {
    this._searchQuery.set(query);
  }

  readonly filteredClubs = computed(() => {
    const q = this._searchQuery().toLowerCase().trim();
    if (!q) return this._clubs();
    return this._clubs().filter(
      c =>
        c.name.toLowerCase().includes(q) ||
        (c.description?.toLowerCase().includes(q) ?? false),
    );
  });

  readonly myClubIds = computed(() => new Set(this._myClubs().map(c => c.id)));

  private readonly _cityFilter = signal<string | null>(null);
  readonly cityFilter = this._cityFilter.asReadonly();

  setCityFilter(city: string | null): void {
    this._cityFilter.set(city);
  }

  readonly availableCities = computed<string[]>(() => {
    const cities = this._clubs().map(c => c.city).filter((c): c is string => !!c);
    return [...new Set(cities)].sort((a, b) => a.localeCompare(b));
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

  readonly myParticipatedClubs = computed<Club[]>(() => {
    const userId = this.auth.currentUser()?.id;
    if (!userId) return [];
    const participated = MOCK_PARTICIPATION[userId] ?? new Set<string>();
    return this._myClubs().filter(c => participated.has(c.id));
  });

  readonly myMissedClubs = computed<Club[]>(() => {
    const userId = this.auth.currentUser()?.id;
    if (!userId) return [];
    const participated = MOCK_PARTICIPATION[userId] ?? new Set<string>();
    return this._myClubs().filter(c => !participated.has(c.id));
  });

  async loadPublicClubs(): Promise<void> {
    this._isLoading.set(true);
    await Promise.resolve();
    this._clubs.set([...MOCK_CLUBS]); // show all including private for city grouping
    this._isLoading.set(false);
  }

  async loadMyClubs(): Promise<void> {
    const currentUser = this.auth.currentUser();
    if (!currentUser) return;
    await Promise.resolve();
    this._myClubs.set(
      this._clubs().filter(
        c => c.organizerId === currentUser.id || MOCK_MY_CLUB_IDS.has(c.id),
      ),
    );
  }

  async createClub(payload: {
    name: string;
    description: string;
    isPublic: boolean;
    city?: string;
  }): Promise<Club> {
    const currentUser = this.auth.currentUser();
    if (!currentUser) throw new Error('Must be authenticated to create a club');

    this._isLoading.set(true);
    await Promise.resolve();

    const newClub: Club = {
      id: `club-${++nextClubId}`,
      name: payload.name,
      description: payload.description || null,
      coverUrl: null,
      organizerId: currentUser.id,
      isPublic: payload.isPublic,
      memberCount: 1,
      createdAt: new Date().toISOString(),
      city: payload.city ?? 'Kyiv',
      nextMeetingDate: null,
      address: null,
      lat: null,
      lng: null,
      theme: null,
      currentBook: null,
      memberPreviews: [currentUser.displayName],
      status: 'active' as ClubStatus,
    };

    this._clubs.update(existing => [newClub, ...existing]);
    this._myClubs.update(existing => [newClub, ...existing]);
    this._isLoading.set(false);
    return newClub;
  }

  async joinClub(clubId: string): Promise<void> {
    const currentUser = this.auth.currentUser();
    if (!currentUser) throw new Error('Must be authenticated to join a club');

    this._clubs.update(list =>
      list.map(c => (c.id === clubId ? { ...c, memberCount: c.memberCount + 1 } : c)),
    );

    const club = this._clubs().find(c => c.id === clubId);
    if (club && !this.myClubIds().has(clubId)) {
      this._myClubs.update(list => [club, ...list]);
    }
  }

  async leaveClub(clubId: string): Promise<void> {
    const currentUser = this.auth.currentUser();
    if (!currentUser) throw new Error('Must be authenticated to leave a club');

    this._clubs.update(list =>
      list.map(c =>
        c.id === clubId ? { ...c, memberCount: Math.max(0, c.memberCount - 1) } : c,
      ),
    );
    this._myClubs.update(list => list.filter(c => c.id !== clubId));
  }

  async getClubById(id: string): Promise<Club | null> {
    await Promise.resolve();
    return this._clubs().find(c => c.id === id) ?? null;
  }

  getClubMembers(clubId: string): ClubMemberDetail[] {
    const candidates = MOCK_CLUB_MEMBERS[clubId] ?? [];
    const club = this._clubs().find(c => c.id === clubId);
    return candidates.map(candidate => {
      const user = MOCK_USERS.find(u => u.id === candidate.userId);
      return {
        userId: candidate.userId,
        displayName: candidate.displayName,
        avatarUrl: candidate.avatarUrl,
        role: club?.organizerId === candidate.userId ? 'organizer' : 'member',
        socials: user?.socials,
        socialsPublic: user?.socialsPublic ?? false,
      };
    });
  }

  pauseClub(clubId: string): void {
    this._clubs.update(clubs =>
      clubs.map(c =>
        c.id === clubId ? { ...c, status: 'paused' as ClubStatus } : c,
      ),
    );
  }

  cancelClub(clubId: string): void {
    this._clubs.update(clubs =>
      clubs.map(c =>
        c.id === clubId
          ? { ...c, status: 'cancelled' as ClubStatus, nextMeetingDate: null, cancelledAt: new Date().toISOString() }
          : c,
      ),
    );
  }

  rescheduleMeeting(clubId: string, newDate: string): void {
    this._clubs.update(clubs =>
      clubs.map(c =>
        c.id === clubId
          ? {
              ...c,
              nextMeetingDate: newDate,
              status: c.status === 'paused' ? ('active' as ClubStatus) : c.status,
            }
          : c,
      ),
    );
  }
}
