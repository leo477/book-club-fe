import { HttpResponse, http } from 'msw';
import { messages, API, server } from '@/test/harness';

export const ID = '3f2b8c1e-9a4d-4e7b-8c5f-1a2b3c4d5e6f';

export const t = (key: string) => (messages.uk[key] ?? key).replace(/''/g, "'");

export const statsJson = (overrides: Record<string, unknown> = {}) => ({
  topActive: [{ userId: 'm1', displayName: 'Grace Hopper', avatarUrl: null, count: 7 }],
  topWinners: [{ userId: 'm2', displayName: 'Alan Turing', avatarUrl: null, count: 2 }],
  recentAttendance: [
    { eventId: 'e1', title: 'Dune night', date: '2099-05-01T18:00:00Z', attendeeCount: 8 },
    { eventId: 'e2', title: 'Emma talk', date: '2099-04-01T18:00:00Z', attendeeCount: 4 },
  ],
  totalMembers: 12,
  totalEvents: 5,
  totalMessages: 340,
  memberGrowth: [{ month: '2099-01', count: 3 }, { month: '2099-02', count: 6 }],
  eventFrequency: [{ month: '2099-01', count: 1 }],
  bannedUsersCount: 1,
  upcomingEventsCount: 2,
  ...overrides,
});

export const banJson = (overrides: Record<string, unknown> = {}) => ({
  userId: 'b1',
  clubId: ID,
  bannedAt: '2099-01-01T00:00:00Z',
  duration: 3,
  bannedBy: 'u1',
  ...overrides,
});

export const requestJson = (overrides: Record<string, unknown> = {}) => ({
  userId: 'r1',
  displayName: 'Katherine Johnson',
  avatarUrl: null,
  status: 'pending',
  source: 'link',
  createdAt: '2099-01-01T00:00:00Z',
  ...overrides,
});

/** Answers every read the manage screen makes; individual tests override what they care about. */
export function mockManageReads(overrides: { members?: unknown[]; bans?: unknown[]; requests?: unknown[]; stats?: unknown } = {}) {
  server.use(
    http.get(`${API}/clubs/${ID}/members`, () => HttpResponse.json(overrides.members ?? [])),
    http.get(`${API}/clubs/${ID}/bans`, () => HttpResponse.json(overrides.bans ?? [])),
    http.get(`${API}/clubs/${ID}/join-requests`, () => HttpResponse.json(overrides.requests ?? [])),
    http.get(`${API}/clubs/${ID}/stats`, () => HttpResponse.json(overrides.stats ?? statsJson())),
  );
}

/** A request that stays open until `release` is called, to hold a second click against an in-flight one. */
export function gate() {
  let release!: () => void;
  const open = new Promise<void>((resolve) => (release = resolve));
  return { open, release };
}
