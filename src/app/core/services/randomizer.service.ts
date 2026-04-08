import { Injectable, inject, signal } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { SupabaseService } from '../supabase/supabase.service';
import { BookCandidate, RandomizerSession } from '../models/randomizer.model';

@Injectable({ providedIn: 'root' })
export class RandomizerService {
  private readonly supabase = inject(SupabaseService);
  private readonly auth = inject(AuthService);

  private readonly _candidates = signal<BookCandidate[]>([]);
  private readonly _result = signal<BookCandidate | null>(null);
  private readonly _isSpinning = signal(false);
  private readonly _history = signal<RandomizerSession[]>([]);

  // Public readonly projections — components cannot mutate service state
  readonly candidates = this._candidates.asReadonly();
  readonly result = this._result.asReadonly();
  readonly isSpinning = this._isSpinning.asReadonly();
  readonly history = this._history.asReadonly();

  addCandidate(book: BookCandidate): void {
    this._candidates.update(prev => [...prev, book]);
  }

  removeCandidate(index: number): void {
    this._candidates.update(prev => prev.filter((_, i) => i !== index));
  }

  async spin(): Promise<void> {
    const candidates = this._candidates();
    if (candidates.length < 2) return;

    this._isSpinning.set(true);
    await new Promise<void>(resolve => setTimeout(resolve, 2000));

    const idx = Math.floor(Math.random() * candidates.length);
    this._result.set(candidates[idx]);
    this._isSpinning.set(false);
  }

  async saveSession(clubId: string): Promise<void> {
    const user = this.auth.currentUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await this.supabase.client
      .from('randomizer_sessions')
      .insert({
        club_id: clubId,
        created_by: user.id,
        candidates: this._candidates(),
        result: this._result(),
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

    this._history.set(
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
    this._candidates.set([]);
    this._result.set(null);
  }
}
