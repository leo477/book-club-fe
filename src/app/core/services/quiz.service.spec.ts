import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { QuizService } from './quiz.service';
import { environment } from '../../../environments/environment';

const API = environment.apiUrl;

const rawQuiz = {
  id: 'q1',
  clubId: 'c1',
  createdBy: 'u1',
  title: 'Test Quiz',
  description: 'Desc',
  isActive: true,
};

const rawQuestion = {
  id: 'qq1',
  quizId: 'q1',
  question: 'What is 2+2?',
  options: ['3', '4', '5'],
  correctIndex: 1,
};

const rawAttempt = {
  id: 'a1',
  quizId: 'q1',
  userId: 'u1',
  score: 1,
  total: 1,
  answers: [1],
};

describe('QuizService', () => {
  let service: QuizService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideHttpClient(), provideHttpClientTesting(), QuizService],
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
    expect(service.isLoading()).toBe(false);
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
      expect(service.quizzes()[0].isActive).toBe(true);
    });

    it('sets isLoading during request', async () => {
      const p = service.loadQuizzes('c1');
      expect(service.isLoading()).toBe(true);
      httpMock.expectOne(`${API}/clubs/c1/quizzes`).flush([]);
      await p;
      expect(service.isLoading()).toBe(false);
    });

    it('throws on HTTP error', async () => {
      const p = service.loadQuizzes('c1');
      httpMock.expectOne(`${API}/clubs/c1/quizzes`).flush(
        { detail: 'Not found' },
        { status: 404, statusText: 'Not Found' },
      );
      await expect(p).rejects.toThrow();
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
      httpMock.expectOne(`${API}/clubs/c1/quizzes`).flush([{ ...rawQuiz, isActive: false }]);
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
      await expect(p).rejects.toThrow();
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
      await expect(p).rejects.toThrow();
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
      expect(req.request.body).toEqual({ question: 'Q?', options: ['A', 'B'], correctIndex: 0 });
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
      await expect(p).rejects.toThrow();
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
      await expect(p).rejects.toThrow();
    });
  });

  describe('toggleActive', () => {
    it('sends PATCH and updates quiz in list', async () => {
      // First load a quiz
      const loadP = service.loadQuizzes('c1');
      httpMock.expectOne(`${API}/clubs/c1/quizzes`).flush([{ ...rawQuiz, isActive: false }]);
      await loadP;

      const p = service.toggleActive('q1', true);
      const req = httpMock.expectOne(`${API}/quizzes/q1/active`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ isActive: true });
      req.flush({});
      await p;
      expect(service.quizzes()[0].isActive).toBe(true);
    });

    it('throws on HTTP error', async () => {
      const p = service.toggleActive('q1', true);
      httpMock.expectOne(`${API}/quizzes/q1/active`).flush(
        {},
        { status: 500, statusText: 'Error' },
      );
      await expect(p).rejects.toThrow();
    });
  });

  describe('getQuiz', () => {
    it('returns mapped quiz by id', async () => {
      const p = service.getQuiz('q1');
      httpMock.expectOne(`${API}/quizzes/q1`).flush(rawQuiz);
      const quiz = await p;
      expect(quiz.id).toBe('q1');
      expect(quiz.title).toBe('Test Quiz');
    });

    it('throws on HTTP error', async () => {
      const p = service.getQuiz('q1');
      httpMock.expectOne(`${API}/quizzes/q1`).flush({}, { status: 404, statusText: 'Not Found' });
      await expect(p).rejects.toThrow();
    });
  });

  describe('getQuestions', () => {
    it('returns mapped questions array', async () => {
      const p = service.getQuestions('q1');
      httpMock.expectOne(`${API}/quizzes/q1/questions`).flush([rawQuestion]);
      const questions = await p;
      expect(questions.length).toBe(1);
      expect(questions[0].question).toBe('What is 2+2?');
    });

    it('throws on HTTP error', async () => {
      const p = service.getQuestions('q1');
      httpMock.expectOne(`${API}/quizzes/q1/questions`).flush({}, { status: 500, statusText: 'Error' });
      await expect(p).rejects.toThrow();
    });
  });

  describe('updateQuiz', () => {
    it('sends PATCH and updates quiz in list', async () => {
      const loadP = service.loadQuizzes('c1');
      httpMock.expectOne(`${API}/clubs/c1/quizzes`).flush([rawQuiz]);
      await loadP;

      const updated = { ...rawQuiz, title: 'Updated Title', description: 'New desc' };
      const p = service.updateQuiz('q1', { title: 'Updated Title', description: 'New desc' });
      const req = httpMock.expectOne(`${API}/quizzes/q1`);
      expect(req.request.method).toBe('PATCH');
      req.flush(updated);
      const quiz = await p;
      expect(quiz.title).toBe('Updated Title');
      expect(service.quizzes()[0].title).toBe('Updated Title');
    });

    it('throws on HTTP error', async () => {
      const p = service.updateQuiz('q1', { title: 'X', description: '' });
      httpMock.expectOne(`${API}/quizzes/q1`).flush({}, { status: 500, statusText: 'Error' });
      await expect(p).rejects.toThrow();
    });
  });

  describe('updateQuestion', () => {
    it('sends PATCH to correct endpoint', async () => {
      const p = service.updateQuestion('q1', 'qq1', { question: 'Updated?' });
      const req = httpMock.expectOne(`${API}/quizzes/q1/questions/qq1`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ question: 'Updated?' });
      req.flush({});
      await p;
    });

    it('throws on HTTP error', async () => {
      const p = service.updateQuestion('q1', 'qq1', { question: 'X' });
      httpMock.expectOne(`${API}/quizzes/q1/questions/qq1`).flush({}, { status: 500, statusText: 'Error' });
      await expect(p).rejects.toThrow();
    });
  });

  describe('deleteQuestion', () => {
    it('sends DELETE to correct endpoint', async () => {
      const p = service.deleteQuestion('q1', 'qq1');
      const req = httpMock.expectOne(`${API}/quizzes/q1/questions/qq1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
      await p;
    });

    it('throws on HTTP error', async () => {
      const p = service.deleteQuestion('q1', 'qq1');
      httpMock.expectOne(`${API}/quizzes/q1/questions/qq1`).flush({}, { status: 500, statusText: 'Error' });
      await expect(p).rejects.toThrow();
    });
  });

  describe('reorderQuestions', () => {
    it('sends PUT with order array', async () => {
      const p = service.reorderQuestions('q1', ['qq2', 'qq1']);
      const req = httpMock.expectOne(`${API}/quizzes/q1/questions/order`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ order: ['qq2', 'qq1'] });
      req.flush({});
      await p;
    });

    it('throws on HTTP error', async () => {
      const p = service.reorderQuestions('q1', ['qq1']);
      httpMock.expectOne(`${API}/quizzes/q1/questions/order`).flush({}, { status: 500, statusText: 'Error' });
      await expect(p).rejects.toThrow();
    });
  });

  describe('startSession', () => {
    const rawSession = {
      id: 's1', quizId: 'q1', eventId: 'e1', startedBy: 'u1',
      startedAt: '2024-01-01T00:00:00Z', closedAt: null, participantCount: 0,
    };

    it('sends POST and updates session signal', async () => {
      const p = service.startSession('q1', 'e1');
      const req = httpMock.expectOne(`${API}/quizzes/q1/sessions`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ eventId: 'e1' });
      req.flush(rawSession);
      const session = await p;
      expect(session.id).toBe('s1');
      expect(service.session()?.id).toBe('s1');
    });

    it('throws on HTTP error', async () => {
      const p = service.startSession('q1', 'e1');
      httpMock.expectOne(`${API}/quizzes/q1/sessions`).flush({}, { status: 500, statusText: 'Error' });
      await expect(p).rejects.toThrow();
    });
  });

  describe('getActiveSession', () => {
    const rawSession = {
      id: 's1', quizId: 'q1', eventId: 'e1', startedBy: 'u1',
      startedAt: '2024-01-01T00:00:00Z', closedAt: null, participantCount: 0,
    };

    it('returns mapped session on success', async () => {
      const p = service.getActiveSession('q1');
      httpMock.expectOne(`${API}/quizzes/q1/sessions/active`).flush(rawSession);
      const session = await p;
      expect(session?.id).toBe('s1');
    });

    it('returns null on HTTP error', async () => {
      const p = service.getActiveSession('q1');
      httpMock.expectOne(`${API}/quizzes/q1/sessions/active`).flush({}, { status: 404, statusText: 'Not Found' });
      const session = await p;
      expect(session).toBeNull();
    });
  });

  describe('getLeaderboard', () => {
    const rawEntry = {
      rank: 1, userId: 'u1', displayName: 'Alice', avatarUrl: null,
      score: 5, totalQuestions: 5, hasAttempted: true,
    };

    it('returns mapped leaderboard entries', async () => {
      const p = service.getLeaderboard('q1', 's1');
      httpMock.expectOne(`${API}/quizzes/q1/sessions/s1/leaderboard`).flush({ entries: [rawEntry] });
      const entries = await p;
      expect(entries.length).toBe(1);
      expect(entries[0].rank).toBe(1);
      expect(entries[0].displayName).toBe('Alice');
    });

    it('throws on HTTP error', async () => {
      const p = service.getLeaderboard('q1', 's1');
      httpMock.expectOne(`${API}/quizzes/q1/sessions/s1/leaderboard`).flush({}, { status: 500, statusText: 'Error' });
      await expect(p).rejects.toThrow();
    });
  });

  describe('endSession', () => {
    it('sends PATCH to close session and clears session signal', async () => {
      const p = service.endSession('q1', 's1');
      const req = httpMock.expectOne(`${API}/quizzes/q1/sessions/s1/close`);
      expect(req.request.method).toBe('PATCH');
      req.flush({});
      await p;
      expect(service.session()).toBeNull();
    });

    it('throws on HTTP error', async () => {
      const p = service.endSession('q1', 's1');
      httpMock.expectOne(`${API}/quizzes/q1/sessions/s1/close`).flush({}, { status: 500, statusText: 'Error' });
      await expect(p).rejects.toThrow();
    });
  });

  describe('getClubQuizzes', () => {
    it('returns mapped quizzes array without updating signal', async () => {
      const p = service.getClubQuizzes('c1');
      httpMock.expectOne(`${API}/clubs/c1/quizzes`).flush([rawQuiz]);
      const quizzes = await p;
      expect(quizzes.length).toBe(1);
      expect(quizzes[0].id).toBe('q1');
      // Does NOT update the quizzes signal
      expect(service.quizzes()).toEqual([]);
    });

    it('throws on HTTP error', async () => {
      const p = service.getClubQuizzes('c1');
      httpMock.expectOne(`${API}/clubs/c1/quizzes`).flush({}, { status: 500, statusText: 'Error' });
      await expect(p).rejects.toThrow();
    });
  });

  describe('loadClubEvents', () => {
    const rawEvent = { id: 'ev1', title: 'Event 1', clubId: 'c1' };

    it('returns events array', async () => {
      const p = service.loadClubEvents('c1');
      httpMock.expectOne(`${API}/clubs/c1/events`).flush([rawEvent]);
      const events = await p;
      expect(events.length).toBe(1);
      expect((events[0] as { id: string }).id).toBe('ev1');
    });

    it('throws on HTTP error', async () => {
      const p = service.loadClubEvents('c1');
      httpMock.expectOne(`${API}/clubs/c1/events`).flush({}, { status: 500, statusText: 'Error' });
      await expect(p).rejects.toThrow();
    });
  });
});
