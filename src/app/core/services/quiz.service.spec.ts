import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { QuizService } from './quiz.service';
import { environment } from '../../../environments/environment';

const API = environment.apiUrl;

const rawQuiz = {
  id: 'q1',
  club_id: 'c1',
  created_by: 'u1',
  title: 'Test Quiz',
  description: 'Desc',
  is_active: true,
};

const rawQuestion = {
  id: 'qq1',
  quiz_id: 'q1',
  question: 'What is 2+2?',
  options: ['3', '4', '5'],
  correct_index: 1,
};

const rawAttempt = {
  id: 'a1',
  quiz_id: 'q1',
  user_id: 'u1',
  score: 1,
  total: 1,
  answers: [1],
};

describe('QuizService', () => {
  let service: QuizService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [provideZonelessChangeDetection(), QuizService],
    });
    service = TestBed.inject(QuizService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('starts with empty state', () => {
    expect(service.quizzes()).toEqual([]);
    expect(service.questions()).toEqual([]);
    expect(service.isLoading()).toBeFalse();
    expect(service.activeQuiz()).toBeNull();
  });

  describe('loadQuizzes', () => {
    it('loads and maps quizzes', async () => {
      const p = service.loadQuizzes('c1');
      const req = httpMock.expectOne(`${API}/clubs/c1/quizzes`);
      req.flush([rawQuiz]);
      await p;
      expect(service.quizzes().length).toBe(1);
      expect(service.quizzes()[0].id).toBe('q1');
      expect(service.quizzes()[0].isActive).toBeTrue();
    });

    it('sets isLoading during request', async () => {
      const p = service.loadQuizzes('c1');
      expect(service.isLoading()).toBeTrue();
      httpMock.expectOne(`${API}/clubs/c1/quizzes`).flush([]);
      await p;
      expect(service.isLoading()).toBeFalse();
    });

    it('throws on HTTP error', async () => {
      const p = service.loadQuizzes('c1');
      httpMock.expectOne(`${API}/clubs/c1/quizzes`).flush(
        { detail: 'Not found' },
        { status: 404, statusText: 'Not Found' },
      );
      await expectAsync(p).toBeRejectedWithError();
    });
  });

  describe('activeQuiz', () => {
    it('returns active quiz when present', async () => {
      const p = service.loadQuizzes('c1');
      httpMock.expectOne(`${API}/clubs/c1/quizzes`).flush([rawQuiz]);
      await p;
      expect(service.activeQuiz()?.id).toBe('q1');
    });

    it('returns null when no active quiz', async () => {
      const p = service.loadQuizzes('c1');
      httpMock.expectOne(`${API}/clubs/c1/quizzes`).flush([{ ...rawQuiz, is_active: false }]);
      await p;
      expect(service.activeQuiz()).toBeNull();
    });
  });

  describe('createQuiz', () => {
    it('sends POST and adds quiz to list', async () => {
      const p = service.createQuiz({ clubId: 'c1', title: 'New', description: 'Desc' });
      const req = httpMock.expectOne(`${API}/clubs/c1/quizzes`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ title: 'New', description: 'Desc' });
      req.flush(rawQuiz);
      const quiz = await p;
      expect(quiz.id).toBe('q1');
      expect(service.quizzes().length).toBe(1);
    });

    it('sends null description when empty string', async () => {
      const p = service.createQuiz({ clubId: 'c1', title: 'New', description: '' });
      const req = httpMock.expectOne(`${API}/clubs/c1/quizzes`);
      expect(req.request.body.description).toBeNull();
      req.flush(rawQuiz);
      await p;
    });

    it('throws on HTTP error', async () => {
      const p = service.createQuiz({ clubId: 'c1', title: 'New', description: '' });
      httpMock.expectOne(`${API}/clubs/c1/quizzes`).flush(
        { detail: 'Error' },
        { status: 500, statusText: 'Error' },
      );
      await expectAsync(p).toBeRejectedWithError();
    });
  });

  describe('loadQuestions', () => {
    it('loads and maps questions', async () => {
      const p = service.loadQuestions('q1');
      httpMock.expectOne(`${API}/quizzes/q1/questions`).flush([rawQuestion]);
      await p;
      expect(service.questions()[0].question).toBe('What is 2+2?');
      expect(service.questions()[0].correctIndex).toBe(1);
    });

    it('throws on HTTP error', async () => {
      const p = service.loadQuestions('q1');
      httpMock.expectOne(`${API}/quizzes/q1/questions`).flush(
        {},
        { status: 500, statusText: 'Error' },
      );
      await expectAsync(p).toBeRejectedWithError();
    });
  });

  describe('addQuestion', () => {
    it('sends POST and appends question', async () => {
      const p = service.addQuestion('q1', {
        question: 'Q?',
        options: ['A', 'B'],
        correctIndex: 0,
      });
      const req = httpMock.expectOne(`${API}/quizzes/q1/questions`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ question: 'Q?', options: ['A', 'B'], correct_index: 0 });
      req.flush(rawQuestion);
      await p;
      expect(service.questions().length).toBe(1);
    });

    it('throws on HTTP error', async () => {
      const p = service.addQuestion('q1', { question: 'Q?', options: ['A'], correctIndex: 0 });
      httpMock.expectOne(`${API}/quizzes/q1/questions`).flush(
        {},
        { status: 400, statusText: 'Bad Request' },
      );
      await expectAsync(p).toBeRejectedWithError();
    });
  });

  describe('submitAttempt', () => {
    it('sends POST with answers and returns mapped attempt', async () => {
      const p = service.submitAttempt('q1', [1]);
      const req = httpMock.expectOne(`${API}/quizzes/q1/attempts`);
      expect(req.request.body).toEqual({ answers: [1] });
      req.flush(rawAttempt);
      const attempt = await p;
      expect(attempt.score).toBe(1);
      expect(attempt.total).toBe(1);
    });

    it('throws on HTTP error', async () => {
      const p = service.submitAttempt('q1', [0]);
      httpMock.expectOne(`${API}/quizzes/q1/attempts`).flush(
        {},
        { status: 500, statusText: 'Error' },
      );
      await expectAsync(p).toBeRejectedWithError();
    });
  });

  describe('toggleActive', () => {
    it('sends PATCH and updates quiz in list', async () => {
      // First load a quiz
      const loadP = service.loadQuizzes('c1');
      httpMock.expectOne(`${API}/clubs/c1/quizzes`).flush([{ ...rawQuiz, is_active: false }]);
      await loadP;

      const p = service.toggleActive('q1', true);
      const req = httpMock.expectOne(`${API}/quizzes/q1/active`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ is_active: true });
      req.flush({});
      await p;
      expect(service.quizzes()[0].isActive).toBeTrue();
    });

    it('throws on HTTP error', async () => {
      const p = service.toggleActive('q1', true);
      httpMock.expectOne(`${API}/quizzes/q1/active`).flush(
        {},
        { status: 500, statusText: 'Error' },
      );
      await expectAsync(p).toBeRejectedWithError();
    });
  });
});
