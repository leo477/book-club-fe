import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { QuizCreateComponent } from './quiz-create.component';
import { QuizService } from '../../../core/services/quiz.service';

function makeQuizService() {
  return {
    createQuiz: vi.fn().mockResolvedValue({ id: 'q1' }),
    addQuestion: vi.fn().mockResolvedValue(undefined),
    toggleActive: vi.fn().mockResolvedValue(undefined),
  };
}

interface CompProtected {
  nextStep(): void;
  addQuestion(): void;
  removeQuestion(i: number): void;
  optionLabel(i: number): string;
  currentStep: (() => 1 | 2);
  localQuestions: (() => unknown[]);
  metaForm: { invalid: boolean; markAllAsTouched(): void };
  questionForm: { invalid: boolean; markAllAsTouched(): void; getRawValue(): Record<string, unknown>; reset(v: unknown): void };
}

describe('QuizCreateComponent', () => {
  let quizSvc: ReturnType<typeof makeQuizService>;

  beforeEach(async () => {
    quizSvc = makeQuizService();

    await TestBed.configureTestingModule({
      imports: [QuizCreateComponent, TranslateModule.forRoot()],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: QuizService, useValue: quizSvc },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(QuizCreateComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('nextStep stays on step 1 when metaForm is invalid', () => {
    const fixture = TestBed.createComponent(QuizCreateComponent);
    const comp = fixture.componentInstance as unknown as CompProtected;
    // metaForm starts invalid (empty required title)
    comp.nextStep();
    expect(comp.currentStep()).toBe(1);
  });

  it('optionLabel returns letter A-D for indices 0-3', () => {
    const fixture = TestBed.createComponent(QuizCreateComponent);
    const comp = fixture.componentInstance as unknown as CompProtected;
    expect(comp.optionLabel(0)).toBe('A');
    expect(comp.optionLabel(1)).toBe('B');
    expect(comp.optionLabel(2)).toBe('C');
    expect(comp.optionLabel(3)).toBe('D');
  });

  it('addQuestion does not add when questionForm is invalid', () => {
    const fixture = TestBed.createComponent(QuizCreateComponent);
    const comp = fixture.componentInstance as unknown as CompProtected;
    comp.addQuestion();
    expect(comp.localQuestions()).toHaveLength(0);
  });

  it('removeQuestion removes the question at given index', () => {
    const fixture = TestBed.createComponent(QuizCreateComponent);
    const comp = fixture.componentInstance as unknown as CompProtected;

    // Fill the question form manually to bypass validation
    comp.questionForm.getRawValue = () => ({
      question: 'What is Angular?',
      option0: 'A framework',
      option1: 'A library',
      option2: 'A language',
      option3: 'A runtime',
      correctIndex: 0,
    });
    // Directly mutate localQuestions via questionForm trick is tricky —
    // instead test via signal directly
    const anyComp = fixture.componentInstance as unknown as {
      localQuestions: { update(fn: (v: unknown[]) => unknown[]): void; (): unknown[] };
    };
    anyComp.localQuestions.update(() => [{ question: 'Q1', options: [], correctIndex: 0 }, { question: 'Q2', options: [], correctIndex: 0 }]);
    comp.removeQuestion(0);
    expect(anyComp.localQuestions()).toHaveLength(1);
  });
});
