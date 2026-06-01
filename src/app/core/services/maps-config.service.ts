import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MapsConfigService {
  private readonly http = inject(HttpClient);
  private _loaded = signal(false);
  readonly isLoaded = this._loaded.asReadonly();

  async load(): Promise<void> {
    try {
      const { mapsApiKey } = await firstValueFrom(
        this.http.get<{ mapsApiKey: string }>(`${environment.apiUrl}/config/maps-key`),
      );
      if (mapsApiKey) {
        setOptions({ key: mapsApiKey, v: 'weekly', libraries: ['maps', 'routes'] });
        await importLibrary('maps');
        await importLibrary('routes');
      }
      this._loaded.set(true);
    } catch {
      // silent fail — app works without map
    }
  }
}
