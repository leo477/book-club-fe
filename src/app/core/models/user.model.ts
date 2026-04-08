export type UserRole = 'user' | 'organizer';

export interface UserProfile {
  id: string;
  role: UserRole;
  displayName: string;
  avatarUrl: string | null;
  createdAt: string;
}
