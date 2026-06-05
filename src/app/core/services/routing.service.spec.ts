import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { RoutingService } from './routing.service';
import { environment } from '../../../environments/environment';

const WALKING_URL = `${environment.apiUrl}/routes/walking`;

const ORIGIN: google.maps.LatLngLiteral = { lat: 50.45, lng: 30.52 };
const DEST: google.maps.LatLngLiteral = { lat: 49.0, lng: 32.0 };

describe('RoutingService', () => {
  let service: RoutingService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        RoutingService,
      ],
    });
    service = TestBed.inject(RoutingService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('GETs the walking route with stringified coordinate query params', () => {
    service.walkingRoute$(ORIGIN, DEST).subscribe();

    const req = httpMock.expectOne(r => r.url === WALKING_URL);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('origin_lat')).toBe('50.45');
    expect(req.request.params.get('origin_lng')).toBe('30.52');
    expect(req.request.params.get('dest_lat')).toBe('49');
    expect(req.request.params.get('dest_lng')).toBe('32');
    req.flush({ path: [] });
  });

  it('maps a { path: [...] } response to the path array', () => {
    const path = [ORIGIN, DEST];
    let result: google.maps.LatLngLiteral[] | undefined;
    service.walkingRoute$(ORIGIN, DEST).subscribe(p => (result = p));

    httpMock.expectOne(r => r.url === WALKING_URL).flush({ path });
    expect(result).toEqual(path);
  });

  it('falls back to [] when the body is {}', () => {
    let result: google.maps.LatLngLiteral[] | undefined;
    service.walkingRoute$(ORIGIN, DEST).subscribe(p => (result = p));

    httpMock.expectOne(r => r.url === WALKING_URL).flush({});
    expect(result).toEqual([]);
  });

  it('falls back to [] when path is null', () => {
    let result: google.maps.LatLngLiteral[] | undefined;
    service.walkingRoute$(ORIGIN, DEST).subscribe(p => (result = p));

    httpMock.expectOne(r => r.url === WALKING_URL).flush({ path: null });
    expect(result).toEqual([]);
  });
});
