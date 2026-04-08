import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
  AfterViewInit,
  ElementRef,
  ViewChild,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import type { Map as LeafletMap, Marker } from 'leaflet';
import { Club } from '../../../core/models/club.model';

@Component({
  selector: 'app-map',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      #mapContainer
      class="w-full rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700"
      style="height: 320px;"
      aria-label="Map of book club locations"
      role="img"
    ></div>
  `,
})
export class MapComponent implements AfterViewInit, OnDestroy, OnChanges {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef<HTMLDivElement>;

  @Input() clubs: Club[] = [];
  @Input() activeCity: string | null = null;

  @Output() citySelected = new EventEmitter<string>();

  private map: LeafletMap | null = null;
  private markers: Marker[] = [];

  async ngAfterViewInit(): Promise<void> {
    const L = await import('leaflet');

    // Fix default icon paths broken by webpack
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    this.map = L.map(this.mapContainer.nativeElement, { zoomControl: true }).setView(
      [49.5, 31.0],
      6,
    );

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(this.map);

    this.renderMarkers(L);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['clubs'] || changes['activeCity']) && this.map) {
      import('leaflet').then(L => this.renderMarkers(L));
    }
  }

  ngOnDestroy(): void {
    this.map?.remove();
    this.map = null;
  }

  private renderMarkers(L: typeof import('leaflet')): void {
    if (!this.map) return;

    // Remove old markers
    this.markers.forEach(m => m.remove());
    this.markers = [];

    // Group clubs by city and pick first valid lat/lng
    const cityMap = new Map<string, { lat: number; lng: number; count: number }>();
    for (const club of this.clubs) {
      if (club.lat == null || club.lng == null || !club.city) continue;
      if (!cityMap.has(club.city)) {
        cityMap.set(club.city, { lat: club.lat, lng: club.lng, count: 0 });
      }
      cityMap.get(club.city)!.count++;
    }

    cityMap.forEach(({ lat, lng, count }, city) => {
      const isActive = this.activeCity === city;
      const icon = L.divIcon({
        className: '',
        html: `<div style="
          background: ${isActive ? '#7c3aed' : '#2563eb'};
          color: white;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          width: 36px; height: 36px;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 700;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          border: 2px solid white;
        "><span style="transform: rotate(45deg)">${count}</span></div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
      });

      const marker = L.marker([lat, lng], { icon })
        .addTo(this.map!)
        .bindPopup(`<strong>${city}</strong><br>${count} club${count > 1 ? 's' : ''}`)
        .on('click', () => this.citySelected.emit(city));

      this.markers.push(marker);
    });
  }
}
