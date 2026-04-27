import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface GeocodeSuggestion {
  label: string;
  city: string | null;
  country: string | null;
  lat: number;
  lng: number;
}

@Injectable({ providedIn: 'root' })
export class GeocodingService {
  private readonly http = inject(HttpClient);

  autocomplete$(q: string, lang = 'uk', limit = 5): Observable<GeocodeSuggestion[]> {
    return this.http.get<GeocodeSuggestion[]>(`${environment.apiUrl}/geocode/autocomplete`, {
      params: { q, lang, limit: String(limit) },
    });
  }
}
