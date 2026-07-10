import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { BookCoverService } from './book-cover.service';

describe('BookCoverService', () => {
  let service: BookCoverService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideHttpClient(), provideHttpClientTesting(), BookCoverService],
    });
    service = TestBed.inject(BookCoverService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('fetchCover returns cover URL when cover_i exists', () => {
    let result: string | null | undefined;

    service.fetchCover$('Dune').subscribe(url => (result = url));

    const req = httpMock.expectOne(r => r.url.startsWith('https://openlibrary.org/'));
    expect(req.request.method).toBe('GET');
    req.flush({ docs: [{ cover_i: 12345 }] });

    expect(result).toBe('https://covers.openlibrary.org/b/id/12345-M.jpg');
  });

  it('fetchCover returns null when no cover_i', () => {
    let result: string | null | undefined;

    service.fetchCover$('Unknown Book').subscribe(url => (result = url));

    const req = httpMock.expectOne(r => r.url.startsWith('https://openlibrary.org/'));
    req.flush({ docs: [{}] });

    expect(result).toBeNull();
  });

  it('fetchCover returns null on HTTP error', () => {
    let result: string | null | undefined;

    service.fetchCover$('Error Book').subscribe(url => (result = url));

    const req = httpMock.expectOne(r => r.url.startsWith('https://openlibrary.org/'));
    req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });

    expect(result).toBeNull();
  });

  it('fetchCover$ returns resolved URL from cache on second call without HTTP', () => {
    let result1: string | null | undefined;
    let result2: string | null | undefined;

    service.fetchCover$('Dune').subscribe(url => (result1 = url));
    const req = httpMock.expectOne(r => r.url.startsWith('https://openlibrary.org/'));
    req.flush({ docs: [{ cover_i: 12345 }] });
    expect(result1).toBe('https://covers.openlibrary.org/b/id/12345-M.jpg');

    service.fetchCover$('Dune').subscribe(url => (result2 = url));
    httpMock.expectNone(r => r.url.startsWith('https://openlibrary.org/'));
    expect(result2).toBe('https://covers.openlibrary.org/b/id/12345-M.jpg');
  });

  it('fetchCover$ caches null result and returns it on second call without HTTP', () => {
    let result1: string | null | undefined;
    let result2: string | null | undefined;

    service.fetchCover$('Unknown').subscribe(url => (result1 = url));
    const req = httpMock.expectOne(r => r.url.startsWith('https://openlibrary.org/'));
    req.flush({ docs: [{}] });
    expect(result1).toBeNull();

    service.fetchCover$('Unknown').subscribe(url => (result2 = url));
    httpMock.expectNone(r => r.url.startsWith('https://openlibrary.org/'));
    expect(result2).toBeNull();
  });

  it('fetchCover$ deduplicates concurrent requests for the same title', () => {
    let result1: string | null | undefined;
    let result2: string | null | undefined;

    service.fetchCover$('Dune').subscribe(url => (result1 = url));
    service.fetchCover$('Dune').subscribe(url => (result2 = url));

    const reqs = httpMock.match(r => r.url.startsWith('https://openlibrary.org/'));
    expect(reqs).toHaveLength(1);
    reqs[0].flush({ docs: [{ cover_i: 12345 }] });

    expect(result1).toBe('https://covers.openlibrary.org/b/id/12345-M.jpg');
    expect(result2).toBe('https://covers.openlibrary.org/b/id/12345-M.jpg');
  });
});
