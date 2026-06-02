import { TestBed } from '@angular/core/testing';
import { QuizPreviewComponent } from './quiz-preview.component';
import { Quiz, QuizQuestion } from '../../../core/models/quiz.model';
import { configureQuizTestBed } from '../../../../testing/quiz-spec.helpers';

const mockQuiz: Quiz = { id: 'q1', clubId: 'c1', createdBy: 'u1', title: 'Quiz', description: null, isActive: false, status: 'draft' };
const mockQuestion: QuizQuestion = { id: 'qq1', quizId: 'q1', question: 'Q?', options: ['A', 'B', 'C', 'D'], correctIndex: 0 };

function makeQuizService() {
  return {
    getQuiz: vi.fn().mockResolvedValue(mockQuiz),
    getQuestions: vi.fn().mockResolvedValue([mockQuestion]),
    toggleActive: vi.fn().mockResolvedValue(undefined),
  };
}

describe('QuizPreviewComponent', () => {
  async function setup() {
    const quizSvc = makeQuizService();
    await configureQuizTestBed(QuizPreviewComponent, quizSvc);
    const fixture = TestBed.createComponent(QuizPreviewComponent);
    fixture.componentRef.setInput('id', 'club-1');
    fixture.componentRef.setInput('quizId', 'q1');
    return { fixture, comp: fixture.componentInstance, quizSvc };
  }

  it('should create', async () => {
    const { fixture } = await setup();
    expect(fixture.componentInstance).toBeTruthy();
  });

  describe('optionLabel', () => {
    it('returns A B C D for indices 0-3', async () => {
      const { comp } = await setup();
      const label = (comp as unknown as { optionLabel(i: number): string }).optionLabel;
      expect(label.call(comp, 0)).toBe('A');
      expect(label.call(comp, 1)).toBe('B');
      expect(label.call(comp, 2)).toBe('C');
      expect(label.call(comp, 3)).toBe('D');
    });
  });

  describe('prev / next navigation', () => {
    it('prev does nothing on first question', async () => {
      const { comp } = await setup();
      await new Promise<void>(r => setTimeout(r));
      const c = comp as unknown as { currentIndex: { update: (fn: (i: number) => number) => void; (): number }; isFirstQuestion: () => boolean; prev(): void };
      expect(c.isFirstQuestion()).toBe(true);
      c.prev();
      expect(c.currentIndex()).toBe(0);
    });

    it('next does nothing on last question when only one question', async () => {
      const { comp } = await setup();
      await new Promise<void>(r => setTimeout(r));
      const c = comp as unknown as { isLastQuestion: () => boolean; next(): void; currentIndex: () => number };
      expect(c.isLastQuestion()).toBe(true);
      c.next();
      expect(c.currentIndex()).toBe(0);
    });
  });

  describe('activateQuiz', () => {
    it('calls toggleActive and navigates on success', async () => {
      const { comp, quizSvc } = await setup();
      const c = comp as unknown as { activateQuiz(): void; isActivating: () => boolean; errorMessage: () => string };
      c.activateQuiz();
      await new Promise<void>(r => setTimeout(r));
      expect(quizSvc.toggleActive).toHaveBeenCalled();
    });

    it('sets errorMessage on failure', async () => {
      const { comp, quizSvc } = await setup();
      quizSvc.toggleActive.mockReturnValue(Promise.reject(new Error('fail')));
      const c = comp as unknown as { activateQuiz(): void; errorMessage: () => string; isActivating: () => boolean };
      c.activateQuiz();
      await new Promise<void>(r => setTimeout(r));
      expect(c.errorMessage()).toBe('fail');
      expect(c.isActivating()).toBe(false);
    });
  });
});
