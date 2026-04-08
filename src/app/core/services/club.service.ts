import { Injectable, inject, signal, computed } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Club } from '../models/club.model';
import { MOCK_CLUBS, MOCK_MY_CLUB_IDS } from '../mocks/mock-data';

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

  async loadPublicClubs(): Promise<void> {
    this._isLoading.set(true);
    await Promise.resolve(); // simulate async
    this._clubs.set(MOCK_CLUBS.filter(c => c.isPublic));
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
}
