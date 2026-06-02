import { TestBed } from '@angular/core/testing';
import { QuizLeaderboardComponent } from './quiz-leaderboard.component';
import { QuizSession } from '../../../core/models/quiz.model';
import { configureQuizTestBed } from '../../../../testing/quiz-spec.helpers';

function makeQuizService(session: QuizSession | null = null) {
  return {
    getActiveSession: vi.fn().mockResolvedValue(session),
    getLeaderboard: vi.fn().mockResolvedValue([]),
  };
}

describe('QuizLeaderboardComponent', () => {
  async function setup(session: QuizSession | null = null) {
    const quizSvc = makeQuizService(session);
    await configureQuizTestBed(QuizLeaderboardComponent, quizSvc);
    const fixture = TestBed.createComponent(QuizLeaderboardComponent);
    fixture.componentRef.setInput('id', 'club-1');
    fixture.componentRef.setInput('quizId', 'q1');
    return { fixture, comp: fixture.componentInstance, quizSvc };
  }

  it('should create', async () => {
    const { fixture } = await setup();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('ngOnInit loads session and sets isLoadingSession false', async () => {
    const session: QuizSession = { id: 's1', quizId: 'q1', eventId: 'e1', startedBy: 'u1', startedAt: '', closedAt: null, participantCount: 0 };
    const { comp } = await setup(session);
    comp.ngOnInit();
    await new Promise<void>(r => setTimeout(r));
    expect((comp as unknown as { isLoadingSession: () => boolean }).isLoadingSession()).toBe(false);
  });

  it('ngOnDestroy clears interval without error', async () => {
    const { comp } = await setup();
    comp.ngOnInit();
    expect(() => comp.ngOnDestroy()).not.toThrow();
  });
});
