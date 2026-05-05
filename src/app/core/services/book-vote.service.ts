import { Injectable, signal } from '@angular/core';
import { BookOption, BookVoteRound } from '../models/book-vote.model';

@Injectable({ providedIn: 'root' })
export class BookVoteService {
  private readonly _rounds = signal<Record<string, BookVoteRound>>({});

  getRound(clubId: string): BookVoteRound | null {
    return this._rounds()[clubId] ?? null;
  }

  createRound(clubId: string): void {
    const round: BookVoteRound = {
      id: crypto.randomUUID(),
      clubId,
      status: 'open',
      options: [],
      totalVotes: 0,
      winnerId: null,
    };
    this._rounds.update(r => ({ ...r, [clubId]: round }));
  }

  addOption(clubId: string, title: string, author: string): void {
    this._patchRound(clubId, round => ({
      ...round,
      options: [
        ...round.options,
        { id: crypto.randomUUID(), title: title.trim(), author: author.trim(), votes: 0, hasVoted: false },
      ],
    }));
  }

  removeOption(clubId: string, optionId: string): void {
    this._patchRound(clubId, round => {
      const removed = round.options.find(o => o.id === optionId);
      const options = round.options.filter(o => o.id !== optionId);
      const totalVotes = round.totalVotes - (removed?.votes ?? 0);
      return { ...round, options, totalVotes };
    });
  }

  vote(clubId: string, optionId: string): void {
    this._patchRound(clubId, round => {
      const options = round.options.map((o): BookOption => {
        if (o.hasVoted && o.id !== optionId) return { ...o, votes: Math.max(0, o.votes - 1), hasVoted: false };
        if (o.id === optionId && !o.hasVoted) return { ...o, votes: o.votes + 1, hasVoted: true };
        return o;
      });
      return { ...round, options, totalVotes: options.reduce((s, o) => s + o.votes, 0) };
    });
  }

  unvote(clubId: string, optionId: string): void {
    this._patchRound(clubId, round => {
      const options = round.options.map((o): BookOption =>
        o.id === optionId ? { ...o, votes: Math.max(0, o.votes - 1), hasVoted: false } : o,
      );
      return { ...round, options, totalVotes: options.reduce((s, o) => s + o.votes, 0) };
    });
  }

  closeRound(clubId: string): void {
    this._patchRound(clubId, round => {
      const winner = [...round.options].sort((a, b) => b.votes - a.votes)[0] ?? null;
      return { ...round, status: 'closed', winnerId: winner?.id ?? null };
    });
  }

  clearRound(clubId: string): void {
    this._rounds.update(r => {
      const next = { ...r };
      delete next[clubId];
      return next;
    });
  }

  private _patchRound(clubId: string, fn: (r: BookVoteRound) => BookVoteRound): void {
    const current = this._rounds()[clubId];
    if (!current) return;
    this._rounds.update(r => ({ ...r, [clubId]: fn(current) }));
  }
}
