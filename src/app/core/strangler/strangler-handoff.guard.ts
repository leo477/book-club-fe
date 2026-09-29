import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { StranglerManifestService } from './strangler-manifest.service';

const WINDOW_MS = 60_000;

function recentlyHandedOff(key: string): boolean {
  try {
    const last = Number(sessionStorage.getItem(key));
    if (last && Date.now() - last < WINDOW_MS) return true;
    sessionStorage.setItem(key, String(Date.now()));
    return false;
  } catch {
    return true;
  }
}

// eslint-disable-next-line rxjs-x/finnish
export const stranglerHandoffGuard: CanMatchFn = () => {
  const manifest = inject(StranglerManifestService);
  const router = inject(Router);
  const target = router.currentNavigation()?.extractedUrl;
  if (!target) return true;

  const url = router.serializeUrl(target);
  const pathname = url.split(/[?#]/)[0];
  if (!manifest.isEnabled(pathname) || recentlyHandedOff(`strangler:handoff:${pathname}`)) return true;

  globalThis.location.assign(url);
  // never settle so the router does not render NotFound while the page unloads
  return new Promise<boolean>(() => undefined);
};
