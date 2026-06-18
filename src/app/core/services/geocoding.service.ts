import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
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
  private readonly translate = inject(TranslateService);
  private readonly _sessionToken = signal(crypto.randomUUID());

  resetSessionToken(): void {
    this._sessionToken.set(crypto.randomUUID());
  }

  private activeLang(): string {
    return this.translate.currentLang ?? this.translate.defaultLang ?? 'uk';
  }

  autocomplete$(q: string, lang = this.activeLang(), limit = 5): Observable<GeocodeSuggestion[]> {
    return this.http.get<GeocodeSuggestion[]>(`${environment.apiUrl}/geocode/autocomplete`, {
      params: { q, lang, limit: String(limit), session_token: this._sessionToken() },
    });
  }

  getPlaceDetails(placeId: string): Observable<GeocodeSuggestion> {
    return this.http.get<GeocodeSuggestion>(`${environment.apiUrl}/geocode/place-details`, {
      params: { place_id: placeId, session_token: this._sessionToken(), lang: this.activeLang() },
    }).pipe(tap(() => this.resetSessionToken()));
  }
}
