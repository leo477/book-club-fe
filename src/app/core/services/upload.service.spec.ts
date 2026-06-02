import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { UploadService } from './upload.service';
import { environment } from '../../../environments/environment';

describe('UploadService', () => {
  let service: UploadService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideHttpClient(), provideHttpClientTesting(), UploadService],
    });
    service = TestBed.inject(UploadService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('uploadCover POSTs to correct endpoint and maps url', () => {
    const file = new File(['dummy content'], 'cover.jpg', { type: 'image/jpeg' });
    let result: string | undefined;

    service.uploadCover$(file).subscribe(url => (result = url));

    const req = httpMock.expectOne(`${environment.apiUrl}/upload/cover`);
    expect(req.request.method).toBe('POST');
    req.flush({ url: 'https://cdn.example.com/cover.jpg' });

    expect(result).toBe('https://cdn.example.com/cover.jpg');
  });

  it('uploadCover includes the file in FormData', () => {
    const file = new File(['dummy content'], 'cover.jpg', { type: 'image/jpeg' });

    service.uploadCover$(file).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/upload/cover`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBe(true);
    expect(req.request.body.get('file')).toBe(file);

    req.flush({ url: 'https://cdn.example.com/cover.jpg' });
  });
});
