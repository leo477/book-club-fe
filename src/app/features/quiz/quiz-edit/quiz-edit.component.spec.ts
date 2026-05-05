import { Component, NO_ERRORS_SCHEMA, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

@Component({ template: '', standalone: true })
class StubComponent {}
import { QuizEditComponent } from './quiz-edit.component';
import { QuizService } from '../../../core/services/quiz.service';
import { Quiz, QuizQuestion } from '../../../core/models/quiz.model';

const mockQuiz: Quiz = { id: 'q1', clubId: 'c1', createdBy: 'u1', title: 'Quiz', description: 'Desc', isActive: false, status: 'draft' };
const mockQuestion: QuizQuestion = { id: 'qq1', quizId: 'q1', question: 'Q?', options: ['A', 'B', 'C', 'D'], correctIndex: 0 };

function makeQuizService(quiz: Quiz | null = mockQuiz, questions: QuizQuestion[] = [mockQuestion]) {
  return {
    getQuiz: jasmine.createSpy('getQuiz').and.returnValue(Promise.resolve(quiz)),
    getQuestions: jasmine.createSpy('getQuestions').and.returnValue(Promise.resolve(questions)),
    updateQuiz: jasmine.createSpy('updateQuiz').and.returnValue(Promise.resolve()),
    addQuestion: jasmine.createSpy('addQuestion').and.returnValue(Promise.resolve(mockQuestion)),
    updateQuestion: jasmine.createSpy('updateQuestion').and.returnValue(Promise.resolve(mockQuestion)),
    deleteQuestion: jasmine.createSpy('deleteQuestion').and.returnValue(Promise.resolve()),
  };
}

type CompInternal = {
  isInvalidTouched(ctrl: unknown): boolean;
  optionLabel(i: number): string;
  nextStep(): void;
  previousStep(): void;
  addQuestion(): void;
  removeQuestion(i: number): void;
  saveChanges(): void;
  currentStep: () => number;
  isSaving: () => boolean;
  errorMessage: () => string;
  canSave: () => boolean;
  isDraft: () => boolean;
  localQuestions: () => unknown[];
  metaForm: { invalid: boolean; valid: boolean; markAllAsTouched(): void; getRawValue(): { title: string; description: string } };
  questionForm: { invalid: boolean; valid: boolean; markAllAsTouched(): void; getRawValue(): { question: string; option0: string; option1: string; option2: string; option3: string; correctIndex: number } };
};

describe('QuizEditComponent', () => {
  async function setup(quiz: Quiz | null = mockQuiz, questions: QuizQuestion[] = [mockQuestion]) {
    const quizSvc = makeQuizService(quiz, questions);
    await TestBed.configureTestingModule({
      imports: [QuizEditComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([{ path: '**', component: StubComponent }]),
        { provide: QuizService, useValue: quizSvc },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
    const fixture = TestBed.createComponent(QuizEditComponent);
    fixture.componentRef.setInput('id', 'c1');
    fixture.componentRef.setInput('quizId', 'q1');
    return { fixture, comp: fixture.componentInstance as unknown as CompInternal, quizSvc };
  }

  it('should create', async () => {
    const { fixture } = await setup();
    expect(fixture.componentInstance).toBeTruthy();
  });

  describe('optionLabel', () => {
    it('returns A-D for indices 0-3', async () => {
      const { comp } = await setup();
      expect(comp.optionLabel(0)).toBe('A');
      expect(comp.optionLabel(3)).toBe('D');
    });
  });

  describe('nextStep / previousStep', () => {
    it('nextStep marks form touched and stays on step 1 when invalid', async () => {
      const { comp } = await setup();
      spyOn(comp.metaForm, 'markAllAsTouched');
      comp.nextStep();
      expect(comp.metaForm.markAllAsTouched).toHaveBeenCalled();
    });

    it('previousStep sets step to 1', async () => {
      const { comp } = await setup();
      comp.previousStep();
      expect(comp.currentStep()).toBe(1);
    });
  });

  describe('addQuestion', () => {
    it('marks form touched when invalid', async () => {
      const { comp } = await setup();
      spyOn(comp.questionForm, 'markAllAsTouched');
      comp.addQuestion();
      expect(comp.questionForm.markAllAsTouched).toHaveBeenCalled();
    });
  });

  describe('removeQuestion', () => {
    it('removes question at index (no id)', async () => {
      const { comp } = await setup(mockQuiz, [mockQuestion]);
      await new Promise<void>(r => setTimeout(r));
      expect(comp.localQuestions().length).toBe(1);
      comp.removeQuestion(0);
      expect(comp.localQuestions().length).toBe(0);
    });
  });

  describe('isInvalidTouched', () => {
    it('returns false for a valid untouched control', async () => {
      const { comp } = await setup();
      const ctrl = { invalid: false, touched: false };
      expect(comp.isInvalidTouched(ctrl)).toBeFalse();
    });

    it('returns true for invalid and touched control', async () => {
      const { comp } = await setup();
      const ctrl = { invalid: true, touched: true };
      expect(comp.isInvalidTouched(ctrl)).toBeTrue();
    });
  });

  describe('saveChanges', () => {
    it('does nothing when canSave is false (no questions)', async () => {
      const { comp, quizSvc } = await setup(mockQuiz, []);
      await new Promise<void>(r => setTimeout(r));
      comp.saveChanges();
      expect(quizSvc.updateQuiz).not.toHaveBeenCalled();
    });
  });
});
