import { Injectable, signal } from '@angular/core';

/**
 * SECURITY (L1 — JWT storage):
 *
 * The Supabase access token is persisted to `sessionStorage` so that the
 * Angular SPA can attach it as a Bearer token on every FastAPI request via
 * the auth interceptor.
 *
 * Current auth architecture (hybrid cookie + Bearer):
 *   - The REFRESH token is already stored in an HttpOnly, SameSite=Lax cookie
 *     set by the backend on /auth/login and /auth/register. This is the
 *     long-lived credential and it IS protected from JavaScript access.
 *   - The ACCESS token (short-lived, ~15 min TTL) is returned in the JSON
 *     response body and stored here in sessionStorage so the SPA can attach
 *     it as a Bearer token on each API call via the auth interceptor.
 *   - The backend `/auth/refresh` endpoint reads the HttpOnly refresh cookie
 *     and returns a new access token; the SPA calls it when needed.
 *
 * Why is the access token not also an HttpOnly cookie?
 *   - The FastAPI backend validates Bearer tokens, not session cookies, for
 *     protected endpoints. Moving the access token to an HttpOnly cookie
 *     would require either:
 *       (a) every API request to go through a session-cookie-aware proxy, or
 *       (b) the frontend to call /auth/refresh before every request (too many
 *           round-trips), or
 *       (c) a new middleware on the backend that reads the access cookie and
 *           injects it as a Bearer header internally.
 *     This is a non-trivial architectural change — track it as a separate
 *     ticket and do not implement it ad-hoc here.
 *
 * Residual risk:
 *   - An XSS payload can read `sessionStorage.getItem('bc_access_token')` and
 *     use it for up to 15 minutes before it expires. The refresh token,
 *     however, remains inaccessible to JavaScript because it lives in an
 *     HttpOnly cookie — an attacker cannot silently extend the session.
 *
 * Mitigations applied today (in order of effectiveness):
 *   1. Refresh token is HttpOnly cookie — long-lived credential is protected.
 *   2. Access token TTL is short (15 min, enforced by Supabase / backend).
 *   3. `sessionStorage` (not `localStorage`) — token dies when the tab closes.
 *   4. CSP `script-src` drops `'unsafe-inline'` (see vercel.json) — no inline
 *      scripts can run, which is the primary XSS injection vector in SPAs.
 *   5. Display-name input sanitized with an allowlist validator (see
 *      display-name.validator.ts) — reduces stored-XSS attack surface.
 *
 * TODO (cookie migration):
 *   When the backend grows a `/auth/token` proxy endpoint that validates the
 *   HttpOnly access-token cookie and forwards requests to Supabase/FastAPI,
 *   remove sessionStorage entirely from this store and switch to
 *   `withCredentials: true` on HttpClient. Also add CSRF protection
 *   (double-submit cookie or SameSite=strict) at that point.
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
