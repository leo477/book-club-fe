import { Injectable, inject, signal } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { MemberCandidate, RandomizerSession } from '../models/randomizer.model';
import { MOCK_RANDOMIZER_HISTORY, MOCK_CLUB_MEMBERS } from '../mocks/mock-data';

let nextSessionId = MOCK_RANDOMIZER_HISTORY.length + 1;

/** In-memory history store per club */
const inMemoryHistory: RandomizerSession[] = [...MOCK_RANDOMIZER_HISTORY];

@Injectable({ providedIn: 'root' })
export class RandomizerService {
  private readonly auth = inject(AuthService);

  private readonly _candidates = signal<MemberCandidate[]>([]);
  private readonly _selectedIds = signal<Set<string>>(new Set());
  private readonly _result = signal<MemberCandidate | null>(null);
  private readonly _isSpinning = signal(false);
  private readonly _history = signal<RandomizerSession[]>([]);
  private readonly _purpose = signal('Хто представляє книгу?');

  readonly candidates = this._candidates.asReadonly();
  readonly selectedIds = this._selectedIds.asReadonly();
  readonly result = this._result.asReadonly();
  readonly isSpinning = this._isSpinning.asReadonly();
  readonly history = this._history.asReadonly();
  readonly purpose = this._purpose.asReadonly();

  setPurpose(purpose: string): void {
    this._purpose.set(purpose);
  }

  loadClubMembers(clubId: string): void {
    const members = MOCK_CLUB_MEMBERS[clubId] ?? [];
    this._candidates.set(members);
    // Select all by default
    this._selectedIds.set(new Set(members.map(m => m.userId)));
    this._result.set(null);
  }

  toggleMember(userId: string): void {
    this._selectedIds.update(prev => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  }

  async spin(): Promise<void> {
    const selected = this._candidates().filter(m => this._selectedIds().has(m.userId));
    if (selected.length < 2) throw new Error('Потрібно мінімум 2 учасники');

    this._isSpinning.set(true);
    this._result.set(null);
    await new Promise<void>(resolve => setTimeout(resolve, 2000));

    const idx = crypto.getRandomValues(new Uint32Array(1))[0] % selected.length;
    this._result.set(selected[idx]);
    this._isSpinning.set(false);
  }

  async saveSession(clubId: string): Promise<void> {
    const user = this.auth.currentUser();
    if (!user) throw new Error('Not authenticated');

    const session: RandomizerSession = {
      id: `session-${++nextSessionId}`,
      clubId,
      createdBy: user.id,
      purpose: this._purpose(),
      candidates: this._candidates().filter(m => this._selectedIds().has(m.userId)),
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
    const ids = new Set(this._candidates().map(m => m.userId));
    this._selectedIds.set(ids);
    this._result.set(null);
  }
}
