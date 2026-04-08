import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../supabase/supabase.service';
import type { Database } from '../supabase/database.types';
import { UserProfile, UserRole } from '../models/user.model';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly supabase = inject(SupabaseService);
  private readonly router = inject(Router);

  // Private writable signals
  private readonly _currentUser = signal<UserProfile | null>(null);
  private readonly _isLoading = signal<boolean>(true);

  // Public readonly signals
  readonly currentUser = this._currentUser.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly isAuthenticated = computed(() => this._currentUser() !== null);
  readonly userRole = computed(() => this._currentUser()?.role ?? null);
  readonly isOrganizer = computed(() => this._currentUser()?.role === 'organizer');

  constructor() {
    this.initAuthState();
  }

  private async initAuthState(): Promise<void> {
    const {
      data: { session },
    } = await this.supabase.client.auth.getSession();

    if (session?.user) {
      await this.loadProfile(session.user.id);
    }
    this._isLoading.set(false);

    this.supabase.client.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await this.loadProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        this._currentUser.set(null);
      }
    });
  }

  private async loadProfile(userId: string): Promise<void> {
    const result = await this.supabase.client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    const data = result.data as ProfileRow | null;

    if (data) {
      this._currentUser.set({
        id: data.id,
        role: data.role as UserRole,
        displayName: data.display_name,
        avatarUrl: data.avatar_url,
        createdAt: data.created_at,
      });
    }
  }

  async signUp(
    email: string,
    password: string,
    displayName: string,
    role: UserRole,
  ): Promise<{ error: string | null }> {
    this._isLoading.set(true);
    const { error } = await this.supabase.client.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName, role } },
    });
    this._isLoading.set(false);
    return { error: error?.message ?? null };
  }

  async signIn(email: string, password: string): Promise<{ error: string | null }> {
    this._isLoading.set(true);
    const { error } = await this.supabase.client.auth.signInWithPassword({
      email,
      password,
    });
    this._isLoading.set(false);
    return { error: error?.message ?? null };
  }

  async signOut(): Promise<void> {
    await this.supabase.client.auth.signOut();
    this.router.navigate(['/login']);
  }
}
