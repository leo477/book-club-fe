import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, resource, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, firstValueFrom, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { extractApiError } from '../api/api-error.util';
import { ApiUserProfile, ApiUserStats, mapUserProfile, mapUserStats } from '../api/api-mappers';
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

  private readonly _statsResource = resource({
    params: () => this._currentUser()?.id ?? null,
    loader: ({ params: userId }) => {
      if (!userId) return Promise.resolve(null as UserStats | null);
      return firstValueFrom(
        this.http.get<ApiUserStats>(`${environment.apiUrl}/users/me/stats`).pipe(
          catchError(() => of(null)),
        ),
      ).then(raw => (raw ? mapUserStats(raw) : null));
    },
  });
  readonly userStats = computed<UserStats | null>(() => this._statsResource.value() ?? null);

  constructor() {
    const token = this.tokenStore.snapshot();
    if (token) {
      firstValueFrom(
        this.http.get<ApiUserProfile>(`${environment.apiUrl}/auth/me`).pipe(
          catchError(() => {
            this.tokenStore.clear();
            return of(null);
          }),
        ),
      ).then(raw => {
        this._currentUser.set(raw ? mapUserProfile(raw) : null);
        this._isLoading.set(false);
      });
    } else {
      this._isLoading.set(false);
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
        this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, {
          email,
          password,
          displayName,
          role,
        }),
      );
      this.tokenStore.set(resp.accessToken);
      this.tokenStore.setRefresh(resp.refreshToken);
      this._currentUser.set(mapUserProfile(resp.user));
      return { error: null };
    } catch (err) {
      return { error: extractApiError(err) };
    }
  }

  async signIn(email: string, password: string): Promise<{ error: string | null }> {
    try {
      const resp = await firstValueFrom(
        this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, { email, password }),
      );
      this.tokenStore.set(resp.accessToken);
      this.tokenStore.setRefresh(resp.refreshToken);
      this._currentUser.set(mapUserProfile(resp.user));
      return { error: null };
    } catch (err) {
      return { error: extractApiError(err) };
    }
  }

  async signOut(): Promise<void> {
    try {
      await firstValueFrom(this.http.post(`${environment.apiUrl}/auth/logout`, {}));
    } catch { /* ignore logout errors */ }
    this.tokenStore.clear();
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
