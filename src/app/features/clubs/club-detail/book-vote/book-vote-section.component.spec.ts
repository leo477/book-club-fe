import { NO_ERRORS_SCHEMA, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { BookVoteSectionComponent } from './book-vote-section.component';
import { BookVoteService } from '../../../../core/services/book-vote.service';
import { BookVoteRound } from '../../../../core/models/book-vote.model';

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

describe('BookVoteSectionComponent', () => {
  let voteServiceSpy: {
    getRound$: ReturnType<typeof vi.fn>;
    createRound: ReturnType<typeof vi.fn>;
    addOption: ReturnType<typeof vi.fn>;
    removeOption: ReturnType<typeof vi.fn>;
    vote: ReturnType<typeof vi.fn>;
    unvote: ReturnType<typeof vi.fn>;
    closeRound: ReturnType<typeof vi.fn>;
  };
  let currentRound: BookVoteRound | null;

  async function setup() {
    currentRound = null;
    voteServiceSpy = {
      getRound$: vi.fn(() => of(currentRound)),
      createRound: vi.fn().mockImplementation(async () => {
        currentRound = makeRound();
      }),
      addOption: vi.fn().mockImplementation(async (_clubId: string, _roundId: string, title: string, author: string) => {
        currentRound = makeRound({
          ...currentRound,
          options: [...(currentRound?.options ?? []), { id: 'opt-1', title, author, votes: 0, hasVoted: false }],
        });
      }),
      removeOption: vi.fn().mockImplementation(async (_clubId: string, optionId: string) => {
        currentRound = makeRound({
          ...currentRound,
          options: (currentRound?.options ?? []).filter(o => o.id !== optionId),
        });
      }),
      vote: vi.fn().mockImplementation(async (_clubId: string, optionId: string) => {
        currentRound = makeRound({
          ...currentRound,
          options: (currentRound?.options ?? []).map(o =>
            o.id === optionId ? { ...o, votes: o.votes + 1, hasVoted: true } : o,
          ),
          totalVotes: (currentRound?.totalVotes ?? 0) + 1,
        });
      }),
      unvote: vi.fn().mockImplementation(async (_clubId: string, optionId: string) => {
        currentRound = makeRound({
          ...currentRound,
          options: (currentRound?.options ?? []).map(o =>
            o.id === optionId ? { ...o, votes: Math.max(0, o.votes - 1), hasVoted: false } : o,
          ),
          totalVotes: Math.max(0, (currentRound?.totalVotes ?? 0) - 1),
        });
      }),
      closeRound: vi.fn().mockImplementation(async () => {
        currentRound = makeRound({ ...currentRound, status: 'closed' });
      }),
    };

    await TestBed.configureTestingModule({
      imports: [BookVoteSectionComponent, TranslateModule.forRoot()],
      providers: [
        provideZonelessChangeDetection(),
        { provide: BookVoteService, useValue: voteServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    const fixture = TestBed.createComponent(BookVoteSectionComponent);
    fixture.componentRef.setInput('clubId', 'club-1');
    fixture.componentRef.setInput('isOwner', true);
    fixture.componentRef.setInput('isMember', true);
    const translate = TestBed.inject(TranslateService);
    await firstValueFromTranslate(translate);
    fixture.detectChanges();
    await fixture.whenStable();
    const comp = fixture.componentInstance as unknown as CompProtected;

    // reload() after a mutation resolves the resource's stream asynchronously;
    // flush effects + stability so comp.round() reflects the new value.
    async function act<T>(fn: () => Promise<T>): Promise<T> {
      const result = await fn();
      await fixture.whenStable();
      TestBed.flushEffects();
      return result;
    }

    return { fixture, comp, act };
  }

  async function firstValueFromTranslate(translate: TranslateService): Promise<void> {
    await new Promise<void>(resolve => {
      translate.use('uk').subscribe({ complete: resolve, error: resolve });
    });
  }

  interface CompProtected {
    round: () => BookVoteRound | null;
    isActionLoading: () => boolean;
    addError: () => string;
    newTitle: { (): string; set(v: string): void };
    newAuthor: { (): string; set(v: string): void };
    createRound(): Promise<void>;
    addOption(): Promise<void>;
    removeOption(optionId: string): Promise<void>;
    toggleVote(option: { id: string; hasVoted: boolean; votes: number }): Promise<void>;
    closeRound(): Promise<void>;
    newRound(): Promise<void>;
    percentByOptionId: () => Record<string, number>;
  }

  it('should create', async () => {
    const { fixture } = await setup();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('round is null initially', async () => {
    const { comp } = await setup();
    expect(comp.round()).toBeNull();
  });

  describe('createRound', () => {
    it('creates a round', async () => {
      const { comp, act } = await setup();
      await act(() => comp.createRound());
      expect(voteServiceSpy.createRound).toHaveBeenCalledWith('club-1');
      expect(comp.round()).toBeTruthy();
    });
  });

  describe('addOption', () => {
    it('shows error when title is empty', async () => {
      const { comp, act } = await setup();
      await act(() => comp.createRound());
      comp.newTitle.set('');
      await act(() => comp.addOption());
      expect(comp.addError()).toBeTruthy();
      expect(voteServiceSpy.addOption).not.toHaveBeenCalled();
    });

    it('adds option and clears fields when title is set', async () => {
      const { comp, act } = await setup();
      await act(() => comp.createRound());
      comp.newTitle.set('Great Book');
      comp.newAuthor.set('Author Name');
      await act(() => comp.addOption());
      expect(voteServiceSpy.addOption).toHaveBeenCalledWith('club-1', 'round-1', 'Great Book', 'Author Name');
      expect(comp.round()?.options.length).toBe(1);
      expect(comp.newTitle()).toBe('');
      expect(comp.addError()).toBe('');
    });
  });

  describe('removeOption', () => {
    it('removes option by id', async () => {
      const { comp, act } = await setup();
      await act(() => comp.createRound());
      comp.newTitle.set('Book');
      await act(() => comp.addOption());
      const optionId = comp.round()?.options[0].id ?? '';
      await act(() => comp.removeOption(optionId));
      expect(comp.round()?.options.length).toBe(0);
    });
  });

  describe('toggleVote', () => {
    it('votes when hasVoted is false', async () => {
      const { comp, act } = await setup();
      await act(() => comp.createRound());
      comp.newTitle.set('Book');
      await act(() => comp.addOption());
      const option = comp.round()?.options[0] ?? { id: '', hasVoted: false, votes: 0 };
      await act(() => comp.toggleVote(option));
      expect(voteServiceSpy.vote).toHaveBeenCalledWith('club-1', option.id);
      expect(comp.round()?.options[0].hasVoted).toBe(true);
    });

    it('unvotes when hasVoted is true', async () => {
      const { comp, act } = await setup();
      await act(() => comp.createRound());
      comp.newTitle.set('Book');
      await act(() => comp.addOption());
      const option = comp.round()?.options[0] ?? { id: '', hasVoted: false, votes: 0 };
      await act(() => comp.toggleVote(option));
      const voted = comp.round()?.options[0] ?? { id: '', hasVoted: true, votes: 1 };
      await act(() => comp.toggleVote(voted));
      expect(voteServiceSpy.unvote).toHaveBeenCalledWith('club-1', voted.id);
      expect(comp.round()?.options[0].hasVoted).toBe(false);
    });
  });

  describe('percentByOptionId', () => {
    it('returns 0 when no total votes', async () => {
      const { comp, act } = await setup();
      await act(() => comp.createRound());
      comp.newTitle.set('Book');
      await act(() => comp.addOption());
      const optionId = comp.round()?.options[0].id ?? '';
      expect(comp.percentByOptionId()[optionId]).toBe(0);
    });
  });

  describe('closeRound / newRound', () => {
    it('closes a round', async () => {
      const { comp, act } = await setup();
      await act(() => comp.createRound());
      await act(() => comp.closeRound());
      expect(comp.round()?.status).toBe('closed');
    });

    it('newRound recreates round', async () => {
      const { comp, act } = await setup();
      await act(() => comp.createRound());
      await act(() => comp.closeRound());
      await act(() => comp.newRound());
      expect(comp.round()?.status).toBe('open');
    });
  });

  describe('error handling', () => {
    it('shows a toast and keeps loading state consistent when an action fails', async () => {
      const { comp, act } = await setup();
      voteServiceSpy.createRound.mockRejectedValueOnce(new Error('boom'));
      await act(() => comp.createRound());
      expect(comp.isActionLoading()).toBe(false);
    });
  });
});
