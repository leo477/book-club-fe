import { Injectable, signal } from '@angular/core';

// Access token lives in memory only (in-memory signal).
// On page reload, it is recovered via silent refresh using the httpOnly refresh cookie.
// See AuthService.init() for the recovery flow.

@Injectable({ providedIn: 'root' })
export class TokenStore {
  // Legacy-migration-only: the refresh token is now carried by an httpOnly
  // cookie set by the backend. These methods persist/read the old
  // localStorage-based refresh token solely so AuthService.init() can
  // complete a one-time silent-refresh migration for browsers with a
  // pre-cookie-auth session, then delete the key. Do not use for new flows.
  private static readonly REFRESH_KEY = 'bc_refresh_token';

  private readonly _token = signal<string | null>(null);

  readonly token = this._token.asReadonly();

  set(token: string): void {
    this._token.set(token);
  }

  clear(): void {
    this._token.set(null);
  }

  snapshot(): string | null {
    return this._token();
  }

  // Mobile browsers block the cross-site refresh cookie, so the SPA persists its
  // own copy. Tradeoff: localStorage is XSS-readable; mitigated by a short
  // access-token TTL plus server-side refresh-token rotation.
  setRefreshToken(token: string): void {
    localStorage.setItem(TokenStore.REFRESH_KEY, token);
  }

  refreshToken(): string | null {
    return localStorage.getItem(TokenStore.REFRESH_KEY);
  }

  clearRefreshToken(): void {
    localStorage.removeItem(TokenStore.REFRESH_KEY);
  }
}
