import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import * as Loader from '@googlemaps/js-api-loader';
import { MapsConfigService } from './maps-config.service';
import { environment } from '../../../environments/environment';

const MAPS_KEY_URL = `${environment.apiUrl}/config/maps-key`;

describe('MapsConfigService', () => {
  let service: MapsConfigService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [provideZonelessChangeDetection(), MapsConfigService],
    });
    service = TestBed.inject(MapsConfigService);
    httpMock = TestBed.inject(HttpTestingController);
    spyOn(Loader, 'setOptions');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    spyOn(Loader, 'importLibrary').and.resolveTo({} as any);
  });

  afterEach(() => httpMock.verify());

  describe('load() with valid key', () => {
    it('calls setOptions and importLibrary for maps and routes, sets isLoaded true', async () => {
      const loadPromise = service.load();
      httpMock.expectOne(MAPS_KEY_URL).flush({ mapsApiKey: 'key123' });
      await loadPromise;

      expect(Loader.setOptions).toHaveBeenCalledWith({ key: 'key123', v: 'weekly', libraries: ['maps', 'routes'] });
      expect(Loader.importLibrary).toHaveBeenCalledWith('maps');
      expect(Loader.importLibrary).toHaveBeenCalledWith('routes');
      expect(service.isLoaded()).toBeTrue();
    });
  });

  describe('load() with empty key', () => {
    it('skips setOptions and importLibrary but still sets isLoaded true', async () => {
      const loadPromise = service.load();
      httpMock.expectOne(MAPS_KEY_URL).flush({ mapsApiKey: '' });
      await loadPromise;

      expect(Loader.setOptions).not.toHaveBeenCalled();
      expect(Loader.importLibrary).not.toHaveBeenCalled();
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
