import { NO_ERRORS_SCHEMA, provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import { QuizTakeComponent } from './quiz-take.component';
import { QuizService } from '../../../core/services/quiz.service';
import { QuizQuestion } from '../../../core/models/quiz.model';

function makeQuizService(questions: QuizQuestion[] = []) {
  return {
    questions: signal<QuizQuestion[]>(questions),
    loadQuestions: jasmine.createSpy('loadQuestions').and.returnValue(Promise.resolve()),
    submitAttempt: jasmine.createSpy('submitAttempt').and.returnValue(
      Promise.resolve({ score: 3, total: 5, answers: [] }),
    ),
  };
}

function makeActivatedRoute(params: Record<string, string> = { id: 'club-1', quizId: 'quiz-1' }) {
  return {
    snapshot: { params },
  };
}

describe('QuizTakeComponent', () => {
  let quizSvc: ReturnType<typeof makeQuizService>;

  async function setup(
    questions: QuizQuestion[] = [],
    routeParams: Record<string, string> = { id: 'club-1', quizId: 'quiz-1' },
  ) {
    quizSvc = makeQuizService(questions);

    await TestBed.configureTestingModule({
      imports: [QuizTakeComponent, TranslateModule.forRoot()],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: QuizService, useValue: quizSvc },
        { provide: ActivatedRoute, useValue: makeActivatedRoute(routeParams) },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }

  it('should create with initial state "loading"', async () => {
    await setup();
    const fixture = TestBed.createComponent(QuizTakeComponent);
    const comp = fixture.componentInstance as unknown as { state: () => string };
    expect(fixture.componentInstance).toBeTruthy();
    expect(comp.state()).toBe('loading');
  });

  it('ngOnInit sets error state when quizId is missing', async () => {
    await setup([], { id: 'club-1' }); // no quizId param
    const fixture = TestBed.createComponent(QuizTakeComponent);
    fixture.componentInstance.ngOnInit();
    const comp = fixture.componentInstance as unknown as {
      state: () => string;
      errorMessage: () => string;
    };
    expect(comp.state()).toBe('error');
    expect(comp.errorMessage()).toBe('Quiz not found.');
  });

  it('ngOnInit sets error state when no questions are loaded', async () => {
    // questions signal returns [] after loadQuestions resolves
    await setup([]);
    const fixture = TestBed.createComponent(QuizTakeComponent);
    fixture.componentInstance.ngOnInit();
    await new Promise<void>(r => setTimeout(r));

    const comp = fixture.componentInstance as unknown as {
      state: () => string;
      errorMessage: () => string;
    };
    expect(comp.state()).toBe('error');
    expect(comp.errorMessage()).toBe('This quiz has no questions yet.');
  });

  it('ngOnInit sets state to "taking" when questions exist', async () => {
    const fakeQuestions: QuizQuestion[] = [
      { id: 'q1', quizId: 'quiz-1', question: 'What is 2+2?', options: ['1', '2', '3', '4'], correctIndex: 3 },
      { id: 'q2', quizId: 'quiz-1', question: 'Sky color?', options: ['Red', 'Blue', 'Green'], correctIndex: 1 },
    ];

    await setup([]);
    // loadQuestions will resolve and questions signal will be updated by the service in real usage;
    // here we simulate by updating after load
    quizSvc.loadQuestions.and.callFake(async () => {
      quizSvc.questions.set(fakeQuestions);
    });

    const fixture = TestBed.createComponent(QuizTakeComponent);
    fixture.componentInstance.ngOnInit();
    await new Promise<void>(r => setTimeout(r));

    const comp = fixture.componentInstance as unknown as { state: () => string };
    expect(comp.state()).toBe('taking');
  });

  it('selectOption updates selectedAnswers at currentIndex', async () => {
    const fakeQuestions: QuizQuestion[] = [
      { id: 'q1', quizId: 'quiz-1', question: 'Q1?', options: ['A', 'B', 'C'], correctIndex: 0 },
      { id: 'q2', quizId: 'quiz-1', question: 'Q2?', options: ['X', 'Y', 'Z'], correctIndex: 1 },
    ];
    await setup(fakeQuestions);
    quizSvc.loadQuestions.and.callFake(async () => quizSvc.questions.set(fakeQuestions));

    const fixture = TestBed.createComponent(QuizTakeComponent);
    fixture.componentInstance.ngOnInit();
    await new Promise<void>(r => setTimeout(r));

    const comp = fixture.componentInstance as unknown as {
      selectOption(index: number): void;
      selectedAnswers: () => number[];
      currentIndex: () => number;
    };

    expect(comp.currentIndex()).toBe(0);
    comp.selectOption(2);
    expect(comp.selectedAnswers()[0]).toBe(2);
  });

  it('next() does nothing when no option is selected', async () => {
    const fakeQuestions: QuizQuestion[] = [
      { id: 'q1', quizId: 'quiz-1', question: 'Q1?', options: ['A', 'B'], correctIndex: 0 },
      { id: 'q2', quizId: 'quiz-1', question: 'Q2?', options: ['X', 'Y'], correctIndex: 1 },
    ];
    await setup(fakeQuestions);
    quizSvc.loadQuestions.and.callFake(async () => quizSvc.questions.set(fakeQuestions));

    const fixture = TestBed.createComponent(QuizTakeComponent);
    fixture.componentInstance.ngOnInit();
    await new Promise<void>(r => setTimeout(r));

    const comp = fixture.componentInstance as unknown as {
      next(): void;
      currentIndex: () => number;
      selectedOption: () => number;
    };

    // No option selected yet — selectedOption should be -1
    expect(comp.selectedOption()).toBe(-1);
    comp.next();
    expect(comp.currentIndex()).toBe(0);
  });

  it('next() advances currentIndex when an option is selected', async () => {
    const fakeQuestions: QuizQuestion[] = [
      { id: 'q1', quizId: 'quiz-1', question: 'Q1?', options: ['A', 'B'], correctIndex: 0 },
      { id: 'q2', quizId: 'quiz-1', question: 'Q2?', options: ['X', 'Y'], correctIndex: 1 },
    ];
    await setup(fakeQuestions);
    quizSvc.loadQuestions.and.callFake(async () => quizSvc.questions.set(fakeQuestions));

    const fixture = TestBed.createComponent(QuizTakeComponent);
    fixture.componentInstance.ngOnInit();
    await new Promise<void>(r => setTimeout(r));

    const comp = fixture.componentInstance as unknown as {
      selectOption(index: number): void;
      next(): void;
      currentIndex: () => number;
    };

    comp.selectOption(0);
    comp.next();
    expect(comp.currentIndex()).toBe(1);
  });

  it('previous() does nothing when already at index 0', async () => {
    const fakeQuestions: QuizQuestion[] = [
      { id: 'q1', quizId: 'quiz-1', question: 'Q1?', options: ['A', 'B'], correctIndex: 0 },
    ];
    await setup(fakeQuestions);
    quizSvc.loadQuestions.and.callFake(async () => quizSvc.questions.set(fakeQuestions));

    const fixture = TestBed.createComponent(QuizTakeComponent);
    fixture.componentInstance.ngOnInit();
    await new Promise<void>(r => setTimeout(r));

    const comp = fixture.componentInstance as unknown as {
      previous(): void;
      currentIndex: () => number;
    };

    expect(comp.currentIndex()).toBe(0);
    comp.previous();
    expect(comp.currentIndex()).toBe(0);
  });

  it('scoreMessage returns the correct message for various score percentages', async () => {
    await setup();
    const fixture = TestBed.createComponent(QuizTakeComponent);
    const comp = fixture.componentInstance as unknown as {
      attempt: ReturnType<typeof signal<{ score: number; total: number; answers: number[] } | null>>;
      scoreMessage: () => string;
    };

    comp.attempt.set({ score: 5, total: 5, answers: [] });
    expect(comp.scoreMessage()).toBe('QUIZ.result_perfect');

    comp.attempt.set({ score: 4, total: 5, answers: [] }); // 80%
    expect(comp.scoreMessage()).toBe('🌟 Great job!');

    comp.attempt.set({ score: 3, total: 5, answers: [] }); // 60%
    expect(comp.scoreMessage()).toBe('👍 Good effort!');

    comp.attempt.set({ score: 2, total: 5, answers: [] }); // 40%
    expect(comp.scoreMessage()).toBe('📖 Keep reading!');

    comp.attempt.set({ score: 1, total: 5, answers: [] }); // 20%
    expect(comp.scoreMessage()).toBe('💪 Better luck next time!');
  });
});
