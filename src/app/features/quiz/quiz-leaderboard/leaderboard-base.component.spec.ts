import { Component, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { LeaderboardBaseComponent } from './leaderboard-base.component';
import { QuizService } from '../../../core/services/quiz.service';
import { QuizLeaderboardEntry, QuizSession } from '../../../core/models/quiz.model';

@Component({ selector: 'app-test-leaderboard', template: '', standalone: true })
class TestLeaderboardComponent extends LeaderboardBaseComponent {
  triggerPolling(intervalMs: number): void {
    this.startPolling(intervalMs);
  }
}

function makeEntry(rank: number): QuizLeaderboardEntry {
  return { userId: `u${rank}`, displayName: `User ${rank}`, score: 100 - rank, rank } as QuizLeaderboardEntry;
}

describe('LeaderboardBaseComponent', () => {
  let quizServiceSpy: { getLeaderboard: ReturnType<typeof vi.fn> };

  async function setup(quizId = 'q1') {
    quizServiceSpy = { getLeaderboard: vi.fn().mockResolvedValue([]) };
    await TestBed.configureTestingModule({
      imports: [TestLeaderboardComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: QuizService, useValue: quizServiceSpy },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(TestLeaderboardComponent);
    fixture.componentRef.setInput('quizId', quizId);
    fixture.detectChanges();
    await fixture.whenStable();
    return { fixture, component: fixture.componentInstance };
  }

  it('does not fetch the leaderboard until a session is set', async () => {
    await setup();
    expect(quizServiceSpy.getLeaderboard).not.toHaveBeenCalled();
  });

  it('fetches the leaderboard once quizId and session are both set', async () => {
    const { component, fixture } = await setup('q1');
    component.session.set({ id: 'sess-1' } as QuizSession);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(quizServiceSpy.getLeaderboard).toHaveBeenCalledWith('q1', 'sess-1');
  });

  describe('podium computed signals', () => {
    it('exposes the top three and the rest', async () => {
      const { component, fixture } = await setup('q1');
      quizServiceSpy.getLeaderboard.mockResolvedValue([1, 2, 3, 4, 5].map(makeEntry));
      component.session.set({ id: 'sess-1' } as QuizSession);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.podiumFirst()?.userId).toBe('u1');
      expect(component.podiumSecond()?.userId).toBe('u2');
      expect(component.podiumThird()?.userId).toBe('u3');
      expect(component.rest().map(e => e.userId)).toEqual(['u4', 'u5']);
    });

    it('podium entries are null when the leaderboard is empty', async () => {
      const { component } = await setup();
      expect(component.podiumFirst()).toBeNull();
      expect(component.podiumSecond()).toBeNull();
      expect(component.podiumThird()).toBeNull();
      expect(component.rest()).toEqual([]);
    });
  });

  describe('startPolling / ngOnDestroy', () => {
    it('bumps the refresh tick on each interval and refetches', async () => {
      const { component, fixture } = await setup('q1');
      component.session.set({ id: 'sess-1' } as QuizSession);
      fixture.detectChanges();
      await fixture.whenStable();
      quizServiceSpy.getLeaderboard.mockClear();

      vi.useFakeTimers();
      component.triggerPolling(5000);
      await vi.advanceTimersByTimeAsync(5000);
      vi.useRealTimers();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(quizServiceSpy.getLeaderboard).toHaveBeenCalled();
    });

    it('stops polling after the component is destroyed', async () => {
      const { component, fixture } = await setup('q1');
      component.triggerPolling(5000);
      fixture.destroy();
      quizServiceSpy.getLeaderboard.mockClear();

      vi.useFakeTimers();
      await vi.advanceTimersByTimeAsync(15000);
      vi.useRealTimers();

      expect(quizServiceSpy.getLeaderboard).not.toHaveBeenCalled();
    });
  });
});
