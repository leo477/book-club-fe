import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, firstValueFrom, map } from 'rxjs';
import { BookVoteRound } from '../models/book-vote.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BookVoteService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  getRound$(clubId: string): Observable<BookVoteRound | null> {
    return this.http
      .get<BookVoteRound | null>(`${this.api}/clubs/${clubId}/book-vote/round`)
      .pipe(map(round => round ?? null));
  }

  async createRound(clubId: string): Promise<void> {
    await firstValueFrom(this.http.post(`${this.api}/clubs/${clubId}/book-vote/rounds`, {}));
  }

  async addOption(clubId: string, roundId: string, title: string, author: string): Promise<void> {
    await firstValueFrom(
      this.http.post(`${this.api}/clubs/${clubId}/book-vote/rounds/${roundId}/options`, { title, author }),
    );
  }

  async removeOption(clubId: string, optionId: string): Promise<void> {
    await firstValueFrom(this.http.delete(`${this.api}/clubs/${clubId}/book-vote/options/${optionId}`));
  }

  async vote(clubId: string, optionId: string): Promise<void> {
    await firstValueFrom(this.http.post(`${this.api}/clubs/${clubId}/book-vote/options/${optionId}/vote`, {}));
  }

  async unvote(clubId: string, optionId: string): Promise<void> {
    await firstValueFrom(this.http.delete(`${this.api}/clubs/${clubId}/book-vote/options/${optionId}/vote`));
  }

  async closeRound(clubId: string, roundId: string): Promise<void> {
    await firstValueFrom(this.http.post(`${this.api}/clubs/${clubId}/book-vote/rounds/${roundId}/close`, {}));
  }
}
