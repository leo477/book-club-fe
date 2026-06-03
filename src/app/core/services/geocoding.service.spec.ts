import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TranslateService } from '@ngx-translate/core';
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
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: TranslateService, useValue: { currentLang: 'uk', defaultLang: 'uk' } },
        GeocodingService,
      ],
    });
    service = TestBed.inject(GeocodingService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('autocomplete sends GET with default lang and limit', () => {
    service.autocomplete$('Київ').subscribe();

    const req = httpMock.expectOne(r => r.url === BASE);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('q')).toBe('Київ');
    expect(req.request.params.get('lang')).toBe('uk');
    expect(req.request.params.get('limit')).toBe('5');
    req.flush(mockSuggestions);
  });

  it('autocomplete returns suggestions array', () => {
    let result: GeocodeSuggestion[] = [];
    service.autocomplete$('Київ').subscribe(s => (result = s));

    httpMock.expectOne(r => r.url === BASE).flush(mockSuggestions);
    expect(result).toEqual(mockSuggestions);
  });

  it('autocomplete sends custom lang and limit', () => {
    service.autocomplete$('Lviv', 'en', 3).subscribe();

    const req = httpMock.expectOne(r => r.url === BASE);
    expect(req.request.params.get('lang')).toBe('en');
    expect(req.request.params.get('limit')).toBe('3');
    req.flush([]);
  });

  describe('getPlaceDetails', () => {
    const DETAILS_BASE = `${environment.apiUrl}/geocode/place-details`;
    const resolvedSuggestion: GeocodeSuggestion = {
      label: 'Київ, Україна', city: 'Київ', country: 'Україна', lat: 50.45, lng: 30.52, place_id: 'pid123',
    };

    it('GETs /geocode/place-details with place_id and session_token params', () => {
      service.getPlaceDetails('pid123').subscribe();

      const req = httpMock.expectOne(r => r.url === DETAILS_BASE);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('place_id')).toBe('pid123');
      expect(req.request.params.get('session_token')).toBeTruthy();
      req.flush(resolvedSuggestion);
    });

    it('returns the resolved suggestion', () => {
      let result: GeocodeSuggestion | undefined;
      service.getPlaceDetails('pid123').subscribe(s => (result = s));

      httpMock.expectOne(r => r.url === DETAILS_BASE).flush(resolvedSuggestion);
      expect(result).toEqual(resolvedSuggestion);
    });

    it('errors the observable on network failure and does NOT reset session token', () => {
      let tokenBefore: string | null = null;
      service.autocomplete$('test').subscribe();
      const acReq = httpMock.expectOne(r => r.url === BASE);
      tokenBefore = acReq.request.params.get('session_token');
      acReq.flush([]);

      let errored = false;
      service.getPlaceDetails('pid123').subscribe({
        next: () => { /* should not be called */ },
        error: () => { errored = true; },
      });
      httpMock.expectOne(r => r.url === DETAILS_BASE).error(new ErrorEvent('network'));

      expect(errored).toBe(true);

      // session token should be unchanged because tap (which calls resetSessionToken) only runs on success
      let tokenAfter: string | null = null;
      service.autocomplete$('test2').subscribe();
      const acReq2 = httpMock.expectOne(r => r.url === BASE);
      tokenAfter = acReq2.request.params.get('session_token');
      acReq2.flush([]);

      expect(tokenAfter).toBe(tokenBefore);
    });

    it('resets session token after response', () => {
      let tokenBefore: string | null = null;
      service.autocomplete$('test').subscribe();
      const acReq = httpMock.expectOne(r => r.url === BASE);
      tokenBefore = acReq.request.params.get('session_token');
      acReq.flush([]);

      service.getPlaceDetails('pid123').subscribe();
      httpMock.expectOne(r => r.url === DETAILS_BASE).flush(resolvedSuggestion);

      let tokenAfter: string | null = null;
      service.autocomplete$('test2').subscribe();
      const acReq2 = httpMock.expectOne(r => r.url === BASE);
      tokenAfter = acReq2.request.params.get('session_token');
      acReq2.flush([]);

      expect(tokenAfter).not.toBe(tokenBefore);
    });
  });

  describe('resetSessionToken', () => {
    it('changes the session_token used in the next autocomplete$ request', () => {
      let tokenFirst: string | null = null;
      service.autocomplete$('a').subscribe();
      const req1 = httpMock.expectOne(r => r.url === BASE);
      tokenFirst = req1.request.params.get('session_token');
      req1.flush([]);

      service.resetSessionToken();

      let tokenSecond: string | null = null;
      service.autocomplete$('b').subscribe();
      const req2 = httpMock.expectOne(r => r.url === BASE);
      tokenSecond = req2.request.params.get('session_token');
      req2.flush([]);

      expect(tokenSecond).not.toBe(tokenFirst);
    });
  });
});
