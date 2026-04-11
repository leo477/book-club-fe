export const MOCK_MY_CLUB_IDS = new Set(['club-1', 'club-2', 'club-3', 'club-4']);

export const MOCK_PARTICIPATION: Record<string, Set<string>> = {
  'user-1': new Set(['club-1', 'club-2', 'club-4']),
  'user-2': new Set(['club-3']),
};
