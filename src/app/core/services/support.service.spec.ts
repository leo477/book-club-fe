import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TranslateService } from '@ngx-translate/core';
import { SupportService } from './support.service';
import { environment } from '../../../environments/environment';

const API = environment.apiUrl;

function makeApiSubmission(overrides: Record<string, unknown> = {}) {
  return {
    id: 's1',
    type: 'suggestion',
    title: 'Add dark mode',
    body: 'Please add a dark mode toggle.',
    status: 'pending',
    authorId: 'u1',
    createdAt: '2025-06-01T10:00:00',
    updatedAt: '2025-06-01T10:00:00',
    likeCount: 0,
    likedByMe: false,
    ...overrides,
  };
}

describe('SupportService', () => {
  let service: SupportService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: TranslateService, useValue: { instant: (k: string) => k } },
        SupportService,
      ],
    });
    service = TestBed.inject(SupportService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => { httpMock.verify(); });

  describe('loadSubmissions', () => {
    it('populates submissions signal', async () => {
      const p = service.loadSubmissions();
      httpMock.expectOne(`${API}/support`).flush([makeApiSubmission()]);
      await p;
      expect(service.submissions().length).toBe(1);
      expect(service.submissions()[0].id).toBe('s1');
    });

    it('passes type and status filters', async () => {
      const p = service.loadSubmissions({ type: 'suggestion', status: 'pending' });
      const req = httpMock.expectOne(r => r.url === `${API}/support`);
      expect(req.request.params.get('type')).toBe('suggestion');
      expect(req.request.params.get('status')).toBe('pending');
      req.flush([]);
      await p;
    });

    it('sets error on failure', async () => {
      const p = service.loadSubmissions();
      httpMock.expectOne(`${API}/support`).flush({}, { status: 500, statusText: 'Error' });
      await p;
      expect(service.error()).not.toBeNull();
    });
  });

  describe('submit', () => {
    it('posts payload and prepends the created submission', async () => {
      const p = service.submit({ type: 'comment', title: 'Hi', body: 'Nice app' });
      const req = httpMock.expectOne(`${API}/support`);
      expect(req.request.method).toBe('POST');
      req.flush(makeApiSubmission({ id: 's2', type: 'comment', status: 'open' }));
      const result = await p;
      expect(result.id).toBe('s2');
      expect(service.submissions()[0].id).toBe('s2');
    });
  });

  describe('updateStatus', () => {
    it('patches status and replaces the submission in the list', async () => {
      const loadP = service.loadSubmissions();
      httpMock.expectOne(`${API}/support`).flush([makeApiSubmission()]);
      await loadP;

      const p = service.updateStatus('s1', 'approved');
      const req = httpMock.expectOne(`${API}/support/s1/status`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ status: 'approved' });
      req.flush(makeApiSubmission({ status: 'approved' }));
      await p;
      expect(service.submissions()[0].status).toBe('approved');
    });
  });

  describe('toggleLike', () => {
    async function loadOne(overrides: Record<string, unknown> = {}) {
      const p = service.loadSubmissions();
      httpMock.expectOne(`${API}/support`).flush([makeApiSubmission(overrides)]);
      await p;
    }

    it('does nothing when the submission is not found', async () => {
      await service.toggleLike('missing');
      httpMock.expectNone(`${API}/support/missing/like`);
    });

    it('optimistically likes and posts to the like endpoint', async () => {
      await loadOne({ likedByMe: false, likeCount: 2 });

      const p = service.toggleLike('s1');
      expect(service.submissions()[0].likedByMe).toBe(true);
      expect(service.submissions()[0].likeCount).toBe(3);

      const req = httpMock.expectOne(`${API}/support/s1/like`);
      expect(req.request.method).toBe('POST');
      req.flush(null);
      await p;

      expect(service.submissions()[0].likedByMe).toBe(true);
      expect(service.submissions()[0].likeCount).toBe(3);
    });

    it('optimistically unlikes and deletes on the like endpoint', async () => {
      await loadOne({ likedByMe: true, likeCount: 3 });

      const p = service.toggleLike('s1');
      expect(service.submissions()[0].likedByMe).toBe(false);
      expect(service.submissions()[0].likeCount).toBe(2);

      const req = httpMock.expectOne(`${API}/support/s1/like`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
      await p;

      expect(service.submissions()[0].likedByMe).toBe(false);
      expect(service.submissions()[0].likeCount).toBe(2);
    });

    it('rolls back the like on failure and sets the error', async () => {
      await loadOne({ likedByMe: false, likeCount: 2 });

      const p = service.toggleLike('s1');
      httpMock
        .expectOne(`${API}/support/s1/like`)
        .flush({}, { status: 500, statusText: 'Error' });

      await expect(p).rejects.toBeTruthy();
      expect(service.submissions()[0].likedByMe).toBe(false);
      expect(service.submissions()[0].likeCount).toBe(2);
      expect(service.error()).not.toBeNull();
    });

    it('rolls back the unlike on failure and sets the error', async () => {
      await loadOne({ likedByMe: true, likeCount: 3 });

      const p = service.toggleLike('s1');
      httpMock
        .expectOne(`${API}/support/s1/like`)
        .flush({}, { status: 500, statusText: 'Error' });

      await expect(p).rejects.toBeTruthy();
      expect(service.submissions()[0].likedByMe).toBe(true);
      expect(service.submissions()[0].likeCount).toBe(3);
      expect(service.error()).not.toBeNull();
    });
  });
});
