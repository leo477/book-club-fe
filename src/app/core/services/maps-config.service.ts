import { Injectable, InjectionToken, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import { environment } from '../../../environments/environment';

export interface MapsLoaderFns {
  setOptions: typeof setOptions;
  importLibrary: typeof importLibrary;
}

export const MAPS_LOADER_FNS = new InjectionToken<MapsLoaderFns>('MAPS_LOADER_FNS', {
  providedIn: 'root',
  factory: () => ({ setOptions, importLibrary }),
});

@Injectable({ providedIn: 'root' })
export class MapsConfigService {
  private readonly http = inject(HttpClient);
  private readonly loader = inject(MAPS_LOADER_FNS);
  private _loaded = signal(false);
  readonly isLoaded = this._loaded.asReadonly();

  async load(): Promise<void> {
    try {
      const { mapsApiKey } = await firstValueFrom(
        this.http.get<{ mapsApiKey: string }>(`${environment.apiUrl}/config/maps-key`),
      );
      if (mapsApiKey) {
        this.loader.setOptions({ key: mapsApiKey, v: 'weekly', libraries: ['maps', 'routes'] });
        await this.loader.importLibrary('maps');
        await this.loader.importLibrary('routes');
      }
      this._loaded.set(true);
    } catch {
      // silent fail — app works without map
    }
  }
}
