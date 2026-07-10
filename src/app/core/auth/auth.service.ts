import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { Observable, catchError, firstValueFrom, map, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { extractApiError } from '../api/api-error.util';
import { ApiUserProfile, ApiUserStats, mapUserProfile, mapUserStats } from '../api/api-mappers';
import { SKIP_AUTH_REDIRECT } from '../interceptors/auth.interceptor';
import { TokenStore } from './token.store';
import { UserProfile, UserRole, UserSocials, UserStats } from '../models/user.model';

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: ApiUserProfile;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly tokenStore = inject(TokenStore);

  private readonly _currentUser = signal<UserProfile | null>(null);
  private readonly _isLoading = signal<boolean>(true);

  readonly currentUser = this._currentUser.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly isAuthenticated = computed(() => this._currentUser() !== null);
  readonly userRole = computed(() => this._currentUser()?.role ?? null);
  readonly isOrganizer = computed(() => this._currentUser()?.role === 'organizer');
  readonly isAdmin = computed(() => this._currentUser()?.role === 'admin');

  private readonly _statsResource = rxResource<UserStats | null, string | null>({
    params: () => this._currentUser()?.id ?? null,
    stream: ({ params: userId }) => {
      if (!userId) return of(null as UserStats | null);
      return this.http.get<ApiUserStats>(`${environment.apiUrl}/users/me/stats`).pipe(
        map(raw => mapUserStats(raw)),
        catchError(() => of(null)),
      );
    },
  });
  readonly userStats = computed<UserStats | null>(() => this._statsResource.value() ?? null);

  /** Legacy localStorage marker, superseded by the session-status endpoint.
   *  Only read once during init() to drive the one-release migration below. */
  private static readonly LEGACY_SESSION_MARKER = 'bc_has_session';

  /** Lightweight, unauthenticated presence check of the httpOnly refresh
   *  cookie, so the SPA can decide whether to attempt a silent restore
   *  without needing the access token in memory. */
  private checkSessionStatus$(): Observable<boolean> {
    return this.http
      .get<{ hasSession: boolean }>(`${environment.apiUrl}/auth/session-status`, {
        withCredentials: true,
      })
      .pipe(
        map(resp => resp.hasSession),
        catchError(() => of(false)),
      );
  }

  async init(): Promise<void> {
    const existingToken = this.tokenStore.snapshot();
    const skipCtx = new HttpContext().set(SKIP_AUTH_REDIRECT, true);

    const hasLegacySession =
      !!this.tokenStore.refreshToken() || !!localStorage.getItem(AuthService.LEGACY_SESSION_MARKER);

    if (existingToken) {
      const raw = await firstValueFrom(
        this.http.get<ApiUserProfile>(`${environment.apiUrl}/auth/me`, { context: skipCtx }).pipe(
          catchError(() => {
            this.tokenStore.clear();
            return of(null);
          }),
        ),
      );
      this._currentUser.set(raw ? mapUserProfile(raw) : null);
    } else if ((await firstValueFrom(this.checkSessionStatus$())) || hasLegacySession) {
      await this.restoreSession();
      if (hasLegacySession) {
        // One-release migration: legacy refresh token/marker are no longer
        // read after this point, so drop them regardless of outcome.
        this.tokenStore.clearRefreshToken();
        localStorage.removeItem(AuthService.LEGACY_SESSION_MARKER);
      }
    }
    this._isLoading.set(false);
  }

  /**
   * Recovers an access token from the httpOnly refresh cookie and loads the
   * current user. Returns true when a session was restored.
   */
  private async restoreSession(): Promise<boolean> {
    const skipCtx = new HttpContext().set(SKIP_AUTH_REDIRECT, true);
    // Desktop relies on the httpOnly cookie (withCredentials); the legacy
    // SPA-persisted refresh token is sent too, needed only for the one-release
    // migration off the pre-cookie-auth session shape.
    const persistedRefresh = this.tokenStore.refreshToken();
    const refreshResp = await firstValueFrom(
      this.http
        .post<{ accessToken: string; refreshToken: string }>(
          `${environment.apiUrl}/auth/refresh`,
          persistedRefresh ? { refreshToken: persistedRefresh } : {},
          { withCredentials: true, context: skipCtx },
        )
        .pipe(catchError(() => of(null))),
    );
    if (!refreshResp) return false;
    this.tokenStore.set(refreshResp.accessToken);
    const raw = await firstValueFrom(
      this.http
        .get<ApiUserProfile>(`${environment.apiUrl}/auth/me`, { context: skipCtx })
        .pipe(catchError(() => of(null))),
    );
    this._currentUser.set(raw ? mapUserProfile(raw) : null);
    return raw !== null;
  }

  /** Starts the Google OAuth flow via a full-page redirect to the backend. */
  loginWithGoogle(): void {
    globalThis.location.href = `${environment.oauthBaseUrl}/auth/oauth/google?origin=${encodeURIComponent(globalThis.location.origin)}`;
  }

  /** Fetches a one-time, short-lived ticket used to authenticate the chat WebSocket. */
  getWsTicket$(): Observable<string> {
    return this.http
      .post<{ ticket: string }>(`${environment.apiUrl}/auth/ws-ticket`, {})
      .pipe(map(resp => resp.ticket));
  }

  /**
   * Exchanges the one-time OAuth handoff code for tokens. Used by the callback
   * route on mobile, where the cross-site refresh cookie is unavailable, so the
   * SPA must hold the rotated refresh token itself.
   */
  async exchangeOAuthCode(code: string): Promise<{ error: string | null }> {
    const skipCtx = new HttpContext().set(SKIP_AUTH_REDIRECT, true);
    try {
      const resp = await firstValueFrom(
        this.http.post<{ accessToken: string; refreshToken: string }>(
          `${environment.apiUrl}/auth/oauth/exchange`,
          { code },
          { withCredentials: true, context: skipCtx },
        ),
      );
      this.tokenStore.set(resp.accessToken);
      const raw = await firstValueFrom(
        this.http
          .get<ApiUserProfile>(`${environment.apiUrl}/auth/me`, { context: skipCtx })
          .pipe(catchError(() => of(null))),
      );
      if (!raw) {
        // /auth/me failed after tokens were stored: tear down the half-set
        // session so nothing stale is left behind (mirrors restoreSession()).
        this.tokenStore.clear();
        return { error: 'OAUTH_FAILED' };
      }
      this._currentUser.set(mapUserProfile(raw));
      return { error: null };
    } catch {
      return { error: 'OAUTH_FAILED' };
    }
  }

  async signUp(
    email: string,
    password: string,
    displayName: string,
    role: UserRole,
  ): Promise<{ error: string | null }> {
    try {
      const resp = await firstValueFrom(
        this.http.post<AuthResponse>(
          `${environment.apiUrl}/auth/register`,
          {
            email,
            password,
            displayName,
            role,
          },
          { withCredentials: true },
        ),
      );
      this.tokenStore.set(resp.accessToken);
      this._currentUser.set(mapUserProfile(resp.user));
      return { error: null };
    } catch (err) {
      return { error: extractApiError(err) };
    }
  }

  async signIn(email: string, password: string): Promise<{ error: string | null }> {
    try {
      const resp = await firstValueFrom(
        this.http.post<AuthResponse>(
          `${environment.apiUrl}/auth/login`,
          { email, password },
          { withCredentials: true },
        ),
      );
      this.tokenStore.set(resp.accessToken);
      this._currentUser.set(mapUserProfile(resp.user));
      return { error: null };
    } catch (err) {
      return { error: extractApiError(err) };
    }
  }

  async signOut(): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post(`${environment.apiUrl}/auth/logout`, {}, { withCredentials: true }),
      );
    } catch { /* ignore logout errors */ }
    this.tokenStore.clear();
    this._currentUser.set(null);
    await this.router.navigate(['/login']);
  }

  async updateRole(role: UserRole): Promise<void> {
    const user = this._currentUser();
    if (!user) return;
    await firstValueFrom(
      this.http.patch<ApiUserProfile>(`${environment.apiUrl}/users/me/role`, { role }),
    );
    this._currentUser.set({ ...user, role });
  }

  async updateDisplayName(name: string): Promise<void> {
    const user = this._currentUser();
    if (!user) return;
    await firstValueFrom(
      this.http.patch<ApiUserProfile>(`${environment.apiUrl}/users/me`, { displayName: name }),
    );
    this._currentUser.set({ ...user, displayName: name });
  }

  async updateSocials(socials: UserSocials): Promise<void> {
    const user = this._currentUser();
    if (!user) return;
    await firstValueFrom(
      this.http.patch<ApiUserProfile>(`${environment.apiUrl}/users/me/socials`, socials),
    );
    this._currentUser.set({ ...user, socials });
  }

  async setSocialsPublic(value: boolean): Promise<void> {
    const user = this._currentUser();
    if (!user) return;
    await firstValueFrom(
      this.http.patch<ApiUserProfile>(`${environment.apiUrl}/users/me/socials-visibility`, {
        socialsPublic: value,
      }),
    );
    this._currentUser.set({ ...user, socialsPublic: value });
  }
}
