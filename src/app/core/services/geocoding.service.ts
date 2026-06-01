import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface GeocodeSuggestion {
  label: string;
  city: string | null;
  country: string | null;
  lat: number | null;
  lng: number | null;
  place_id?: string;
}

@Injectable({ providedIn: 'root' })
export class GeocodingService {
  private readonly http = inject(HttpClient);
  private _sessionToken = signal(crypto.randomUUID());

  resetSessionToken(): void {
    this._sessionToken.set(crypto.randomUUID());
  }

  autocomplete$(q: string, lang = 'uk', limit = 5): Observable<GeocodeSuggestion[]> {
    return this.http.get<GeocodeSuggestion[]>(`${environment.apiUrl}/geocode/autocomplete`, {
      params: { q, lang, limit: String(limit), session_token: this._sessionToken() },
    });
  }

  getPlaceDetails(placeId: string): Observable<GeocodeSuggestion> {
    return this.http.get<GeocodeSuggestion>(`${environment.apiUrl}/geocode/place-details`, {
      params: { place_id: placeId, session_token: this._sessionToken() },
    }).pipe(tap(() => this.resetSessionToken()));
  }
}
