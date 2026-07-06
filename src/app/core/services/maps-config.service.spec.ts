import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { MapsConfigService, MAPS_LOADER_FNS, MapsLoaderFns } from './maps-config.service';
import { environment } from '../../../environments/environment';

const MAPS_KEY_URL = `${environment.apiUrl}/config/maps-key`;

describe('MapsConfigService', () => {
  let service: MapsConfigService;
  let httpMock: HttpTestingController;
  let setOptionsSpy: ReturnType<typeof vi.fn>;
  let importLibrarySpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    setOptionsSpy = vi.fn();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    importLibrarySpy = vi.fn().mockResolvedValue({} as any);

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        MapsConfigService,
        { provide: MAPS_LOADER_FNS, useValue: { setOptions: setOptionsSpy, importLibrary: importLibrarySpy } },
      ],
    });
    service = TestBed.inject(MapsConfigService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  describe('load() with valid key', () => {
    it('calls setOptions and importLibrary for maps and marker, sets isLoaded and mapId', async () => {
      const loadPromise = service.load();
      httpMock.expectOne(MAPS_KEY_URL).flush({ mapsApiKey: 'key123', mapsMapId: 'mapid123' });
      await loadPromise;

      expect(setOptionsSpy).toHaveBeenCalledWith({ key: 'key123', v: 'weekly', libraries: ['maps', 'marker'] });
      expect(importLibrarySpy).toHaveBeenCalledWith('maps');
      expect(importLibrarySpy).toHaveBeenCalledWith('marker');
      expect(importLibrarySpy).not.toHaveBeenCalledWith('routes');
      expect(service.isLoaded()).toBe(true);
      expect(service.mapId()).toBe('mapid123');
    });
  });

  describe('load() with empty key', () => {
    it('skips setOptions and importLibrary and keeps isLoaded false', async () => {
      const loadPromise = service.load();
      httpMock.expectOne(MAPS_KEY_URL).flush({ mapsApiKey: '' });
      await loadPromise;

      expect(setOptionsSpy).not.toHaveBeenCalled();
      expect(importLibrarySpy).not.toHaveBeenCalled();
      expect(service.isLoaded()).toBe(false);
    });
  });

  describe('load() on HTTP error', () => {
    it('keeps isLoaded false on network error', async () => {
      const loadPromise = service.load();
      httpMock.expectOne(MAPS_KEY_URL).error(new ErrorEvent('network'));
      await loadPromise;

      expect(service.isLoaded()).toBe(false);
    });
  });

  describe('load() memoization', () => {
    it('reuses the in-flight promise and issues only one HTTP request', async () => {
      const first = service.load();
      const second = service.load();

      httpMock.expectOne(MAPS_KEY_URL).flush({ mapsApiKey: 'key123', mapsMapId: 'mapid123' });
      await Promise.all([first, second]);

      expect(setOptionsSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('ensureLoaded()', () => {
    it('resolves immediately without an HTTP call when already loaded', async () => {
      const loadPromise = service.load();
      httpMock.expectOne(MAPS_KEY_URL).flush({ mapsApiKey: 'key123', mapsMapId: 'mapid123' });
      await loadPromise;

      await service.ensureLoaded();

      httpMock.verify();
    });

    it('triggers load() when not yet loaded and resolves once it completes', async () => {
      const ensurePromise = service.ensureLoaded();
      httpMock.expectOne(MAPS_KEY_URL).flush({ mapsApiKey: 'key123', mapsMapId: 'mapid123' });
      await ensurePromise;

      expect(service.isLoaded()).toBe(true);
    });

    it('memoizes concurrent calls into a single HTTP request', async () => {
      const first = service.ensureLoaded();
      const second = service.ensureLoaded();

      httpMock.expectOne(MAPS_KEY_URL).flush({ mapsApiKey: 'key123', mapsMapId: 'mapid123' });
      await Promise.all([first, second]);

      expect(setOptionsSpy).toHaveBeenCalledTimes(1);
    });
  });
});

describe('MAPS_LOADER_FNS factory', () => {
  it('provides real setOptions and importLibrary functions from @googlemaps/js-api-loader', () => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    const loaderFns = TestBed.inject<MapsLoaderFns>(MAPS_LOADER_FNS);
    expect(typeof loaderFns.setOptions).toBe('function');
    expect(typeof loaderFns.importLibrary).toBe('function');
  });
});
