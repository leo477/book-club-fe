import { Injectable, inject, signal } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { SupabaseService } from '../supabase/supabase.service';
import { BookCandidate, RandomizerSession } from '../models/randomizer.model';

@Injectable({ providedIn: 'root' })
export class RandomizerService {
  private readonly supabase = inject(SupabaseService);
  private readonly auth = inject(AuthService);

  readonly candidates = signal<BookCandidate[]>([]);
  readonly result = signal<BookCandidate | null>(null);
  readonly isSpinning = signal(false);
  readonly history = signal<RandomizerSession[]>([]);

  addCandidate(book: BookCandidate): void {
    this.candidates.update(prev => [...prev, book]);
  }

  removeCandidate(index: number): void {
    this.candidates.update(prev => prev.filter((_, i) => i !== index));
  }

  async spin(): Promise<void> {
    const candidates = this.candidates();
    if (candidates.length < 2) return;

    this.isSpinning.set(true);
    await new Promise<void>(resolve => setTimeout(resolve, 2000));

    const idx = Math.floor(Math.random() * candidates.length);
    this.result.set(candidates[idx]);
    this.isSpinning.set(false);
  }

  async saveSession(clubId: string): Promise<void> {
    const user = this.auth.currentUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await this.supabase.client
      .from('randomizer_sessions')
      .insert({
        club_id: clubId,
        created_by: user.id,
        candidates: this.candidates(),
        result: this.result(),
      });

    if (error) throw new Error(error.message);
  }

  async loadHistory(clubId: string): Promise<void> {
    const { data, error } = await this.supabase.client
      .from('randomizer_sessions')
      .select('*')
      .eq('club_id', clubId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    this.history.set(
      (data ?? []).map(row => ({
        id: row.id,
        clubId: row.club_id,
        createdBy: row.created_by,
        candidates: row.candidates,
        result: row.result,
        createdAt: row.created_at,
      })),
    );
  }

  reset(): void {
    this.candidates.set([]);
    this.result.set(null);
  }
}
