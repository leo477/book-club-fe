export type UserRole = 'user' | 'organizer' | 'admin';

export interface UserStats {
  clubsJoined: number;
  quizzesTaken: number;
  quizWins: number;
  likesReceived: number;
  booksRead: number;
}

export interface UserSocials {
  telegram?: string;    // username without @
  instagram?: string;   // username without @
  twitter?: string;     // username without @
  linkedin?: string;    // full URL or username
  github?: string;      // username
  goodreads?: string;   // full URL or username
}

export interface UserProfile {
  id: string;
  role: UserRole;
  displayName: string;
  avatarUrl: string | null;
  createdAt: string;
  stats?: UserStats;
  socials?: UserSocials;
  socialsPublic?: boolean;
}
