import {
  Component, ChangeDetectionStrategy, input, signal, computed, inject, effect,
} from '@angular/core';
import { GoogleMap, MapAdvancedMarker, MapPolyline } from '@angular/google-maps';
import { TranslateModule } from '@ngx-translate/core';
import { of, switchMap, catchError, take } from 'rxjs';
import { AfterMeetingVenue } from '../../../core/models/event.model';
import { MapsConfigService } from '../../../core/services/maps-config.service';
import { GeocodingService } from '../../../core/services/geocoding.service';

@Component({
  selector: 'app-event-map',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [GoogleMap, MapAdvancedMarker, MapPolyline, TranslateModule],
  templateUrl: './event-map.component.html',
})
export class EventMapComponent {
  readonly lat = input.required<number | null>();
  readonly lng = input.required<number | null>();
  readonly address = input<string | null>(null);
  readonly afterMeetingVenue = input<AfterMeetingVenue | null>(null);

  private readonly maps = inject(MapsConfigService);
  private readonly geocoding = inject(GeocodingService);
  private readonly nativeMap = signal<google.maps.Map | null>(null);

  readonly isReady = computed(() => this.maps.isLoaded() && this.lat() != null && this.lng() != null);
  readonly center = computed<google.maps.LatLngLiteral>(() => ({ lat: this.lat() ?? 0, lng: this.lng() ?? 0 }));
  readonly afterVenuePos = computed<google.maps.LatLngLiteral | null>(() => {
    const v = this.afterMeetingVenue();
    return v?.lat != null && v?.lng != null ? { lat: v.lat, lng: v.lng } : null;
  });
  readonly mapsUrl = computed(() => `https://www.google.com/maps?q=${this.lat()},${this.lng()}`);
  readonly mapOptions = computed<google.maps.MapOptions>(() => {
    const mapId = this.maps.mapId();
    return {
      clickableIcons: false,
      gestureHandling: 'cooperative',
      ...(mapId ? { mapId } : {}),
    };
  });
  readonly resolvedAfterVenuePos = signal<google.maps.LatLngLiteral | null>(null);
  readonly polylinePath = computed<google.maps.LatLngLiteral[] | null>(() => {
    const after = this.resolvedAfterVenuePos();
    return after ? [this.center(), after] : null;
  });
  readonly polylineOptions: google.maps.PolylineOptions = {
    strokeColor: '#4f46e5', strokeWeight: 3, strokeOpacity: 0.7, geodesic: true,
  };

  onMapReady(map: google.maps.Map): void {
    this.nativeMap.set(map);
  }

  constructor() {
    effect(() => {
      const venue = this.afterMeetingVenue();
      if (venue?.lat != null && venue?.lng != null) {
        this.resolvedAfterVenuePos.set({ lat: venue.lat, lng: venue.lng });
        return;
      }
      if (!venue?.address || !this.isReady()) {
        this.resolvedAfterVenuePos.set(null);
        return;
      }
      this.geocoding.autocomplete$(venue.address, undefined, 1).pipe(
        take(1),
        switchMap(suggestions => {
          const s = suggestions[0];
          if (!s) return of(null);
          if (s.lat != null && s.lng != null) return of(s);
          if (s.place_id) return this.geocoding.getPlaceDetails(s.place_id).pipe(catchError(() => of(s)));
          return of(s);
        }),
      ).subscribe(s => {
        this.resolvedAfterVenuePos.set(
          s?.lat != null && s?.lng != null ? { lat: s.lat, lng: s.lng } : null,
        );
      });
    });

    effect(() => {
      const map = this.nativeMap();
      const afterPos = this.resolvedAfterVenuePos();
      if (!map || !afterPos) return;
      const bounds = new google.maps.LatLngBounds();
      bounds.extend(this.center());
      bounds.extend(afterPos);
      map.fitBounds(bounds, 60);
    });
  }
}
