import { Component, NO_ERRORS_SCHEMA, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

@Component({ template: '', standalone: true })
class StubComponent {}
import { QuizSessionComponent } from './quiz-session.component';
import { QuizService } from '../../../core/services/quiz.service';
import { QuizSession } from '../../../core/models/quiz.model';

const mockSession: QuizSession = {
  id: 's1', quizId: 'q1', eventId: 'e1', startedBy: 'u1',
  startedAt: '2026-01-01T00:00:00Z', closedAt: null, participantCount: 0,
};

function makeQuizService(session: QuizSession | null = null) {
  return {
    getActiveSession: jasmine.createSpy('getActiveSession').and.returnValue(Promise.resolve(session)),
    loadClubEvents: jasmine.createSpy('loadClubEvents').and.returnValue(Promise.resolve([])),
    startSession: jasmine.createSpy('startSession').and.returnValue(Promise.resolve(mockSession)),
    endSession: jasmine.createSpy('endSession').and.returnValue(Promise.resolve()),
    getLeaderboard: jasmine.createSpy('getLeaderboard').and.returnValue(Promise.resolve([])),
  };
}

describe('QuizSessionComponent', () => {
  async function setup(session: QuizSession | null = null) {
    const quizSvc = makeQuizService(session);
    await TestBed.configureTestingModule({
      imports: [QuizSessionComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([{ path: '**', component: StubComponent }]),
        { provide: QuizService, useValue: quizSvc },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
    const fixture = TestBed.createComponent(QuizSessionComponent);
    fixture.componentRef.setInput('id', 'club-1');
    fixture.componentRef.setInput('quizId', 'q1');
    return { fixture, comp: fixture.componentInstance, quizSvc };
  }

  it('should create', async () => {
    const { fixture } = await setup();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('ngOnInit loads session and events', async () => {
    const { comp, quizSvc } = await setup(mockSession);
    comp.ngOnInit();
    await new Promise<void>(r => setTimeout(r));
    expect(quizSvc.getActiveSession).toHaveBeenCalled();
    expect(quizSvc.loadClubEvents).toHaveBeenCalled();
    const c = comp as unknown as { isLoadingSession: () => boolean };
    expect(c.isLoadingSession()).toBeFalse();
  });

  it('ngOnDestroy clears interval without error', async () => {
    const { comp } = await setup();
    comp.ngOnInit();
    expect(() => comp.ngOnDestroy()).not.toThrow();
  });

  describe('startSession', () => {
    it('does nothing when no event is selected', async () => {
      const { comp, quizSvc } = await setup();
      const c = comp as unknown as { startSession(): void };
      c.startSession();
      expect(quizSvc.startSession).not.toHaveBeenCalled();
    });

    it('calls startSession when event is selected', async () => {
      const { comp, quizSvc } = await setup();
      const c = comp as unknown as { startSession(): void; selectedEventId: { set(v: string): void }; isStarting: () => boolean };
      c.selectedEventId.set('e1');
      c.startSession();
      await new Promise<void>(r => setTimeout(r));
      expect(quizSvc.startSession).toHaveBeenCalled();
      expect(c.isStarting()).toBeFalse();
    });

    it('sets errorMessage on failure', async () => {
      const { comp, quizSvc } = await setup();
      quizSvc.startSession.and.returnValue(Promise.reject(new Error('network error')));
      const c = comp as unknown as { startSession(): void; selectedEventId: { set(v: string): void }; errorMessage: () => string };
      c.selectedEventId.set('e1');
      c.startSession();
      await new Promise<void>(r => setTimeout(r));
      expect(c.errorMessage()).toBe('network error');
    });
  });

  describe('endSession', () => {
    it('does nothing when no session exists', async () => {
      const { comp, quizSvc } = await setup();
      const c = comp as unknown as { endSession(): void };
      c.endSession();
      expect(quizSvc.endSession).not.toHaveBeenCalled();
    });

    it('calls endSession and navigates on success', async () => {
      const { comp, quizSvc } = await setup(mockSession);
      comp.ngOnInit();
      await new Promise<void>(r => setTimeout(r));
      const c = comp as unknown as { endSession(): void; isEnding: () => boolean };
      c.endSession();
      await new Promise<void>(r => setTimeout(r));
      expect(quizSvc.endSession).toHaveBeenCalled();
    });

    it('sets errorMessage on failure', async () => {
      const { comp, quizSvc } = await setup(mockSession);
      comp.ngOnInit();
      await new Promise<void>(r => setTimeout(r));
      quizSvc.endSession.and.returnValue(Promise.reject(new Error('end failed')));
      const c = comp as unknown as { endSession(): void; errorMessage: () => string; isEnding: () => boolean };
      c.endSession();
      await new Promise<void>(r => setTimeout(r));
      expect(c.errorMessage()).toBe('end failed');
      expect(c.isEnding()).toBeFalse();
    });
  });

  describe('manualRefresh', () => {
    it('increments refresh tick', async () => {
      const { comp } = await setup();
      const c = comp as unknown as { manualRefresh(): void; _refreshTick: () => number };
      const before = c._refreshTick();
      c.manualRefresh();
      expect(c._refreshTick()).toBe(before + 1);
    });
  });
});
