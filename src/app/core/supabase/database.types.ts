// Run `supabase gen types typescript --project-id YOUR_PROJECT_ID > src/app/core/supabase/database.types.ts`
// after setting up your Supabase project to get full type safety.

/** Lightweight book candidate shape stored in JSONB columns. */
export interface BookCandidateJson {
  title: string;
  author: string;
}

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
        Insert: {
          id: string;
          role: 'user' | 'organizer';
          display_name: string;
          avatar_url?: string | null;
        };
        Update: {
          id?: string;
          role?: 'user' | 'organizer';
          display_name?: string;
          avatar_url?: string | null;
        };
        Relationships: [];
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
        Insert: {
          name: string;
          description?: string | null;
          organizer_id: string;
          cover_image_url?: string | null;
          current_book_title?: string | null;
          is_public?: boolean;
        };
        Update: {
          name?: string;
          description?: string | null;
          organizer_id?: string;
          cover_image_url?: string | null;
          current_book_title?: string | null;
          is_public?: boolean;
        };
        Relationships: [];
      };
      club_members: {
        Row: { club_id: string; user_id: string; joined_at: string };
        Insert: { club_id: string; user_id: string };
        Update: never;
        Relationships: [];
      };
      quizzes: {
        Row: {
          id: string;
          club_id: string;
          created_by: string;
          title: string;
          description: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          club_id: string;
          created_by: string;
          title: string;
          description?: string | null;
          is_active?: boolean;
        };
        Update: {
          club_id?: string;
          created_by?: string;
          title?: string;
          description?: string | null;
          is_active?: boolean;
        };
        Relationships: [];
      };
      quiz_questions: {
        Row: {
          id: string;
          quiz_id: string;
          question: string;
          options: string[];
          correct_index: number;
          sort_order: number;
        };
        Insert: {
          quiz_id: string;
          question: string;
          options: string[];
          correct_index: number;
          sort_order?: number;
        };
        Update: {
          quiz_id?: string;
          question?: string;
          options?: string[];
          correct_index?: number;
          sort_order?: number;
        };
        Relationships: [];
      };
      quiz_attempts: {
        Row: {
          id: string;
          quiz_id: string;
          user_id: string;
          score: number;
          total: number;
          answers: number[];
          completed_at: string;
        };
        Insert: {
          quiz_id: string;
          user_id: string;
          score: number;
          total: number;
          answers: number[];
        };
        Update: never;
        Relationships: [];
      };
      randomizer_sessions: {
        Row: {
          id: string;
          club_id: string;
          created_by: string;
          candidates: BookCandidateJson[];
          result: BookCandidateJson | null;
          created_at: string;
        };
        Insert: {
          club_id: string;
          created_by: string;
          candidates: BookCandidateJson[];
          result?: BookCandidateJson | null;
        };
        Update: {
          club_id?: string;
          created_by?: string;
          candidates?: BookCandidateJson[];
          result?: BookCandidateJson | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
