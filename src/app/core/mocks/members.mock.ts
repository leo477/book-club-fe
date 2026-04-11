import { MemberCandidate } from '../models/randomizer.model';

export const MOCK_CLUB_MEMBERS: Record<string, MemberCandidate[]> = {
  'club-1': [
    { userId: 'user-1', displayName: 'Alice Organizer', avatarUrl: null },
    { userId: 'user-2', displayName: 'Bob Reader', avatarUrl: null },
    { userId: 'user-3', displayName: 'Carol Smith', avatarUrl: null },
    { userId: 'user-4', displayName: 'Dan Brown', avatarUrl: null },
  ],
  'club-2': [
    { userId: 'user-1', displayName: 'Alice Organizer', avatarUrl: null },
    { userId: 'user-5', displayName: 'Eve Garcia', avatarUrl: null },
    { userId: 'user-6', displayName: 'Frank Lee', avatarUrl: null },
  ],
  'club-3': [
    { userId: 'user-2', displayName: 'Bob Reader', avatarUrl: null },
    { userId: 'user-7', displayName: 'Grace Kim', avatarUrl: null },
  ],
  'club-4': [
    { userId: 'user-1', displayName: 'Alice Organizer', avatarUrl: null },
    { userId: 'user-8', displayName: 'Hanna Wolf', avatarUrl: null },
    { userId: 'user-9', displayName: 'Ivan Petrenko', avatarUrl: null },
    { userId: 'user-10', displayName: 'Julia Roth', avatarUrl: null },
  ],
};
