import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { MemberCandidate, RandomizerSession } from '../models/randomizer.model';
import { ApiClubMember, mapClubMember } from '../api/api-mappers';
import { environment } from '../../../environments/environment';

// Raw API shapes (snake_case from FastAPI)
interface ApiMemberCandidate {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
}

interface ApiRandomizerSession {
  id: string;
  club_id: string;
  created_by: string;
  purpose: string;
  candidates: ApiMemberCandidate[];
  result: ApiMemberCandidate | null;
  created_at: string;
}

function mapMemberCandidate(raw: ApiMemberCandidate): MemberCandidate {
  return {
    userId: raw.user_id,
    displayName: raw.display_name,
    avatarUrl: raw.avatar_url,
  };
}

function mapRandomizerSession(raw: ApiRandomizerSession): RandomizerSession {
  return {
    id: raw.id,
    clubId: raw.club_id,
    createdBy: raw.created_by,
    purpose: raw.purpose,
    candidates: raw.candidates.map(mapMemberCandidate),
    result: raw.result ? mapMemberCandidate(raw.result) : null,
    createdAt: raw.created_at,
  };
}

@Injectable({ providedIn: 'root' })
export class RandomizerService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly apiUrl = environment.apiUrl;

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

  async loadClubMembers(clubId: string): Promise<void> {
    const raw = await firstValueFrom(
      this.http.get<ApiClubMember[]>(`${this.apiUrl}/clubs/${clubId}/members`),
    );
    const members: MemberCandidate[] = raw.map(m => {
      const detail = mapClubMember(m);
      return { userId: detail.userId, displayName: detail.displayName, avatarUrl: detail.avatarUrl };
    });
    this._candidates.set(members);
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

    const max = Math.floor(0x100000000 / selected.length) * selected.length;
    let rand: number;
    do {
      rand = crypto.getRandomValues(new Uint32Array(1))[0];
    } while (rand >= max);
    const idx = rand % selected.length;
    this._result.set(selected[idx]);
    this._isSpinning.set(false);
  }

  async saveSession(clubId: string): Promise<void> {
    const user = this.auth.currentUser();
    if (!user) throw new Error('Not authenticated');

    const result = this._result();
    if (!result) throw new Error('No result to save');

    const body = {
      purpose: this._purpose(),
      candidates: this._candidates()
        .filter(m => this._selectedIds().has(m.userId))
        .map(m => m.userId),
      result: result.userId,
    };

    const raw = await firstValueFrom(
      this.http.post<ApiRandomizerSession>(
        `${this.apiUrl}/clubs/${clubId}/randomizer/sessions`,
        body,
      ),
    );

    const session = mapRandomizerSession(raw);
    this._history.update(prev => [session, ...prev]);
  }

  async loadHistory(clubId: string): Promise<void> {
    const raw = await firstValueFrom(
      this.http.get<ApiRandomizerSession[]>(`${this.apiUrl}/clubs/${clubId}/randomizer/history`),
    );
    this._history.set(raw.map(mapRandomizerSession));
  }

  reset(): void {
    const ids = new Set(this._candidates().map(m => m.userId));
    this._selectedIds.set(ids);
    this._result.set(null);
  }
}
