import { RandomizerSession } from '../models/randomizer.model';

export const MOCK_RANDOMIZER_HISTORY: RandomizerSession[] = [
  {
    id: 'session-1',
    clubId: 'club-1',
    createdBy: 'user-1',
    purpose: 'Хто представляє книгу?',
    candidates: [
      { userId: 'user-1', displayName: 'Alice Organizer', avatarUrl: null },
      { userId: 'user-2', displayName: 'Bob Reader', avatarUrl: null },
      { userId: 'user-3', displayName: 'Carol Smith', avatarUrl: null },
    ],
    result: { userId: 'user-2', displayName: 'Bob Reader', avatarUrl: null },
    createdAt: '2024-03-01T00:00:00Z',
  },
];
