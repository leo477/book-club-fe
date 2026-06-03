import {
  Component, ChangeDetectionStrategy, input, signal, computed, inject, effect,
} from '@angular/core';
import { GoogleMap, MapAdvancedMarker, MapDirectionsRenderer, MapDirectionsService } from '@angular/google-maps';
import { TranslateModule } from '@ngx-translate/core';
import { AfterMeetingVenue } from '../../../core/models/event.model';
import { MapsConfigService } from '../../../core/services/maps-config.service';

@Component({
  selector: 'app-event-map',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [GoogleMap, MapAdvancedMarker, MapDirectionsRenderer, TranslateModule],
  templateUrl: './event-map.component.html',
})
export class EventMapComponent {
  readonly lat = input.required<number | null>();
  readonly lng = input.required<number | null>();
  readonly address = input<string | null>(null);
  readonly afterMeetingVenue = input<AfterMeetingVenue | null>(null);

  private readonly maps = inject(MapsConfigService);
  private readonly directionsService = inject(MapDirectionsService);

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
  readonly directions = signal<google.maps.DirectionsResult | undefined>(undefined);

  constructor() {
    effect(() => {
      const afterVenue = this.afterVenuePos();
      if (!this.isReady() || !afterVenue) {
        this.directions.set(undefined);
        return;
      }
      this.directionsService.route({
        origin: this.center(),
        destination: afterVenue,
        travelMode: google.maps.TravelMode.WALKING,
      }).subscribe(resp => {
        if (resp.status === 'OK' && resp.result) this.directions.set(resp.result);
      });
    });
  }
}
