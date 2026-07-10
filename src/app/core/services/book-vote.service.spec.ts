import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { BookVoteService } from './book-vote.service';
import { BookVoteRound } from '../models/book-vote.model';
import { environment } from '../../../environments/environment';

const API = environment.apiUrl;

function makeRound(overrides: Partial<BookVoteRound> = {}): BookVoteRound {
  return {
    id: 'round-1',
    clubId: 'club-1',
    status: 'open',
    options: [],
    totalVotes: 0,
    winnerId: null,
    ...overrides,
  };
}

describe('BookVoteService', () => {
  let service: BookVoteService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideHttpClient(), provideHttpClientTesting(), BookVoteService],
    });
    service = TestBed.inject(BookVoteService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  describe('getRound$', () => {
    it('GETs the current round for a club', () => {
      let result: BookVoteRound | null | undefined;
      service.getRound$('club-1').subscribe(r => { result = r; });
      const req = httpMock.expectOne(`${API}/clubs/club-1/book-vote/round`);
      expect(req.request.method).toBe('GET');
      req.flush(makeRound());
      expect(result?.id).toBe('round-1');
    });

    it('maps a null backend response to null', () => {
      let result: BookVoteRound | null | undefined;
      service.getRound$('club-1').subscribe(r => { result = r; });
      httpMock.expectOne(`${API}/clubs/club-1/book-vote/round`).flush(null);
      expect(result).toBeNull();
    });
  });

  describe('createRound', () => {
    it('POSTs to create a round', async () => {
      const promise = service.createRound('club-1');
      const req = httpMock.expectOne(`${API}/clubs/club-1/book-vote/rounds`);
      expect(req.request.method).toBe('POST');
      req.flush(makeRound());
      await promise;
    });
  });

  describe('addOption', () => {
    it('POSTs the title and author to the round options endpoint', async () => {
      const promise = service.addOption('club-1', 'round-1', 'Dune', 'Frank Herbert');
      const req = httpMock.expectOne(`${API}/clubs/club-1/book-vote/rounds/round-1/options`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ title: 'Dune', author: 'Frank Herbert' });
      req.flush(makeRound());
      await promise;
    });
  });

  describe('removeOption', () => {
    it('DELETEs the option', async () => {
      const promise = service.removeOption('club-1', 'opt-1');
      const req = httpMock.expectOne(`${API}/clubs/club-1/book-vote/options/opt-1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(makeRound());
      await promise;
    });
  });

  describe('vote / unvote', () => {
    it('POSTs to vote for an option', async () => {
      const promise = service.vote('club-1', 'opt-1');
      const req = httpMock.expectOne(`${API}/clubs/club-1/book-vote/options/opt-1/vote`);
      expect(req.request.method).toBe('POST');
      req.flush(makeRound());
      await promise;
    });

    it('DELETEs to remove a vote', async () => {
      const promise = service.unvote('club-1', 'opt-1');
      const req = httpMock.expectOne(`${API}/clubs/club-1/book-vote/options/opt-1/vote`);
      expect(req.request.method).toBe('DELETE');
      req.flush(makeRound());
      await promise;
    });
  });

  describe('closeRound', () => {
    it('POSTs to close the round', async () => {
      const promise = service.closeRound('club-1', 'round-1');
      const req = httpMock.expectOne(`${API}/clubs/club-1/book-vote/rounds/round-1/close`);
      expect(req.request.method).toBe('POST');
      req.flush(makeRound({ status: 'closed' }));
      await promise;
    });
  });
});
