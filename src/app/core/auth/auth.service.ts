import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { UserProfile, UserRole } from '../models/user.model';
import { MOCK_USERS } from '../mocks/mock-data';

/** In-memory store of registered users (seeded from mock data). */
const inMemoryUsers: Array<UserProfile & { email: string; password: string }> = [
  { ...MOCK_USERS[0], email: 'alice@example.com', password: 'password' },
  { ...MOCK_USERS[1], email: 'bob@example.com', password: 'password' },
];

let nextUserId = inMemoryUsers.length + 1;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly router = inject(Router);

  private readonly _currentUser = signal<UserProfile | null>(null);
  private readonly _isLoading = signal<boolean>(true);

  readonly currentUser = this._currentUser.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly isAuthenticated = computed(() => this._currentUser() !== null);
  readonly userRole = computed(() => this._currentUser()?.role ?? null);
  readonly isOrganizer = computed(() => this._currentUser()?.role === 'organizer');

  constructor() {
    // Resolve immediately — no async session bootstrap needed with mocks
    this._isLoading.set(false);
  }

  async signUp(
    email: string,
    _password: string,
    displayName: string,
    role: UserRole,
  ): Promise<{ error: string | null }> {
    if (inMemoryUsers.some(u => u.email === email)) {
      return { error: 'Email already registered' };
    }

    const newUser: UserProfile & { email: string; password: string } = {
      id: `user-${++nextUserId}`,
      email,
      password: _password,
      role,
      displayName,
      avatarUrl: null,
      createdAt: new Date().toISOString(),
    };

    inMemoryUsers.push(newUser);
    this._currentUser.set({ ...newUser });
    return { error: null };
  }

  async signIn(email: string, password: string): Promise<{ error: string | null }> {
    const found = inMemoryUsers.find(u => u.email === email && u.password === password);
    if (!found) {
      return { error: 'Invalid email or password' };
    }
    this._currentUser.set({ ...found });
    return { error: null };
  }

  async signOut(): Promise<void> {
    this._currentUser.set(null);
    this.router.navigate(['/login']);
  }
}
