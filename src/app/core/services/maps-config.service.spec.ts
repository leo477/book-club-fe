import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MapsConfigService, MAPS_LOADER_FNS } from './maps-config.service';
import { environment } from '../../../environments/environment';

const MAPS_KEY_URL = `${environment.apiUrl}/config/maps-key`;

describe('MapsConfigService', () => {
  let service: MapsConfigService;
  let httpMock: HttpTestingController;
  let setOptionsSpy: jasmine.Spy;
  let importLibrarySpy: jasmine.Spy;

  beforeEach(() => {
    setOptionsSpy = jasmine.createSpy('setOptions');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    importLibrarySpy = jasmine.createSpy('importLibrary').and.resolveTo({} as any);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        provideZonelessChangeDetection(),
        MapsConfigService,
        { provide: MAPS_LOADER_FNS, useValue: { setOptions: setOptionsSpy, importLibrary: importLibrarySpy } },
      ],
    });
    service = TestBed.inject(MapsConfigService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  describe('load() with valid key', () => {
    it('calls setOptions and importLibrary for maps and routes, sets isLoaded true', async () => {
      const loadPromise = service.load();
      httpMock.expectOne(MAPS_KEY_URL).flush({ mapsApiKey: 'key123' });
      await loadPromise;

      expect(setOptionsSpy).toHaveBeenCalledWith({ key: 'key123', v: 'weekly', libraries: ['maps', 'routes'] });
      expect(importLibrarySpy).toHaveBeenCalledWith('maps');
      expect(importLibrarySpy).toHaveBeenCalledWith('routes');
      expect(service.isLoaded()).toBeTrue();
    });
  });

  describe('load() with empty key', () => {
    it('skips setOptions and importLibrary but still sets isLoaded true', async () => {
      const loadPromise = service.load();
      httpMock.expectOne(MAPS_KEY_URL).flush({ mapsApiKey: '' });
      await loadPromise;

      expect(setOptionsSpy).not.toHaveBeenCalled();
      expect(importLibrarySpy).not.toHaveBeenCalled();
      expect(service.isLoaded()).toBeTrue();
    });
  });

  describe('load() on HTTP error', () => {
    it('keeps isLoaded false on network error', async () => {
      const loadPromise = service.load();
      httpMock.expectOne(MAPS_KEY_URL).error(new ErrorEvent('network'));
      await loadPromise;

      expect(service.isLoaded()).toBeFalse();
    });
  });
});
