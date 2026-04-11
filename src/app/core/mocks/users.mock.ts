import { UserProfile, UserStats } from '../models/user.model';

export const MOCK_USERS: UserProfile[] = [
  {
    id: 'user-1',
    role: 'organizer',
    displayName: 'Alice Organizer',
    avatarUrl: null,
    createdAt: '2024-01-01T00:00:00Z',
    socialsPublic: true,
    socials: {
      telegram: 'bookclub_ua',
      instagram: 'bookclub.ukraine',
      github: 'bookclub-dev',
      goodreads: 'bookclub-ua',
    },
  },
  {
    id: 'user-2',
    role: 'user',
    displayName: 'Bob Reader',
    avatarUrl: null,
    createdAt: '2024-01-02T00:00:00Z',
  },
];

export const MOCK_USER_CREDENTIALS: { userId: string; email: string; password: string }[] = [
  { userId: 'user-1', email: 'alice@example.com', password: 'password' },
  { userId: 'user-2', email: 'bob@example.com', password: 'password' },
];

export const MOCK_STATS: Record<string, UserStats> = {
  'user-1': { clubsJoined: 3, quizzesTaken: 12, quizWins: 5, likesReceived: 24, booksRead: 18 },
  'user-2': { clubsJoined: 2, quizzesTaken: 7, quizWins: 1, likesReceived: 8, booksRead: 9 },
};
