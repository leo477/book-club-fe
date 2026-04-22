import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { GeocodingService, GeocodeSuggestion } from './geocoding.service';
import { environment } from '../../../environments/environment';

const BASE = `${environment.apiUrl}/geocode/autocomplete`;

const mockSuggestions: GeocodeSuggestion[] = [
  { label: 'Київ, Україна', city: 'Київ', country: 'Україна', lat: 50.45, lng: 30.52 },
  { label: 'Львів, Україна', city: 'Львів', country: 'Україна', lat: 49.84, lng: 24.03 },
];

describe('GeocodingService', () => {
  let service: GeocodingService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [provideZonelessChangeDetection(), GeocodingService],
    });
    service = TestBed.inject(GeocodingService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('autocomplete sends GET with default lang and limit', () => {
    service.autocomplete('Київ').subscribe();

    const req = httpMock.expectOne(r => r.url === BASE);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('q')).toBe('Київ');
    expect(req.request.params.get('lang')).toBe('uk');
    expect(req.request.params.get('limit')).toBe('5');
    req.flush(mockSuggestions);
  });

  it('autocomplete returns suggestions array', () => {
    let result: GeocodeSuggestion[] = [];
    service.autocomplete('Київ').subscribe(s => (result = s));

    httpMock.expectOne(r => r.url === BASE).flush(mockSuggestions);
    expect(result).toEqual(mockSuggestions);
  });

  it('autocomplete sends custom lang and limit', () => {
    service.autocomplete('Lviv', 'en', 3).subscribe();

    const req = httpMock.expectOne(r => r.url === BASE);
    expect(req.request.params.get('lang')).toBe('en');
    expect(req.request.params.get('limit')).toBe('3');
    req.flush([]);
  });
});
