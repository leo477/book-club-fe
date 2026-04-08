import { Injectable, inject, signal, computed } from '@angular/core';
import { SupabaseService } from '../supabase/supabase.service';
import { AuthService } from '../auth/auth.service';
import { Club } from '../models/club.model';

/** Shape returned by Supabase when selecting with embedded member count */
interface ClubRowWithCount {
  id: string;
  name: string;
  description: string | null;
  cover_image_url: string | null;
  organizer_id: string;
  is_public: boolean;
  created_at: string;
  club_members: Array<{ count: number | string }>;
}

/** Shape returned by Supabase for a plain club row (no embedded count) */
interface ClubRowPlain {
  id: string;
  name: string;
  description: string | null;
  cover_image_url: string | null;
  organizer_id: string;
  is_public: boolean;
  created_at: string;
  current_book_title: string | null;
}

@Injectable({ providedIn: 'root' })
export class ClubService {
  private readonly supabase = inject(SupabaseService).client;
  private readonly auth = inject(AuthService);

  // ── State ────────────────────────────────────────────────────────────────
  readonly clubs = signal<Club[]>([]);
  readonly myClubs = signal<Club[]>([]);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  // ── Search ───────────────────────────────────────────────────────────────
  readonly searchQuery = signal('');

  readonly filteredClubs = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.clubs();
    return this.clubs().filter(
      c =>
        c.name.toLowerCase().includes(q) ||
        (c.description?.toLowerCase().includes(q) ?? false),
    );
  });

  /** Set of club IDs the current user belongs to — O(1) membership checks */
  readonly myClubIds = computed(() => new Set(this.myClubs().map(c => c.id)));

  // ── Private helpers ──────────────────────────────────────────────────────
  private mapClubWithCount(row: ClubRowWithCount): Club {
    const raw = row.club_members[0]?.count;
    const memberCount = typeof raw === 'string' ? parseInt(raw, 10) : (raw ?? 0);
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      coverUrl: row.cover_image_url,
      organizerId: row.organizer_id,
      isPublic: row.is_public,
      memberCount,
      createdAt: row.created_at,
    };
  }

  private mapClubPlain(row: ClubRowPlain, memberCount = 0): Club {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      coverUrl: row.cover_image_url,
      organizerId: row.organizer_id,
      isPublic: row.is_public,
      memberCount,
      createdAt: row.created_at,
    };
  }

  // ── Public API ───────────────────────────────────────────────────────────

  async loadPublicClubs(): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);
    try {
      const { data, error } = await this.supabase
        .from('clubs')
        .select('*, club_members(count)')
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      this.clubs.set(
        (data as unknown as ClubRowWithCount[]).map(row => this.mapClubWithCount(row)),
      );
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to load clubs');
    } finally {
      this.isLoading.set(false);
    }
  }

  async loadMyClubs(): Promise<void> {
    const currentUser = this.auth.currentUser();
    if (!currentUser) return;

    try {
      // Step 1: get club IDs where the user is a member
      const { data: memberRows, error: memberError } = await this.supabase
        .from('club_members')
        .select('club_id')
        .eq('user_id', currentUser.id);

      if (memberError) throw memberError;
      if (!memberRows || memberRows.length === 0) {
        this.myClubs.set([]);
        return;
      }

      const ids = memberRows.map(r => r.club_id);

      // Step 2: fetch those clubs with embedded member count
      const { data, error } = await this.supabase
        .from('clubs')
        .select('*, club_members(count)')
        .in('id', ids)
        .order('created_at', { ascending: false });

      if (error) throw error;

      this.myClubs.set(
        (data as unknown as ClubRowWithCount[]).map(row => this.mapClubWithCount(row)),
      );
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to load your clubs');
    }
  }

  async createClub(payload: {
    name: string;
    description: string;
    isPublic: boolean;
  }): Promise<Club> {
    const currentUser = this.auth.currentUser();
    if (!currentUser) throw new Error('Must be authenticated to create a club');

    this.isLoading.set(true);
    this.error.set(null);
    try {
      // Insert club
      const { data: clubData, error: clubError } = await this.supabase
        .from('clubs')
        .insert({
          name: payload.name,
          description: payload.description || null,
          is_public: payload.isPublic,
          organizer_id: currentUser.id,
          cover_image_url: null,
          current_book_title: null,
        })
        .select()
        .single();

      if (clubError) throw clubError;

      const newClub = this.mapClubPlain(clubData as unknown as ClubRowPlain, 1);

      // Join the club as organizer (role is derived from clubs.organizer_id, no role column in DB)
      const { error: memberError } = await this.supabase
        .from('club_members')
        .insert({ club_id: newClub.id, user_id: currentUser.id });

      if (memberError) throw memberError;

      // Update local state
      this.clubs.update(existing => [newClub, ...existing]);
      this.myClubs.update(existing => [newClub, ...existing]);

      return newClub;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create club';
      this.error.set(message);
      throw new Error(message);
    } finally {
      this.isLoading.set(false);
    }
  }

  async joinClub(clubId: string): Promise<void> {
    const currentUser = this.auth.currentUser();
    if (!currentUser) throw new Error('Must be authenticated to join a club');

    const { error } = await this.supabase
      .from('club_members')
      .insert({ club_id: clubId, user_id: currentUser.id });

    if (error) throw error;

    // Update member count optimistically in clubs signal
    this.clubs.update(list =>
      list.map(c => (c.id === clubId ? { ...c, memberCount: c.memberCount + 1 } : c)),
    );

    // Add to myClubs if not already there
    const club = this.clubs().find(c => c.id === clubId);
    if (club && !this.myClubIds().has(clubId)) {
      this.myClubs.update(list => [club, ...list]);
    }
  }

  async leaveClub(clubId: string): Promise<void> {
    const currentUser = this.auth.currentUser();
    if (!currentUser) throw new Error('Must be authenticated to leave a club');

    const { error } = await this.supabase
      .from('club_members')
      .delete()
      .eq('club_id', clubId)
      .eq('user_id', currentUser.id);

    if (error) throw error;

    // Update member count optimistically
    this.clubs.update(list =>
      list.map(c =>
        c.id === clubId ? { ...c, memberCount: Math.max(0, c.memberCount - 1) } : c,
      ),
    );

    // Remove from myClubs
    this.myClubs.update(list => list.filter(c => c.id !== clubId));
  }

  async getClubById(id: string): Promise<Club | null> {
    const { data, error } = await this.supabase
      .from('clubs')
      .select('*, club_members(count)')
      .eq('id', id)
      .single();

    if (error) return null;

    return this.mapClubWithCount(data as unknown as ClubRowWithCount);
  }
}
