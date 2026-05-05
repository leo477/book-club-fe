import { Component, NO_ERRORS_SCHEMA, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

@Component({ template: '', standalone: true })
class StubComponent {}
import { QuizLeaderboardComponent } from './quiz-leaderboard.component';
import { QuizService } from '../../../core/services/quiz.service';
import { QuizSession } from '../../../core/models/quiz.model';

function makeQuizService(session: QuizSession | null = null) {
  return {
    getActiveSession: jasmine.createSpy('getActiveSession').and.returnValue(Promise.resolve(session)),
    getLeaderboard: jasmine.createSpy('getLeaderboard').and.returnValue(Promise.resolve([])),
  };
}

describe('QuizLeaderboardComponent', () => {
  async function setup(session: QuizSession | null = null) {
    const quizSvc = makeQuizService(session);
    await TestBed.configureTestingModule({
      imports: [QuizLeaderboardComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([{ path: '**', component: StubComponent }]),
        { provide: QuizService, useValue: quizSvc },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
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
    expect((comp as unknown as { isLoadingSession: () => boolean }).isLoadingSession()).toBeFalse();
  });

  it('ngOnDestroy clears interval without error', async () => {
    const { comp } = await setup();
    comp.ngOnInit();
    expect(() => comp.ngOnDestroy()).not.toThrow();
  });

  describe('initials', () => {
    it('returns two initials for full name', async () => {
      const { comp } = await setup();
      const initials = (comp as unknown as { initials(n: string): string }).initials;
      expect(initials.call(comp, 'Jane Smith')).toBe('JS');
    });

    it('returns first two chars for single word', async () => {
      const { comp } = await setup();
      const initials = (comp as unknown as { initials(n: string): string }).initials;
      expect(initials.call(comp, 'Bob')).toBe('BO');
    });
  });
});
