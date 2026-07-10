import { Injectable, InjectionToken, inject, signal } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import { SKIP_AUTH_REDIRECT, SUPPRESS_ERROR_TOAST } from '../interceptors/auth.interceptor';
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
  private readonly _loaded = signal(false);
  private readonly _mapId = signal('');
  readonly isLoaded = this._loaded.asReadonly();
  readonly mapId = this._mapId.asReadonly();
  private _loadPromise: Promise<void> | null = null;

  load(): Promise<void> {
    this._loadPromise ??= this.doLoad();
    return this._loadPromise;
  }

  ensureLoaded(): Promise<void> {
    return this._loaded() ? Promise.resolve() : this.load();
  }

  private async doLoad(): Promise<void> {
    try {
      const { mapsApiKey, mapsMapId } = await firstValueFrom(
        this.http.get<{ mapsApiKey: string; mapsMapId: string }>(`${environment.apiUrl}/config/maps-key`, {
          context: new HttpContext()
            .set(SKIP_AUTH_REDIRECT, true)
            .set(SUPPRESS_ERROR_TOAST, true),
        }),
      );
      if (mapsApiKey) {
        this.loader.setOptions({ key: mapsApiKey, v: 'weekly', libraries: ['maps', 'marker'] });
        await this.loader.importLibrary('maps');
        await this.loader.importLibrary('marker');
        this._mapId.set(mapsMapId ?? '');
        this._loaded.set(true);
      }
    } catch {
      // silent fail — app works without map
    }
  }
}
