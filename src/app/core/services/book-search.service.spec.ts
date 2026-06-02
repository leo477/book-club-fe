import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { BookSearchService } from './book-search.service';
import { environment } from '../../../environments/environment';

const API = environment.apiUrl;

const mockBook = {
  id: 'b1', title: 'Test Book', authors: ['Author A'],
  description: null, thumbnail: null, publishedDate: '2020', publisher: null,
};

describe('BookSearchService', () => {
  let service: BookSearchService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideHttpClient(), provideHttpClientTesting(), BookSearchService],
    });
    service = TestBed.inject(BookSearchService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => { httpMock.verify(); });

  describe('searchBooks', () => {
    it('GETs /books/search with q and limit=5 by default', () =>
      new Promise<void>((resolve) => {
        service.searchBooks('Angular').subscribe(results => {
          expect(results).toEqual([mockBook]);
          resolve();
        });
        const req = httpMock.expectOne(r => r.url === `${API}/books/search`);
        expect(req.request.method).toBe('GET');
        expect(req.request.params.get('q')).toBe('Angular');
        expect(req.request.params.get('limit')).toBe('5');
        req.flush([mockBook]);
      }));

    it('passes custom limit param', () =>
      new Promise<void>((resolve) => {
        service.searchBooks('React', 10).subscribe(() => resolve());
        const req = httpMock.expectOne(r => r.url === `${API}/books/search`);
        expect(req.request.params.get('limit')).toBe('10');
        req.flush([]);
      }));
  });

  describe('getBookDetails', () => {
    it('GETs /books/details/{id}', () =>
      new Promise<void>((resolve) => {
        service.getBookDetails('b1').subscribe(result => {
          expect(result).toEqual(mockBook);
          resolve();
        });
        const req = httpMock.expectOne(`${API}/books/details/b1`);
        expect(req.request.method).toBe('GET');
        req.flush(mockBook);
      }));
  });
});
