import { Injectable, signal } from '@angular/core';

// Access token lives in memory only (in-memory signal).
// On page reload, it is recovered via silent refresh using the httpOnly refresh cookie.
// See AuthService.init() for the recovery flow.

@Injectable({ providedIn: 'root' })
export class TokenStore {
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
}
