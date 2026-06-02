import { provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { QuizListComponent } from './quiz-list.component';
import { QuizService } from '../../../core/services/quiz.service';
import { AuthService } from '../../../core/auth/auth.service';

function makeQuizService() {
  return {
    quizzes: signal([]),
    isLoading: signal(false),
    activeQuiz: signal(null),
    loadQuizzes: vi.fn().mockResolvedValue(undefined),
    toggleActive: vi.fn().mockResolvedValue(undefined),
  };
}

function makeAuthService() {
  return {
    currentUser: signal(null),
    isAuthenticated: signal(false),
    isOrganizer: signal(false),
  };
}

describe('QuizListComponent', () => {
  let quizSvc: ReturnType<typeof makeQuizService>;
  let authSvc: ReturnType<typeof makeAuthService>;

  beforeEach(async () => {
    quizSvc = makeQuizService();
    authSvc = makeAuthService();

    await TestBed.configureTestingModule({
      imports: [QuizListComponent, TranslateModule.forRoot()],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: QuizService, useValue: quizSvc },
        { provide: AuthService, useValue: authSvc },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(QuizListComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('isLoading is true while resource is pending', () => {
    const fixture = TestBed.createComponent(QuizListComponent);
    // resource() starts loading immediately — isLoading should be true before the promise resolves
    expect(fixture.componentInstance.isLoading()).toBe(true);
  });

  it('toggleActive sets errorMessage on failure', async () => {
    quizSvc.toggleActive.mockImplementation(() => Promise.reject(new Error('toggle failed')));
    const fixture = TestBed.createComponent(QuizListComponent);
    const comp = fixture.componentInstance;

    // Access protected via cast
    (comp as unknown as { toggleActive(id: string, active: boolean): void }).toggleActive('q1', true);
    await new Promise<void>(r => setTimeout(r));

    expect((comp as unknown as { errorMessage: ReturnType<typeof signal<string>> }).errorMessage()).toBe('toggle failed');
  });
});
