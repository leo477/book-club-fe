// Run `supabase gen types typescript --project-id YOUR_PROJECT_ID > src/app/core/supabase/database.types.ts`
// after setting up your Supabase project to get full type safety.
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: 'user' | 'organizer';
          display_name: string;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      clubs: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          organizer_id: string;
          cover_image_url: string | null;
          current_book_title: string | null;
          is_public: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['clubs']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['clubs']['Insert']>;
      };
      club_members: {
        Row: { club_id: string; user_id: string; joined_at: string };
        Insert: Omit<Database['public']['Tables']['club_members']['Row'], 'joined_at'>;
        Update: never;
      };
      quizzes: {
        Row: {
          id: string;
          club_id: string;
          organizer_id: string;
          title: string;
          description: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['quizzes']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['quizzes']['Insert']>;
      };
      quiz_questions: {
        Row: {
          id: string;
          quiz_id: string;
          question_text: string;
          options: string[];
          correct_option_index: number;
          sort_order: number;
        };
        Insert: Omit<Database['public']['Tables']['quiz_questions']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['quiz_questions']['Insert']>;
      };
      quiz_attempts: {
        Row: { id: string; quiz_id: string; user_id: string; score: number; completed_at: string };
        Insert: Omit<Database['public']['Tables']['quiz_attempts']['Row'], 'id' | 'completed_at'>;
        Update: never;
      };
      randomizer_sessions: {
        Row: {
          id: string;
          club_id: string;
          book_candidates: BookCandidate[];
          selected_book: BookCandidate | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['randomizer_sessions']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['randomizer_sessions']['Insert']>;
      };
    };
  };
};

export interface BookCandidate {
  title: string;
  author: string;
  cover_url: string | null;
  open_library_id?: string;
}
