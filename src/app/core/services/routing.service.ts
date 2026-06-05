import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RoutingService {
  private readonly http = inject(HttpClient);

  walkingRoute$(origin: google.maps.LatLngLiteral, dest: google.maps.LatLngLiteral): Observable<google.maps.LatLngLiteral[]> {
    return this.http.get<{ path: google.maps.LatLngLiteral[] }>(`${environment.apiUrl}/routes/walking`, {
      params: {
        origin_lat: String(origin.lat),
        origin_lng: String(origin.lng),
        dest_lat: String(dest.lat),
        dest_lng: String(dest.lng),
      },
    }).pipe(map(r => Array.isArray(r?.path) ? r.path : []));
  }
}
