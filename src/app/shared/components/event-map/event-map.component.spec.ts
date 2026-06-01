import { TestBed } from '@angular/core/testing';
import { Component, Input, provideZonelessChangeDetection, signal } from '@angular/core';
import { GoogleMap, MapMarker, MapDirectionsRenderer, MapDirectionsService } from '@angular/google-maps';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { EventMapComponent } from './event-map.component';
import { MapsConfigService } from '../../../core/services/maps-config.service';
import { AfterMeetingVenue } from '../../../core/models/event.model';

(globalThis as Record<string, unknown>)['google'] = {
  maps: { TravelMode: { WALKING: 'WALKING' } },
};

// eslint-disable-next-line @angular-eslint/component-selector
@Component({ selector: 'google-map', template: '', standalone: true })
class StubGoogleMap {}

// eslint-disable-next-line @angular-eslint/component-selector
@Component({ selector: 'map-marker', template: '', standalone: true })
class StubMapMarker {}

// eslint-disable-next-line @angular-eslint/component-selector
@Component({ selector: 'map-directions-renderer', template: '', standalone: true })
class StubMapDirectionsRenderer {
  @Input() directions: unknown;
}

class FakeMapsConfigService {
  private _loaded = signal(false);
  readonly isLoaded = this._loaded.asReadonly();
  setLoaded(v: boolean) { this._loaded.set(v); }
}

interface MockDirectionsResult {
  mockResult: boolean;
}

function setup(opts: { lat?: number | null; lng?: number | null; loaded?: boolean; afterVenue?: AfterMeetingVenue | null } = {}) {
  const fakeMaps = new FakeMapsConfigService();
  const dirSpy = jasmine.createSpyObj<MapDirectionsService>('MapDirectionsService', ['route']);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dirSpy.route.and.returnValue(of({ status: 'OK', result: { mockResult: true } } as any));

  TestBed.configureTestingModule({
    imports: [EventMapComponent, TranslateModule.forRoot()],
    providers: [
      provideZonelessChangeDetection(),
      { provide: MapsConfigService, useValue: fakeMaps },
      { provide: MapDirectionsService, useValue: dirSpy },
    ],
  });
  TestBed.overrideComponent(EventMapComponent, {
    remove: { imports: [GoogleMap, MapMarker, MapDirectionsRenderer] },
    add: { imports: [StubGoogleMap, StubMapMarker, StubMapDirectionsRenderer] },
  });

  const fixture = TestBed.createComponent(EventMapComponent);
  fixture.componentRef.setInput('lat', opts.lat !== undefined ? opts.lat : 50.45);
  fixture.componentRef.setInput('lng', opts.lng !== undefined ? opts.lng : 30.52);
  if (opts.afterVenue !== undefined) fixture.componentRef.setInput('afterMeetingVenue', opts.afterVenue);
  if (opts.loaded !== false) fakeMaps.setLoaded(true);
  fixture.detectChanges();
  return { fixture, component: fixture.componentInstance, fakeMaps, dirSpy };
}

describe('EventMapComponent', () => {

  describe('isReady()', () => {
    it('is false when maps not loaded', () => {
      const { component } = setup({ loaded: false });
      expect(component.isReady()).toBeFalse();
    });

    it('is false when lat is null', () => {
      const { component } = setup({ lat: null });
      expect(component.isReady()).toBeFalse();
    });

    it('is false when lng is null', () => {
      const { component } = setup({ lng: null });
      expect(component.isReady()).toBeFalse();
    });

    it('is true when maps loaded and lat/lng are valid', () => {
      const { component } = setup();
      expect(component.isReady()).toBeTrue();
    });
  });

  describe('center()', () => {
    it('returns { lat, lng } from inputs', () => {
      const { component } = setup({ lat: 50.45, lng: 30.52 });
      expect(component.center()).toEqual({ lat: 50.45, lng: 30.52 });
    });

    it('returns { lat: 0, lng: 0 } when both inputs are null', () => {
      const { component } = setup({ lat: null, lng: null });
      expect(component.center()).toEqual({ lat: 0, lng: 0 });
    });
  });

  describe('afterVenuePos()', () => {
    it('is null when no afterMeetingVenue input', () => {
      const { component } = setup();
      expect(component.afterVenuePos()).toBeNull();
    });

    it('is null when venue has no lat/lng', () => {
      const venue: AfterMeetingVenue = { name: 'Cafe', address: 'Street 1' };
      const { component } = setup({ afterVenue: venue });
      expect(component.afterVenuePos()).toBeNull();
    });

    it('returns { lat, lng } when venue has coords', () => {
      const venue: AfterMeetingVenue = { name: 'Cafe', address: 'Street 1', lat: 50.1, lng: 30.2 };
      const { component } = setup({ afterVenue: venue });
      expect(component.afterVenuePos()).toEqual({ lat: 50.1, lng: 30.2 });
    });
  });

  describe('mapsUrl()', () => {
    it('returns correct Google Maps URL', () => {
      const { component } = setup({ lat: 50.45, lng: 30.52 });
      expect(component.mapsUrl()).toBe('https://www.google.com/maps?q=50.45,30.52');
    });
  });

  describe('mapOptions()', () => {
    it('returns non-clickable icons with cooperative gesture handling', () => {
      const { component } = setup();
      expect(component.mapOptions()).toEqual({ clickableIcons: false, gestureHandling: 'cooperative' });
    });
  });

  describe('directions effect', () => {
    it('directions is undefined when not ready', () => {
      const { component } = setup({ loaded: false });
      expect(component.directions()).toBeUndefined();
    });

    it('directions is undefined when no afterVenuePos', () => {
      const { component } = setup();
      expect(component.directions()).toBeUndefined();
    });

    it('calls directionsService.route when ready and afterVenuePos is set', () => {
      const venue: AfterMeetingVenue = { name: 'Cafe', address: 'Street 1', lat: 49.0, lng: 32.0 };
      const { dirSpy } = setup({ afterVenue: venue });
      expect(dirSpy.route).toHaveBeenCalled();
    });

    it('sets directions on OK response', () => {
      const venue: AfterMeetingVenue = { name: 'Cafe', address: 'Street 1', lat: 49.0, lng: 32.0 };
      const { component } = setup({ afterVenue: venue });
      const result = component.directions() as MockDirectionsResult | undefined;
      expect(result?.mockResult).toBeTrue();
    });

    it('directions stays undefined on non-OK response', () => {
      const fakeMaps = new FakeMapsConfigService();
      const dirSpy = jasmine.createSpyObj<MapDirectionsService>('MapDirectionsService', ['route']);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      dirSpy.route.and.returnValue(of({ status: 'NOT_FOUND', result: null } as any));

      TestBed.configureTestingModule({
        imports: [EventMapComponent, TranslateModule.forRoot()],
        providers: [
          provideZonelessChangeDetection(),
          { provide: MapsConfigService, useValue: fakeMaps },
          { provide: MapDirectionsService, useValue: dirSpy },
        ],
      });
      TestBed.overrideComponent(EventMapComponent, {
        remove: { imports: [GoogleMap, MapMarker, MapDirectionsRenderer] },
        add: { imports: [StubGoogleMap, StubMapMarker, StubMapDirectionsRenderer] },
      });

      const fixture = TestBed.createComponent(EventMapComponent);
      fixture.componentRef.setInput('lat', 50.45);
      fixture.componentRef.setInput('lng', 30.52);
      const venue: AfterMeetingVenue = { name: 'Cafe', address: 'Street 1', lat: 49.0, lng: 32.0 };
      fixture.componentRef.setInput('afterMeetingVenue', venue);
      fakeMaps.setLoaded(true);
      fixture.detectChanges();

      expect(fixture.componentInstance.directions()).toBeUndefined();
    });
  });
});
