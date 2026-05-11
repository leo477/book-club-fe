import { Injectable, signal } from '@angular/core';

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
