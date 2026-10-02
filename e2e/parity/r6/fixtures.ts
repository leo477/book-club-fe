// Deterministic API for the R6 (/clubs/:id) parity specs. One handler serves three consumers:
//  - mock-backend.ts (anonymous server-side fetches made by the Next server),
//  - page.route in the browser for the legacy (Angular) target, which would otherwise call the production backend,
//  - page.route in the browser for the Next target when a signed-in role is simulated.
// Nothing here ever reaches a real backend: every /api/v1 request of the signed-in/legacy journeys is fulfilled from here.

export type Role = 'guest' | 'member' | 'pending' | 'organizer' | 'admin';

export const IDS = {
  public: 'a1b2c3d4-0000-4000-8000-000000000001',
  private: 'a1b2c3d4-0000-4000-8000-000000000002',
  hostile: 'a1b2c3d4-0000-4000-8000-000000000003',
  bare: 'a1b2c3d4-0000-4000-8000-000000000004',
  missing: 'a1b2c3d4-0000-4000-8000-000000000099',
  broken: 'a1b2c3d4-0000-4000-8000-000000000050',
} as const;

export const ORGANIZER_ID = 'user-organizer';
export const MEMBER_ID = 'user-member';

export const COVER = 'https://parity.supabase.co/storage/cover.svg';
export const COVER_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#8a6d3b"/></svg>';

const base = {
  description: 'Читаємо сучасну українську прозу щочетверга.',
  coverUrl: COVER,
  organizerId: ORGANIZER_ID,
  isPublic: true,
  memberCount: 3,
  memberPreviews: [] as string[],
  createdAt: '2026-03-01T10:00:00Z',
  status: 'active',
  city: 'Київ',
  nextMeetingDate: '2026-12-31T22:30:00Z',
  address: 'вул. Хрещатик, 1',
  lat: null,
  lng: null,
  theme: null,
  currentBook: 'Місто',
  tags: ['проза', 'київ'],
  meetingDurationMinutes: 90,
  afterMeetingVenue: { name: 'Кав’ярня', address: 'вул. Саксаганського, 5', description: null, lat: null, lng: null },
  cancelledAt: null,
  currentChampion: null,
};

export const CLUBS: Record<string, Record<string, unknown>> = {
  [IDS.public]: { ...base, id: IDS.public, name: 'Нічні читачі' },
  [IDS.private]: { ...base, id: IDS.private, name: 'Закритий клуб', isPublic: false },
  [IDS.hostile]: {
    ...base,
    id: IDS.hostile,
    name: 'Evil </script><script>window.__pwn=1</script> "club"',
    description: 'Line1 Line2 </script><img src=x onerror=alert(1)> & <b>bold</b>',
    tags: ['</script>', 'a&b'],
  },
  // no cover, no description, no city, no tags: exercises every fallback
  [IDS.bare]: { ...base, id: IDS.bare, name: 'Без обкладинки', description: null, coverUrl: null, city: null, tags: [], afterMeetingVenue: null, currentBook: null, nextMeetingDate: null },
};

const event = (n: number, over: Record<string, unknown>) => ({
  id: `e1e1e1e1-0000-4000-8000-00000000000${n}`,
  clubId: IDS.public,
  clubName: 'Нічні читачі',
  organizerId: ORGANIZER_ID,
  title: `Зустріч ${n}`,
  description: `Опис зустрічі ${n}`,
  date: '2027-03-15T16:00:00Z',
  city: 'Київ',
  address: 'вул. Хрещатик, 1',
  lat: null,
  lng: null,
  status: 'scheduled',
  cancelledAt: null,
  coverUrl: null,
  bookTitle: 'Місто',
  theme: null,
  tags: [],
  durationMinutes: 90,
  afterMeetingVenue: null,
  attendeeCount: 2,
  isAttending: false,
  hasWinner: false,
  ...over,
});

// 22:30Z on 31 Dec is already 1 Jan in Europe/Kyiv (UTC+2): a browser in UTC-8 shows 31 Dec
export const EVENT_NEW_YEAR = event(1, { title: 'Новорічна зустріч', date: '2026-12-31T22:30:00Z' });
export const EVENT_SPRING = event(2, { title: 'Весняна зустріч', date: '2027-03-15T16:00:00Z' });
export const EVENT_PAST = event(3, { title: 'Минула зустріч', date: '2026-01-10T16:00:00Z', status: 'held' });

export const MEMBERS = [
  { userId: ORGANIZER_ID, displayName: 'Олена Організатор', avatarUrl: null, role: 'organizer', socials: null, socialsPublic: false },
  { userId: MEMBER_ID, displayName: 'Максим Учасник', avatarUrl: null, role: 'member', socials: null, socialsPublic: false },
  { userId: 'user-3', displayName: 'Іра Третя', avatarUrl: null, role: 'member', socials: null, socialsPublic: false },
];

const userFor = (role: Role) => ({
  id: role === 'organizer' ? ORGANIZER_ID : MEMBER_ID,
  email: 'mock@example.test',
  displayName: role === 'organizer' ? 'Олена Організатор' : 'Максим Учасник',
  role: role === 'admin' ? 'admin' : 'user',
  avatarUrl: null,
  createdAt: '2026-01-01T00:00:00Z',
  socialsPublic: false,
  socials: {},
});

export interface Reply {
  status: number;
  body?: unknown;
}

export interface MockState {
  role: Role;
  joinResult: 'pending' | 'member' | 'already_requested';
  joined: boolean;
  pending: boolean;
  options: { id: string; title: string; author: string; votes: number; hasVoted: boolean }[];
  roundStatus: 'open' | 'closed' | null;
  unhandled: string[];
  // per-path forced failure, e.g. { 'POST /clubs/:id/join': 503 }
  fail: Record<string, number>;
}

export function newState(role: Role = 'guest', over: Partial<MockState> = {}): MockState {
  return {
    role,
    joinResult: 'pending',
    joined: role === 'member' || role === 'organizer',
    pending: role === 'pending',
    options: [
      { id: 'opt-1', title: 'Майстер і Маргарита', author: 'Булгаков', votes: 2, hasVoted: false },
      { id: 'opt-2', title: 'Тигролови', author: 'Багряний', votes: 1, hasVoted: false },
      { id: 'opt-3', title: 'Фелікс Австрія', author: 'Іваничук', votes: 5, hasVoted: false },
      { id: 'opt-4', title: 'Солодка Даруся', author: 'Матіос', votes: 21, hasVoted: false },
    ],
    roundStatus: 'open',
    unhandled: [],
    fail: {},
    ...over,
  };
}

const round = (s: MockState) =>
  s.roundStatus === null
    ? null
    : {
        id: 'round-1',
        clubId: IDS.public,
        status: s.roundStatus,
        options: s.options,
        totalVotes: s.options.reduce((n, o) => n + o.votes, 0),
        winnerId: null,
      };

const uuid = '[0-9a-f-]{36}';

/** `path` is relative to /api/v1 (no query); `query` is the raw search string. */
export function handleApi(s: MockState, method: string, path: string, query = '', _body: string | null = null): Reply {
  const key = `${method} ${path.replace(new RegExp(uuid, 'g'), ':id').replace(/\/opt-\d+/g, '/:opt')}`;
  const forced = s.fail[key];
  if (forced) return { status: forced, body: { detail: 'forced failure' } };
  const authed = s.role !== 'guest';
  const isMember = s.joined;
  let m: RegExpMatchArray | null;

  if (method === 'GET' && path === '/auth/session-status') return { status: 200, body: { hasSession: authed } };
  if (method === 'GET' && path === '/auth/me') return authed ? { status: 200, body: userFor(s.role) } : { status: 401, body: { detail: 'no' } };
  if (method === 'POST' && path === '/auth/refresh') {
    return authed ? { status: 200, body: { accessToken: 'mock', refreshToken: 'mock', user: userFor(s.role) } } : { status: 401, body: { detail: 'no' } };
  }
  if (method === 'POST' && path === '/auth/logout') return { status: 204 };
  if (method === 'GET' && path === '/config/maps-key') return { status: 404, body: { detail: 'no key in tests' } };
  if (method === 'GET' && path === '/clubs') return { status: 200, body: [CLUBS[IDS.public]] };
  if (method === 'GET' && path === '/clubs/my') {
    if (!authed) return { status: 401, body: { detail: 'no' } };
    return { status: 200, body: isMember ? [CLUBS[IDS.public]] : [] };
  }
  if ((m = path.match(new RegExp(`^/clubs/(${uuid})$`))) && method === 'GET') {
    if (m[1] === IDS.broken) return { status: 503, body: { detail: 'boom' } };
    const club = CLUBS[m[1]];
    if (!club) return { status: 404, body: { detail: 'Club not found' } };
    // backend contract: a private club is a four-key stub for anyone who is not a member, organizer or admin
    if (!club['isPublic'] && !(isMember || s.role === 'organizer' || s.role === 'admin')) {
      return { status: 200, body: { id: club['id'], name: club['name'], isPublic: false, memberCount: club['memberCount'] } };
    }
    return { status: 200, body: club };
  }
  if ((m = path.match(new RegExp(`^/clubs/(${uuid})/events$`))) && method === 'GET') {
    if (m[1] !== IDS.public) return { status: 200, body: [] };
    const past = /include_past=true/.test(query);
    return { status: 200, body: [EVENT_NEW_YEAR, EVENT_SPRING, ...(past ? [EVENT_PAST] : [])] };
  }
  if (path.match(new RegExp(`^/clubs/${uuid}/members$`)) && method === 'GET') {
    return authed ? { status: 200, body: MEMBERS } : { status: 401, body: { detail: 'no' } };
  }
  if (path.match(new RegExp(`^/clubs/${uuid}/my-membership$`)) && method === 'GET') {
    return authed
      ? { status: 200, body: { isMember: isMember, role: s.role === 'organizer' ? 'organizer' : isMember ? 'member' : null, joinRequestStatus: s.pending ? 'pending' : 'none' } }
      : { status: 401, body: { detail: 'no' } };
  }
  if (path.match(new RegExp(`^/clubs/${uuid}/join$`)) && method === 'POST') {
    if (!authed) return { status: 401, body: { detail: 'no' } };
    if (s.joinResult === 'member') s.joined = true;
    else s.pending = true;
    return { status: 200, body: { status: s.joinResult } };
  }
  if (path.match(new RegExp(`^/clubs/${uuid}/leave$`)) && method === 'DELETE') {
    s.joined = false;
    return { status: 204 };
  }
  if (path.match(new RegExp(`^/clubs/${uuid}/bans$`)) && method === 'GET') {
    return s.role === 'organizer' ? { status: 200, body: [] } : { status: 403, body: { detail: 'organizer only' } };
  }
  if (path.match(new RegExp(`^/clubs/${uuid}/book-vote/round$`)) && method === 'GET') return { status: 200, body: round(s) };
  if ((m = path.match(new RegExp(`^/clubs/${uuid}/book-vote/options/([^/]+)/vote$`)))) {
    const o = s.options.find((x) => x.id === m![1]);
    if (!o) return { status: 404, body: { detail: 'option' } };
    if (method === 'POST') {
      o.hasVoted = true;
      o.votes += 1;
    } else if (method === 'DELETE') {
      o.hasVoted = false;
      o.votes = Math.max(0, o.votes - 1);
    }
    return { status: 200, body: round(s) };
  }
  if (method === 'GET' && (path === '/books/stores' || path.match(new RegExp(`^/clubs/${uuid}/chat/rooms$`)))) return { status: 200, body: [] };
  s.unhandled.push(key);
  return { status: 404, body: { detail: `mock: unhandled ${key}` } };
}
