import { NO_ERRORS_SCHEMA, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BookVoteSectionComponent } from './book-vote-section.component';
import { BookVoteService } from '../../../../core/services/book-vote.service';

describe('BookVoteSectionComponent', () => {
  async function setup() {
    await TestBed.configureTestingModule({
      imports: [BookVoteSectionComponent],
      providers: [provideZonelessChangeDetection(), BookVoteService],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    const fixture = TestBed.createComponent(BookVoteSectionComponent);
    fixture.componentRef.setInput('clubId', 'club-1');
    fixture.componentRef.setInput('isOwner', true);
    fixture.componentRef.setInput('isMember', true);
    return { fixture, comp: fixture.componentInstance };
  }

  it('should create', async () => {
    const { fixture } = await setup();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('round is null initially', async () => {
    const { comp } = await setup();
    const c = comp as unknown as { round: () => unknown };
    expect(c.round()).toBeNull();
  });

  describe('createRound', () => {
    it('creates a round', async () => {
      const { comp } = await setup();
      const c = comp as unknown as { createRound(): void; round: () => unknown };
      c.createRound();
      expect(c.round()).toBeTruthy();
    });
  });

  describe('addOption', () => {
    it('shows error when title is empty', async () => {
      const { comp } = await setup();
      const c = comp as unknown as { createRound(): void; addOption(): void; addError: () => string; newTitle: { set(v: string): void } };
      c.createRound();
      c.newTitle.set('');
      c.addOption();
      expect(c.addError()).toBeTruthy();
    });

    it('adds option and clears fields when title is set', async () => {
      const { comp } = await setup();
      const c = comp as unknown as { createRound(): void; addOption(): void; newTitle: { set(v: string): void }; newAuthor: { set(v: string): void }; addError: () => string; round: () => { options: unknown[] } | null };
      c.createRound();
      c.newTitle.set('Great Book');
      c.newAuthor.set('Author Name');
      c.addOption();
      expect(c.round()?.options.length).toBe(1);
      expect(c.addError()).toBe('');
    });
  });

  describe('removeOption', () => {
    it('removes option by id', async () => {
      const { comp } = await setup();
      const c = comp as unknown as { createRound(): void; addOption(): void; newTitle: { set(v: string): void }; removeOption(id: string): void; round: () => { options: { id: string }[] } | null };
      c.createRound();
      c.newTitle.set('Book');
      c.addOption();
      const optionId = c.round()?.options[0].id ?? '';
      c.removeOption(optionId);
      expect(c.round()?.options.length).toBe(0);
    });
  });

  describe('toggleVote', () => {
    it('votes when hasVoted is false', async () => {
      const { comp } = await setup();
      const c = comp as unknown as { createRound(): void; addOption(): void; newTitle: { set(v: string): void }; toggleVote(opt: { id: string; hasVoted: boolean }): void; round: () => { options: { id: string; hasVoted: boolean; votes: number }[] } | null };
      c.createRound();
      c.newTitle.set('Book');
      c.addOption();
      const option = c.round()?.options[0] ?? { id: '', hasVoted: false, votes: 0 };
      c.toggleVote({ ...option, hasVoted: false });
      expect(c.round()?.options[0].hasVoted).toBe(true);
    });

    it('unvotes when hasVoted is true', async () => {
      const { comp } = await setup();
      const c = comp as unknown as { createRound(): void; addOption(): void; newTitle: { set(v: string): void }; toggleVote(opt: { id: string; hasVoted: boolean }): void; round: () => { options: { id: string; hasVoted: boolean; votes: number }[] } | null };
      c.createRound();
      c.newTitle.set('Book');
      c.addOption();
      const option = c.round()?.options[0] ?? { id: '', hasVoted: false, votes: 0 };
      c.toggleVote({ ...option, hasVoted: false });
      const voted = c.round()?.options[0] ?? { id: '', hasVoted: true, votes: 1 };
      c.toggleVote({ ...voted, hasVoted: true });
      expect(c.round()?.options[0].hasVoted).toBe(false);
    });
  });

  describe('getPercent', () => {
    it('returns 0 when no total votes', async () => {
      const { comp } = await setup();
      const c = comp as unknown as { createRound(): void; getPercent(opt: { votes: number }): number };
      c.createRound();
      expect(c.getPercent({ votes: 0 })).toBe(0);
    });
  });

  describe('closeRound / newRound', () => {
    it('closes a round', async () => {
      const { comp } = await setup();
      const c = comp as unknown as { createRound(): void; closeRound(): void; round: () => { status: string } | null };
      c.createRound();
      c.closeRound();
      expect(c.round()?.status).toBe('closed');
    });

    it('newRound clears and recreates round', async () => {
      const { comp } = await setup();
      const c = comp as unknown as { createRound(): void; closeRound(): void; newRound(): void; round: () => { status: string } | null };
      c.createRound();
      c.closeRound();
      c.newRound();
      expect(c.round()?.status).toBe('open');
    });
  });
});
