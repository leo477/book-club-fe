import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BookCoverService } from './book-cover.service';

describe('BookCoverService', () => {
  let service: BookCoverService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [provideZonelessChangeDetection(), BookCoverService],
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

    service.fetchCover('Dune').subscribe(url => (result = url));

    const req = httpMock.expectOne(r => r.url.includes('openlibrary.org'));
    expect(req.request.method).toBe('GET');
    req.flush({ docs: [{ cover_i: 12345 }] });

    expect(result).toBe('https://covers.openlibrary.org/b/id/12345-M.jpg');
  });

  it('fetchCover returns null when no cover_i', () => {
    let result: string | null | undefined;

    service.fetchCover('Unknown Book').subscribe(url => (result = url));

    const req = httpMock.expectOne(r => r.url.includes('openlibrary.org'));
    req.flush({ docs: [{}] });

    expect(result).toBeNull();
  });

  it('fetchCover returns null on HTTP error', () => {
    let result: string | null | undefined;

    service.fetchCover('Error Book').subscribe(url => (result = url));

    const req = httpMock.expectOne(r => r.url.includes('openlibrary.org'));
    req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });

    expect(result).toBeNull();
  });
});
