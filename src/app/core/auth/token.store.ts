import { Injectable, signal } from '@angular/core';

const TOKEN_KEY = 'bc_access_token';
const REFRESH_TOKEN_KEY = 'bc_refresh_token';

@Injectable({ providedIn: 'root' })
export class TokenStore {
  private readonly _token = signal<string | null>(localStorage.getItem(TOKEN_KEY));
  private readonly _refreshToken = signal<string | null>(localStorage.getItem(REFRESH_TOKEN_KEY));

  readonly token = this._token.asReadonly();
  readonly refreshToken = this._refreshToken.asReadonly();

  set(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
    this._token.set(token);
  }

  setRefresh(token: string): void {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
    this._refreshToken.set(token);
  }

  clear(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    this._token.set(null);
    this._refreshToken.set(null);
  }

  snapshot(): string | null {
    return this._token();
  }

  snapshotRefresh(): string | null {
    return this._refreshToken();
  }
}
