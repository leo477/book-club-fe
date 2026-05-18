import { Injectable, signal } from '@angular/core';

/**
 * SECURITY (L1 — JWT storage):
 *
 * The Supabase access token is persisted to `sessionStorage` so that the
 * Angular SPA can attach it as a Bearer token on every FastAPI request via
 * the auth interceptor. This is intentionally NOT an HttpOnly cookie.
 *
 * Why not HttpOnly cookies?
 *   - JWTs are issued by Supabase (the IdP) directly to the browser as part
 *     of the standard Supabase Auth flow. There is no server-side session
 *     mint step on our FastAPI backend today.
 *   - Migrating to HttpOnly cookies would require:
 *       (a) a backend `/auth/session` endpoint that exchanges the Supabase
 *           access token for a server-issued, signed cookie session,
 *       (b) CSRF protection (double-submit cookie or SameSite=strict),
 *       (c) `withCredentials: true` on every HttpClient call and matching
 *           CORS `Access-Control-Allow-Credentials` on the backend,
 *       (d) rework of the refresh flow because the SPA can no longer read
 *           the refresh token.
 *     This is an architectural change tracked separately — do not implement
 *     it ad-hoc in this file.
 *
 * Mitigations applied today:
 *   - Token TTL is short (15 min, enforced by Supabase / backend config).
 *   - CSP hardened to drop `'unsafe-inline'` for scripts (see vercel.json).
 *   - No third-party scripts are loaded that could read storage.
 *   - `sessionStorage` (not `localStorage`) so the token dies with the tab.
 *
 * If you need to add Supabase-direct browser calls (RLS), keep using this
 * store. If you remove all direct-Supabase usage, revisit the cookie plan.
 */
const TOKEN_KEY = 'bc_access_token';

@Injectable({ providedIn: 'root' })
export class TokenStore {
  private readonly _token = signal<string | null>(sessionStorage.getItem(TOKEN_KEY));

  readonly token = this._token.asReadonly();

  set(token: string): void {
    sessionStorage.setItem(TOKEN_KEY, token);
    this._token.set(token);
  }

  clear(): void {
    sessionStorage.removeItem(TOKEN_KEY);
    this._token.set(null);
  }

  snapshot(): string | null {
    return this._token();
  }
}
