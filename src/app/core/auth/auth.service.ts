import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { catchError, firstValueFrom, map, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { extractApiError } from '../api/api-error.util';
import { ApiUserProfile, ApiUserStats, mapUserProfile, mapUserStats } from '../api/api-mappers';
import { SKIP_AUTH_REDIRECT } from '../interceptors/auth.interceptor';
import { TokenStore } from './token.store';
import { UserProfile, UserRole, UserSocials, UserStats } from '../models/user.model';

interface AuthResponse {
  accessToken: string;
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

  private static readonly SESSION_MARKER = 'bc_has_session';

  async init(): Promise<void> {
    const existingToken = this.tokenStore.snapshot();
    const skipCtx = new HttpContext().set(SKIP_AUTH_REDIRECT, true);

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
    } else if (localStorage.getItem(AuthService.SESSION_MARKER)) {
      await this.restoreSession();
    }
    this._isLoading.set(false);
  }

  /**
   * Recovers an access token from the httpOnly refresh cookie and loads the
   * current user. Assumes the SESSION_MARKER is already set. Clears the marker
   * on failure. Returns true when a session was restored.
   */
  private async restoreSession(): Promise<boolean> {
    const skipCtx = new HttpContext().set(SKIP_AUTH_REDIRECT, true);
    const refreshResp = await firstValueFrom(
      this.http
        .post<{ accessToken: string }>(
          `${environment.apiUrl}/auth/refresh`,
          {},
          { withCredentials: true, context: skipCtx },
        )
        .pipe(catchError(() => {
          localStorage.removeItem(AuthService.SESSION_MARKER);
          return of(null);
        })),
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
    window.location.href = `${environment.apiUrl}/auth/oauth/google`;
  }

  /**
   * Completes an OAuth login after the backend redirects back. The refresh
   * cookie has already been set server-side, so we mark the session and restore
   * the access token + user from it.
   */
  async completeOAuthSession(): Promise<{ error: string | null }> {
    localStorage.setItem(AuthService.SESSION_MARKER, '1');
    const restored = await this.restoreSession();
    return restored ? { error: null } : { error: 'OAUTH_FAILED' };
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
      localStorage.setItem(AuthService.SESSION_MARKER, '1');
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
      localStorage.setItem(AuthService.SESSION_MARKER, '1');
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
    localStorage.removeItem(AuthService.SESSION_MARKER);
    this._currentUser.set(null);
    this.router.navigate(['/login']);
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
