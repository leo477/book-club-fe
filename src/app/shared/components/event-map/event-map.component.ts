import {
  Component, ChangeDetectionStrategy, input, signal, computed, inject, effect,
} from '@angular/core';
import { GoogleMap, MapAdvancedMarker, MapPolyline } from '@angular/google-maps';
import { TranslateModule } from '@ngx-translate/core';
import { of, switchMap, catchError, take } from 'rxjs';
import { AfterMeetingVenue } from '../../../core/models/event.model';
import { MapsConfigService } from '../../../core/services/maps-config.service';
import { GeocodingService } from '../../../core/services/geocoding.service';
import { RoutingService } from '../../../core/services/routing.service';

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
  private readonly routing = inject(RoutingService);
  private readonly nativeMap = signal<google.maps.Map | null>(null);

  readonly isReady = computed(() => this.maps.isLoaded() && this.lat() != null && this.lng() != null);
  readonly center = computed<google.maps.LatLngLiteral>(() => ({ lat: this.lat() ?? 0, lng: this.lng() ?? 0 }));
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
  private readonly routePath = signal<google.maps.LatLngLiteral[] | null>(null);
  readonly polylinePath = this.routePath.asReadonly();
  readonly polylineOptions: google.maps.PolylineOptions = {
    strokeColor: '#4f46e5', strokeWeight: 4, strokeOpacity: 0.8,
  };

  onMapReady(map: google.maps.Map): void {
    this.nativeMap.set(map);
  }

  constructor() {
    effect(onCleanup => {
      const venue = this.afterMeetingVenue();
      if (venue?.lat != null && venue?.lng != null) {
        this.resolvedAfterVenuePos.set({ lat: venue.lat, lng: venue.lng });
        return;
      }
      if (!venue?.address || !this.isReady()) {
        this.resolvedAfterVenuePos.set(null);
        return;
      }
      const sub = this.geocoding.autocomplete$(venue.address, undefined, 1).pipe(
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
      onCleanup(() => sub.unsubscribe());
    });

    effect(onCleanup => {
      const origin = this.center();
      const afterPos = this.resolvedAfterVenuePos();
      if (!this.isReady() || !afterPos) {
        this.routePath.set(null);
        return;
      }
      const sub = this.routing.walkingRoute$(origin, afterPos).pipe(take(1)).subscribe(path => {
        this.routePath.set(path.length > 1 ? path : [origin, afterPos]);
      });
      onCleanup(() => sub.unsubscribe());
    });

    // Build a real walking route between the two points; fall back to a
    // straight line if directions are unavailable (e.g. ZERO_RESULTS).
    effect(() => {
      const origin = this.center();
      const afterPos = this.resolvedAfterVenuePos();
      if (!this.isReady() || !afterPos) {
        this.routePath.set(null);
        this.routeBounds.set(null);
        return;
      }
      new google.maps.DirectionsService()
        .route({ origin, destination: afterPos, travelMode: google.maps.TravelMode.WALKING })
        .then(result => {
          const route = result.routes[0];
          this.routePath.set(route.overview_path.map(p => p.toJSON()));
          this.routeBounds.set(route.bounds?.toJSON() ?? null);
        })
        .catch(() => {
          this.routePath.set([origin, afterPos]);
          this.routeBounds.set(null);
        });
    });

    effect(() => {
      const map = this.nativeMap();
      const afterPos = this.resolvedAfterVenuePos();
      if (!map || !afterPos) return;
      const path = this.polylinePath();
      const bounds = new google.maps.LatLngBounds();
      if (path && path.length > 0) {
        for (const point of path) bounds.extend(point);
      } else {
        bounds.extend(this.center());
        bounds.extend(afterPos);
      }
      map.fitBounds(bounds, 60);
    });
  }
}
