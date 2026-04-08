import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import type { Database } from './database.types';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  readonly client: SupabaseClient<Database> = createClient<Database>(
    environment.supabaseUrl,
    environment.supabaseAnonKey,
    {
      auth: {
        persistSession: true,   // Keep session across page reloads (stored in Supabase's own storage)
        autoRefreshToken: true, // Silently refresh the JWT before it expires
        detectSessionInUrl: true,
      },
    },
  );
}
