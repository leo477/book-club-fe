import { Injectable } from '@angular/core';

export interface StranglerRoute {
  pattern: string;
  enabled: boolean;
}

const UUID = '[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}';
const TIMEOUT_MS = 1000;

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function compile(pattern: string): RegExp {
  const body = pattern
    .split('/')
    .filter(Boolean)
    .map((segment) => (segment === ':id' ? UUID : segment.startsWith(':') ? '[^/]+' : escapeRe(segment)))
    .join('/');
  return new RegExp(`^/${body}/?$`);
}

@Injectable({ providedIn: 'root' })
export class StranglerManifestService {
  private matchers: RegExp[] = [];
  private loadPromise: Promise<void> | null = null;

  load(): Promise<void> {
    this.loadPromise ??= this.doLoad();
    return this.loadPromise;
  }

  isEnabled(pathname: string): boolean {
    return this.matchers.some((m) => m.test(pathname));
  }

  private async doLoad(): Promise<void> {
    try {
      const res = await fetch('/strangler.json', {
        credentials: 'same-origin',
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (!res.ok) return;
      const body = (await res.json()) as { routes?: StranglerRoute[] };
      if (!Array.isArray(body?.routes)) return;
      this.matchers = body.routes
        .filter((r) => r?.enabled === true && typeof r.pattern === 'string')
        .map((r) => compile(r.pattern));
    } catch {
      this.matchers = [];
    }
  }
}
