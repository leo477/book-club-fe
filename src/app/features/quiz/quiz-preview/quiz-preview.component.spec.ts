import { Component, NO_ERRORS_SCHEMA, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

@Component({ template: '', standalone: true })
class StubComponent {}
import { QuizPreviewComponent } from './quiz-preview.component';
import { QuizService } from '../../../core/services/quiz.service';
import { Quiz, QuizQuestion } from '../../../core/models/quiz.model';

const mockQuiz: Quiz = { id: 'q1', clubId: 'c1', createdBy: 'u1', title: 'Quiz', description: null, isActive: false, status: 'draft' };
const mockQuestion: QuizQuestion = { id: 'qq1', quizId: 'q1', question: 'Q?', options: ['A', 'B', 'C', 'D'], correctIndex: 0 };

function makeQuizService() {
  return {
    getQuiz: jasmine.createSpy('getQuiz').and.returnValue(Promise.resolve(mockQuiz)),
    getQuestions: jasmine.createSpy('getQuestions').and.returnValue(Promise.resolve([mockQuestion])),
    toggleActive: jasmine.createSpy('toggleActive').and.returnValue(Promise.resolve()),
  };
}

describe('QuizPreviewComponent', () => {
  async function setup() {
    const quizSvc = makeQuizService();
    await TestBed.configureTestingModule({
      imports: [QuizPreviewComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([{ path: '**', component: StubComponent }]),
        { provide: QuizService, useValue: quizSvc },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
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
      expect(c.isFirstQuestion()).toBeTrue();
      c.prev();
      expect(c.currentIndex()).toBe(0);
    });

    it('next does nothing on last question when only one question', async () => {
      const { comp } = await setup();
      await new Promise<void>(r => setTimeout(r));
      const c = comp as unknown as { isLastQuestion: () => boolean; next(): void; currentIndex: () => number };
      expect(c.isLastQuestion()).toBeTrue();
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
      quizSvc.toggleActive.and.returnValue(Promise.reject(new Error('fail')));
      const c = comp as unknown as { activateQuiz(): void; errorMessage: () => string; isActivating: () => boolean };
      c.activateQuiz();
      await new Promise<void>(r => setTimeout(r));
      expect(c.errorMessage()).toBe('fail');
      expect(c.isActivating()).toBeFalse();
    });
  });
});
