import { Injectable, inject, signal } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { BookCandidate, RandomizerSession } from '../models/randomizer.model';
import { MOCK_RANDOMIZER_HISTORY } from '../mocks/mock-data';

let nextSessionId = MOCK_RANDOMIZER_HISTORY.length + 1;

/** In-memory history store per club */
const inMemoryHistory: RandomizerSession[] = [...MOCK_RANDOMIZER_HISTORY];

@Injectable({ providedIn: 'root' })
export class RandomizerService {
  private readonly auth = inject(AuthService);

  private readonly _candidates = signal<BookCandidate[]>([]);
  private readonly _result = signal<BookCandidate | null>(null);
  private readonly _isSpinning = signal(false);
  private readonly _history = signal<RandomizerSession[]>([]);

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

    const session: RandomizerSession = {
      id: `session-${++nextSessionId}`,
      clubId,
      createdBy: user.id,
      candidates: this._candidates(),
      result: this._result(),
      createdAt: new Date().toISOString(),
    };

    inMemoryHistory.unshift(session);
    this._history.update(prev => [session, ...prev]);
  }

  async loadHistory(clubId: string): Promise<void> {
    await Promise.resolve();
    this._history.set(inMemoryHistory.filter(s => s.clubId === clubId));
  }

  reset(): void {
    this._candidates.set([]);
    this._result.set(null);
  }
}
