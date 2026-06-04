import { TestBed } from '@angular/core/testing';
import { Component, Input, provideZonelessChangeDetection, signal } from '@angular/core';
import { GoogleMap, MapAdvancedMarker, MapPolyline } from '@angular/google-maps';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { EventMapComponent } from './event-map.component';
import { MapsConfigService } from '../../../core/services/maps-config.service';
import { GeocodingService } from '../../../core/services/geocoding.service';
import { AfterMeetingVenue } from '../../../core/models/event.model';

const ROUTE_PATH = [
  { lat: 50.45, lng: 30.52 },
  { lat: 49.7, lng: 31.2 },
  { lat: 49.0, lng: 32.0 },
];

(globalThis as Record<string, unknown>)['google'] = {
  maps: {
    TravelMode: { WALKING: 'WALKING' },
    LatLngBounds: class { extend() { return this; } },
    DirectionsService: class {
      route() {
        return Promise.resolve({
          routes: [{
            overview_path: ROUTE_PATH.map(p => ({ toJSON: () => p })),
            bounds: { toJSON: () => ({ east: 32.0, north: 50.45, south: 49.0, west: 30.52 }) },
          }],
        });
      }
    },
  },
};

// eslint-disable-next-line @angular-eslint/component-selector
@Component({ selector: 'google-map', template: '', standalone: true })
class StubGoogleMap {
  @Input() center: unknown;
  @Input() zoom: unknown;
  @Input() options: unknown;
}

// eslint-disable-next-line @angular-eslint/component-selector
@Component({ selector: 'map-advanced-marker', template: '', standalone: true })
class StubMapAdvancedMarker {
  @Input() position: unknown;
  @Input() title: unknown;
}

// eslint-disable-next-line @angular-eslint/component-selector
@Component({ selector: 'map-polyline', template: '', standalone: true })
class StubMapPolyline {
  @Input() path: unknown;
  @Input() options: unknown;
}

class FakeMapsConfigService {
  private _loaded = signal(false);
  private _mapId = signal('');
  readonly isLoaded = this._loaded.asReadonly();
  readonly mapId = this._mapId.asReadonly();
  setLoaded(v: boolean) { this._loaded.set(v); }
  setMapId(v: string) { this._mapId.set(v); }
}

class FakeGeocodingService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  autocomplete$ = vi.fn().mockReturnValue(of([]));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getPlaceDetails = vi.fn().mockReturnValue(of(null));
  resetSessionToken = vi.fn();
}

function setup(opts: {
  lat?: number | null;
  lng?: number | null;
  loaded?: boolean;
  afterVenue?: AfterMeetingVenue | null;
  geocodingStub?: Partial<FakeGeocodingService>;
} = {}) {
  const fakeMaps = new FakeMapsConfigService();
  const fakeGeocoding = Object.assign(new FakeGeocodingService(), opts.geocodingStub ?? {});

  TestBed.configureTestingModule({
    imports: [EventMapComponent, TranslateModule.forRoot()],
    providers: [
      provideZonelessChangeDetection(),
      { provide: MapsConfigService, useValue: fakeMaps },
      { provide: GeocodingService, useValue: fakeGeocoding },
    ],
  });
  TestBed.overrideComponent(EventMapComponent, {
    remove: { imports: [GoogleMap, MapAdvancedMarker, MapPolyline] },
    add: { imports: [StubGoogleMap, StubMapAdvancedMarker, StubMapPolyline] },
  });

  const fixture = TestBed.createComponent(EventMapComponent);
  fixture.componentRef.setInput('lat', opts.lat !== undefined ? opts.lat : 50.45);
  fixture.componentRef.setInput('lng', opts.lng !== undefined ? opts.lng : 30.52);
  if (opts.afterVenue !== undefined) fixture.componentRef.setInput('afterMeetingVenue', opts.afterVenue);
  if (opts.loaded !== false) fakeMaps.setLoaded(true);
  fixture.detectChanges();
  return { fixture, component: fixture.componentInstance, fakeMaps, fakeGeocoding };
}

describe('EventMapComponent', () => {

  describe('isReady()', () => {
    it('is false when maps not loaded', () => {
      const { component } = setup({ loaded: false });
      expect(component.isReady()).toBe(false);
    });

    it('is false when lat is null', () => {
      const { component } = setup({ lat: null });
      expect(component.isReady()).toBe(false);
    });

    it('is false when lng is null', () => {
      const { component } = setup({ lng: null });
      expect(component.isReady()).toBe(false);
    });

    it('is false when lat is provided but lng is null', () => {
      const { component } = setup({ lat: 50.45, lng: null });
      expect(component.isReady()).toBe(false);
    });

    it('is true when maps loaded and lat/lng are valid', () => {
      const { component } = setup();
      expect(component.isReady()).toBe(true);
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

    it('is null when venue has lat but no lng', () => {
      const venue: AfterMeetingVenue = { name: 'Cafe', address: 'Street 1', lat: 50.1 };
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
    it('returns non-clickable icons, cooperative gesture handling and a mapId', () => {
      const { component, fakeMaps } = setup();
      fakeMaps.setMapId('test-map-id');
      expect(component.mapOptions()).toEqual({ clickableIcons: false, gestureHandling: 'cooperative', mapId: 'test-map-id' });
    });

    it('omits mapId when empty (no DEMO_MAP_ID fallback)', () => {
      const { component } = setup();
      expect(component.mapOptions()).toEqual({ clickableIcons: false, gestureHandling: 'cooperative' });
    });
  });

  describe('resolvedAfterVenuePos()', () => {
    it('is null when no afterMeetingVenue', () => {
      const { component } = setup();
      expect(component.resolvedAfterVenuePos()).toBeNull();
    });

    it('uses direct coords when venue has lat/lng', () => {
      const venue: AfterMeetingVenue = { name: 'Cafe', address: 'Street 1', lat: 50.1, lng: 30.2 };
      const { component } = setup({ afterVenue: venue });
      expect(component.resolvedAfterVenuePos()).toEqual({ lat: 50.1, lng: 30.2 });
    });

    it('geocodes address when venue has no lat/lng and maps is ready', () => {
      const venue: AfterMeetingVenue = { name: 'Cafe', address: 'Street 1' };
      const { component } = setup({
        afterVenue: venue,
        geocodingStub: {
          autocomplete$: vi.fn().mockReturnValue(of([{ label: 'Street 1', city: null, country: null, lat: 49.5, lng: 31.1 }])),
        },
      });
      expect(component.resolvedAfterVenuePos()).toEqual({ lat: 49.5, lng: 31.1 });
    });

    it('resolves via getPlaceDetails when autocomplete returns only place_id', () => {
      const venue: AfterMeetingVenue = { name: 'Cafe', address: 'Street 1' };
      const { component } = setup({
        afterVenue: venue,
        geocodingStub: {
          autocomplete$: vi.fn().mockReturnValue(of([{ label: 'Street 1', city: null, country: null, lat: null, lng: null, place_id: 'abc' }])),
          getPlaceDetails: vi.fn().mockReturnValue(of({ label: 'Street 1', city: null, country: null, lat: 49.5, lng: 31.1 })),
        },
      });
      expect(component.resolvedAfterVenuePos()).toEqual({ lat: 49.5, lng: 31.1 });
    });

    it('is null when maps not ready even if address is set', () => {
      const venue: AfterMeetingVenue = { name: 'Cafe', address: 'Street 1' };
      const { component } = setup({ loaded: false, afterVenue: venue });
      expect(component.resolvedAfterVenuePos()).toBeNull();
    });

    it('is null when autocomplete returns empty', () => {
      const venue: AfterMeetingVenue = { name: 'Cafe', address: 'Street 1' };
      const { component } = setup({ afterVenue: venue });
      expect(component.resolvedAfterVenuePos()).toBeNull();
    });
  });

  describe('polylinePath()', () => {
    it('returns null when no afterMeetingVenue', () => {
      const { component } = setup();
      expect(component.polylinePath()).toBeNull();
    });

    it('builds a walking route between the two points when venue has coords', async () => {
      const venue: AfterMeetingVenue = { name: 'Cafe', address: 'Street 1', lat: 49.0, lng: 32.0 };
      const { component } = setup({ afterVenue: venue });
      await Promise.resolve();
      await Promise.resolve();
      expect(component.polylinePath()).toEqual(ROUTE_PATH);
    });
  });
});
