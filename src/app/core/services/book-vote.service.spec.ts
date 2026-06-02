import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { BookVoteService } from './book-vote.service';

describe('BookVoteService', () => {
  let service: BookVoteService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), BookVoteService],
    });
    service = TestBed.inject(BookVoteService);
  });

  it('getRound returns null when no round exists', () => {
    expect(service.getRound('club-1')).toBeNull();
  });

  describe('createRound', () => {
    it('creates a round with open status and no options', () => {
      service.createRound('club-1');
      const round = service.getRound('club-1');
      expect(round).toBeTruthy();
      expect(round?.status).toBe('open');
      expect(round?.clubId).toBe('club-1');
      expect(round?.options).toEqual([]);
      expect(round?.totalVotes).toBe(0);
      expect(round?.winnerId).toBeNull();
    });
  });

  describe('addOption', () => {
    it('adds an option to the round', () => {
      service.createRound('club-1');
      service.addOption('club-1', '  Book Title  ', 'Author');
      const round = service.getRound('club-1');
      expect(round?.options.length).toBe(1);
      expect(round?.options[0].title).toBe('Book Title');
      expect(round?.options[0].author).toBe('Author');
      expect(round?.options[0].votes).toBe(0);
      expect(round?.options[0].hasVoted).toBe(false);
    });

    it('does nothing when round does not exist', () => {
      service.addOption('missing', 'Title', 'Author');
      expect(service.getRound('missing')).toBeNull();
    });
  });

  describe('removeOption', () => {
    it('removes option and adjusts totalVotes', () => {
      service.createRound('club-1');
      service.addOption('club-1', 'Book A', 'Auth A');
      const options = service.getRound('club-1')?.options ?? [];
      service.removeOption('club-1', options[0].id);
      expect(service.getRound('club-1')?.options.length).toBe(0);
    });
  });

  describe('vote', () => {
    it('votes for an option and increments count', () => {
      service.createRound('club-1');
      service.addOption('club-1', 'Book A', 'Auth A');
      const optionId = service.getRound('club-1')?.options[0].id ?? '';
      service.vote('club-1', optionId);
      const round = service.getRound('club-1');
      expect(round?.options[0].votes).toBe(1);
      expect(round?.options[0].hasVoted).toBe(true);
      expect(round?.totalVotes).toBe(1);
    });

    it('switches vote from one option to another', () => {
      service.createRound('club-1');
      service.addOption('club-1', 'Book A', 'Auth A');
      service.addOption('club-1', 'Book B', 'Auth B');
      const ids = service.getRound('club-1')?.options.map(o => o.id) ?? [];
      const [idA, idB] = ids;
      service.vote('club-1', idA);
      service.vote('club-1', idB);
      const round = service.getRound('club-1');
      expect(round?.options.find(o => o.id === idA)?.hasVoted).toBe(false);
      expect(round?.options.find(o => o.id === idB)?.hasVoted).toBe(true);
      expect(round?.totalVotes).toBe(1);
    });
  });

  describe('unvote', () => {
    it('removes vote from option', () => {
      service.createRound('club-1');
      service.addOption('club-1', 'Book A', 'Auth A');
      const optionId = service.getRound('club-1')?.options[0].id ?? '';
      service.vote('club-1', optionId);
      service.unvote('club-1', optionId);
      const round = service.getRound('club-1');
      expect(round?.options[0].votes).toBe(0);
      expect(round?.options[0].hasVoted).toBe(false);
      expect(round?.totalVotes).toBe(0);
    });
  });

  describe('closeRound', () => {
    it('closes round and sets winnerId to highest-voted option', () => {
      service.createRound('club-1');
      service.addOption('club-1', 'Book A', 'Auth A');
      service.addOption('club-1', 'Book B', 'Auth B');
      const ids = service.getRound('club-1')?.options.map(o => o.id) ?? [];
      const [idA] = ids;
      service.vote('club-1', idA);
      service.closeRound('club-1');
      const round = service.getRound('club-1');
      expect(round?.status).toBe('closed');
      expect(round?.winnerId).toBe(idA);
    });

    it('closes round with null winner when no options', () => {
      service.createRound('club-1');
      service.closeRound('club-1');
      expect(service.getRound('club-1')?.winnerId).toBeNull();
    });
  });

  describe('clearRound', () => {
    it('removes the round', () => {
      service.createRound('club-1');
      service.clearRound('club-1');
      expect(service.getRound('club-1')).toBeNull();
    });
  });
});
