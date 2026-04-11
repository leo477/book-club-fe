import { BanRecord } from '../models/club.model';

export const MOCK_BANS: Record<string, BanRecord[]> = {
  'club-1': [
    {
      userId: 'user-3',
      clubId: 'club-1',
      bannedAt: '2026-03-01T00:00:00Z',
      duration: 3,
      bannedBy: 'user-1',
    },
  ],
};
