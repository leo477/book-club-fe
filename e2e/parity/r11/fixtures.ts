// Deterministic API for the R11 (quizzes) parity specs. Every /api/v1 call is fulfilled through page.route, so no backend and no
// seeded persona is involved. Quizzes, questions, the active session and the leaderboard are mutable, so a POST/PATCH is visible to
// the next GET like on the real backend. Anything that is not a quiz call falls through to the shared R6 handler (club, events).
//
// Viewers (the per-club role is what differs between the two targets):
//   guest         no session
//   member        global role user, club member
//   owner         global role organizer, owns the club
//   coorg         global role user, club membership role organizer   (Next admits; Angular roleGuard refuses: global role only)
//   globalorg     global role organizer, plain member of the club    (Angular admits; Next refuses: per-club role)
import type { Page } from '@playwright/test';
import { handleApi, IDS, MEMBER_ID, newState, ORGANIZER_ID, type Reply } from '../r6/fixtures';

export type Viewer = 'guest' | 'member' | 'owner' | 'coorg' | 'globalorg';

export const CLUB = IDS.public;
export const OTHER_CLUB = IDS.private;

const q = (n: number) => `b2000000-0000-4000-8000-0000000000${String(n).padStart(2, '0')}`;
export const QZ = {
  draft: 'b1000000-0000-4000-8000-000000000001',
  active: 'b1000000-0000-4000-8000-000000000002',
  live: 'b1000000-0000-4000-8000-000000000003',
  closed: 'b1000000-0000-4000-8000-000000000004',
  /** belongs to ANOTHER club than the URL names (clubId mismatch) */
  foreign: 'b1000000-0000-4000-8000-000000000005',
  /** active quiz without any question */
  empty: 'b1000000-0000-4000-8000-000000000006',
  missing: 'b1000000-0000-4000-8000-000000000099',
} as const;
export const SESSION_ID = 'b3000000-0000-4000-8000-000000000001';
export const EVENT_ID = 'e1e1e1e1-0000-4000-8000-000000000001';

export interface MockQuiz {
  id: string;
  clubId: string;
  createdBy: string;
  title: string;
  description: string | null;
  isActive: boolean;
  status: 'draft' | 'active' | 'live' | 'closed';
}
export interface MockQuestion {
  id: string;
  quizId: string;
  question: string;
  options: string[];
  correctIndex: number;
  position: number;
}
export interface MockEntry {
  rank: number;
  userId: string;
  displayName: string;
  avatarUrl: null;
  score: number;
  totalQuestions: number;
  hasAttempted: boolean;
}
export interface MockSession {
  id: string;
  quizId: string;
  eventId: string | null;
  startedBy: string;
  startedAt: string;
  closedAt: string | null;
  participantCount: number;
}

const quiz = (id: string, title: string, status: MockQuiz['status'], over: Partial<MockQuiz> = {}): MockQuiz => ({
  id,
  clubId: CLUB,
  createdBy: ORGANIZER_ID,
  title,
  description: `Опис: ${title}`,
  isActive: status === 'active' || status === 'live',
  status,
  ...over,
});

export const freshQuizzes = (): MockQuiz[] => [
  quiz(QZ.draft, 'Чернетка про Місто', 'draft'),
  quiz(QZ.active, 'Активний квіз', 'active'),
  quiz(QZ.live, 'Квіз наживо', 'live'),
  quiz(QZ.closed, 'Закритий квіз', 'closed'),
  quiz(QZ.empty, 'Порожній квіз', 'active'),
];

const question = (quizId: string, n: number, text: string, correct: number): MockQuestion => ({
  id: q(n),
  quizId,
  question: text,
  options: ['A', 'B', 'C', 'D'].map((l) => `Варіант-${n}-${l}`),
  correctIndex: correct,
  position: n,
});

export const freshQuestions = (): Record<string, MockQuestion[]> => ({
  [QZ.draft]: [question(QZ.draft, 1, 'Перше питання чернетки', 1), question(QZ.draft, 2, 'Друге питання чернетки', 2)],
  [QZ.active]: [question(QZ.active, 11, 'Хто автор Міста?', 1), question(QZ.active, 12, 'Де відбувається дія?', 0), question(QZ.active, 13, 'Коли написано?', 3)],
  [QZ.live]: [question(QZ.live, 21, 'Питання наживо', 2)],
  [QZ.closed]: [question(QZ.closed, 31, 'Питання закритого', 0)],
  [QZ.foreign]: [question(QZ.foreign, 41, 'Чуже питання', 0)],
  [QZ.empty]: [],
});

export const entry = (rank: number, over: Partial<MockEntry> = {}): MockEntry => ({
  rank,
  userId: `player-${rank}`,
  displayName: `Гравець ${rank}`,
  avatarUrl: null,
  score: 10 - rank,
  totalQuestions: 10,
  hasAttempted: true,
  ...over,
});

export interface QuizMock {
  viewer: Viewer;
  quizzes: MockQuiz[];
  questions: Record<string, MockQuestion[]>;
  sessions: Record<string, MockSession | null>;
  leaderboard: MockEntry[];
  events: boolean;
  log: { method: string; path: string; query: string; body: string | null; at: number }[];
  /** forced status per generic key, e.g. `POST /quizzes/:id/questions` */
  fail: Record<string, number>;
  /** the Nth call (1-based) of a key fails once with the given status */
  failNth: Record<string, { n: number; status: number }>;
  hits: Record<string, number>;
  nextQuestion: number;
  nextQuiz: number;
}

const GLOBAL_ROLE: Record<Viewer, 'user' | 'organizer'> = { guest: 'user', member: 'user', owner: 'organizer', coorg: 'user', globalorg: 'organizer' };
const USER_ID: Record<Viewer, string> = { guest: 'none', member: MEMBER_ID, owner: ORGANIZER_ID, coorg: MEMBER_ID, globalorg: MEMBER_ID };
const CLUB_ROLE: Record<Viewer, 'organizer' | 'member' | null> = { guest: null, member: 'member', owner: 'organizer', coorg: 'organizer', globalorg: 'member' };

const userFor = (viewer: Viewer) => ({
  id: USER_ID[viewer],
  email: 'mock@example.test',
  displayName: viewer === 'owner' ? 'Олена Організатор' : 'Максим Учасник',
  role: GLOBAL_ROLE[viewer],
  avatarUrl: null,
  createdAt: '2026-01-01T00:00:00Z',
  socialsPublic: false,
  socials: {},
});

/** The backend hides the answers from everyone who does not organize the club. */
const managesClub = (viewer: Viewer) => CLUB_ROLE[viewer] === 'organizer';

export async function installQuizMock(
  page: Page,
  viewer: Viewer,
  opts: {
    latency?: Record<string, number>;
    fail?: Record<string, number>;
    failNth?: QuizMock['failNth'];
    quizzes?: MockQuiz[];
    questions?: Record<string, MockQuestion[]>;
    leaderboard?: MockEntry[];
    session?: MockSession | null;
    noEvents?: boolean;
  } = {},
): Promise<QuizMock> {
  const mock: QuizMock = {
    viewer,
    quizzes: opts.quizzes ?? freshQuizzes(),
    questions: opts.questions ?? freshQuestions(),
    sessions: { [QZ.live]: opts.session === undefined ? liveSession() : opts.session },
    leaderboard: opts.leaderboard ?? [entry(1), entry(2), entry(3), entry(4), entry(5)],
    events: !opts.noEvents,
    log: [],
    fail: opts.fail ?? {},
    failNth: opts.failNth ?? {},
    hits: {},
    nextQuestion: 900,
    nextQuiz: 900,
  };
  await page.route('**/api/v1/**', async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    const path = url.pathname.replace(/^\/api\/v1/, '');
    const body = req.postData();
    mock.log.push({ method: req.method(), path, query: url.search, body, at: Date.now() });
    const generic = `${req.method()} ${path.replace(/[0-9a-f-]{36}/g, ':id')}`;
    mock.hits[generic] = (mock.hits[generic] ?? 0) + 1;
    const wait = opts.latency?.[generic];
    if (wait) await new Promise((r) => setTimeout(r, wait));
    const nth = mock.failNth[generic];
    const reply =
      nth && nth.n === mock.hits[generic]
        ? { status: nth.status, body: { detail: 'forced failure' } }
        : handleQuiz(mock, req.method(), path, body, generic) ??
          handleApi(newState(viewer === 'guest' ? 'guest' : 'member'), req.method(), path, url.search, body);
    await route.fulfill({
      status: reply.status,
      contentType: 'application/json',
      body: reply.body === undefined ? '' : JSON.stringify(reply.body),
    });
  });
  await page.routeWebSocket(/^(?!.*_next).*$/, (ws) => void ws.close());
  return mock;
}

export const liveSession = (over: Partial<MockSession> = {}): MockSession => ({
  id: SESSION_ID,
  quizId: QZ.live,
  eventId: EVENT_ID,
  startedBy: ORGANIZER_ID,
  startedAt: '2026-10-01T18:30:00Z',
  closedAt: null,
  participantCount: 7,
  ...over,
});

const NOT_FOUND = { status: 404, body: { detail: 'Quiz not found' } };
const uuid = '[0-9a-f-]{36}';

function handleQuiz(m: QuizMock, method: string, path: string, raw: string | null, generic: string): Reply | null {
  const authed = m.viewer !== 'guest';
  const forced = m.fail[generic];
  if (forced) return { status: forced, body: { detail: 'forced failure' } };
  const json = (): Record<string, unknown> => {
    try {
      return raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
    } catch {
      return {};
    }
  };
  const asViewer = (qs: MockQuestion[]) => (managesClub(m.viewer) ? qs : qs.map(({ correctIndex: _hidden, ...rest }) => rest));
  let r: RegExpMatchArray | null;

  if (method === 'GET' && path === '/auth/me') return authed ? { status: 200, body: userFor(m.viewer) } : { status: 401, body: { detail: 'no' } };
  if (method === 'POST' && path === '/auth/refresh')
    return authed ? { status: 200, body: { accessToken: 'mock', refreshToken: 'mock', user: userFor(m.viewer) } } : { status: 401, body: { detail: 'no' } };
  if (method === 'GET' && path === '/auth/session-status') return { status: 200, body: { hasSession: authed } };
  if (path.match(new RegExp(`^/clubs/${uuid}/my-membership$`)) && method === 'GET') {
    const role = CLUB_ROLE[m.viewer];
    return authed ? { status: 200, body: { isMember: role !== null, role, joinRequestStatus: 'none' } } : { status: 401, body: { detail: 'no' } };
  }
  if ((r = path.match(new RegExp(`^/clubs/(${uuid})$`))) && method === 'GET' && r[1] === CLUB) {
    // the club row the gate reads: the organizer id decides ownership
    const base = handleApi(newState('member'), 'GET', path, '', null);
    const club = { ...(base.body as Record<string, unknown>), organizerId: m.viewer === 'owner' ? ORGANIZER_ID : 'user-someone-else' };
    return { status: 200, body: club };
  }
  if (path.match(new RegExp(`^/clubs/${uuid}/events$`)) && method === 'GET' && !m.events) return { status: 200, body: [] };

  if (!authed && (path.startsWith('/quizzes') || path.includes('/quizzes'))) return { status: 401, body: { detail: 'no' } };

  if ((r = path.match(new RegExp(`^/clubs/(${uuid})/quizzes$`)))) {
    if (method === 'GET') return { status: 200, body: m.quizzes.filter((x) => x.clubId === r![1]) };
    if (method === 'POST') {
      const b = json();
      const id = `b1000000-0000-4000-8000-000000000${m.nextQuiz++}`;
      const created = quiz(id, String(b['title']), 'draft', { clubId: r[1]!, description: (b['description'] as string | null) ?? null, createdBy: USER_ID[m.viewer] });
      m.quizzes = [created, ...m.quizzes];
      m.questions[id] = [];
      return { status: 201, body: created };
    }
  }
  if ((r = path.match(new RegExp(`^/quizzes/(${uuid})$`)))) {
    const found = m.quizzes.find((x) => x.id === r![1]) ?? (r[1] === QZ.foreign ? foreign() : undefined);
    if (!found) return NOT_FOUND;
    if (method === 'GET') return { status: 200, body: found };
    if (method === 'PATCH') {
      const b = json();
      if (typeof b['title'] === 'string') found.title = b['title'];
      if ('description' in b) found.description = (b['description'] as string | null) ?? null;
      return { status: 200, body: found };
    }
  }
  if ((r = path.match(new RegExp(`^/quizzes/(${uuid})/active$`))) && method === 'PATCH') {
    const found = m.quizzes.find((x) => x.id === r![1]);
    if (!found) return NOT_FOUND;
    const on = json()['isActive'] === true;
    found.isActive = on;
    if (found.status === 'draft' && on) found.status = 'active';
    else if (found.status === 'active' && !on) found.status = 'draft';
    return { status: 200, body: found };
  }
  if ((r = path.match(new RegExp(`^/quizzes/(${uuid})/questions$`)))) {
    const id = r[1]!;
    if (!m.quizzes.some((x) => x.id === id) && id !== QZ.foreign) return NOT_FOUND;
    if (method === 'GET') return { status: 200, body: asViewer(m.questions[id] ?? []) };
    if (method === 'POST') {
      const b = json();
      const created: MockQuestion = {
        id: `b2000000-0000-4000-8000-000000000${m.nextQuestion++}`,
        quizId: id,
        question: String(b['question']),
        options: b['options'] as string[],
        correctIndex: Number(b['correctIndex']),
        position: (m.questions[id]?.length ?? 0) + 1,
      };
      (m.questions[id] ??= []).push(created);
      return { status: 201, body: created };
    }
  }
  if ((r = path.match(new RegExp(`^/quizzes/(${uuid})/questions/(${uuid})$`)))) {
    const list = m.questions[r[1]!] ?? [];
    const found = list.find((x) => x.id === r![2]);
    if (!found) return { status: 404, body: { detail: 'Question not found' } };
    if (method === 'PATCH') {
      Object.assign(found, json());
      return { status: 200, body: found };
    }
    if (method === 'DELETE') {
      m.questions[r[1]!] = list.filter((x) => x.id !== r![2]);
      return { status: 204 };
    }
  }
  if ((r = path.match(new RegExp(`^/quizzes/(${uuid})/attempts$`))) && method === 'POST') {
    const list = m.questions[r[1]!] ?? [];
    const answers = (json()['answers'] as number[]) ?? [];
    const score = list.filter((x, i) => answers[i] === x.correctIndex).length;
    return { status: 201, body: { id: 'b4000000-0000-4000-8000-000000000001', quizId: r[1], userId: USER_ID[m.viewer], score, total: list.length, answers } };
  }
  if ((r = path.match(new RegExp(`^/quizzes/(${uuid})/sessions$`))) && method === 'POST') {
    const found = m.quizzes.find((x) => x.id === r![1]);
    if (!found) return NOT_FOUND;
    const s = liveSession({ quizId: found.id, eventId: (json()['eventId'] as string | null) ?? null, participantCount: 0 });
    m.sessions[found.id] = s;
    found.status = 'live';
    return { status: 201, body: s };
  }
  if ((r = path.match(new RegExp(`^/quizzes/(${uuid})/sessions/active$`))) && method === 'GET') {
    const s = m.sessions[r[1]!];
    return s && !s.closedAt ? { status: 200, body: s } : { status: 404, body: { detail: 'No active session' } };
  }
  if ((r = path.match(new RegExp(`^/quizzes/(${uuid})/sessions/(${uuid})/leaderboard$`))) && method === 'GET') return { status: 200, body: { entries: m.leaderboard } };
  if ((r = path.match(new RegExp(`^/quizzes/(${uuid})/sessions/(${uuid})/close$`))) && method === 'PATCH') {
    const s = m.sessions[r[1]!];
    if (s) s.closedAt = '2026-10-01T20:00:00Z';
    const found = m.quizzes.find((x) => x.id === r![1]);
    if (found) found.status = 'closed';
    return { status: 204 };
  }
  return null;
}

const foreign = (): MockQuiz => quiz(QZ.foreign, 'Квіз іншого клубу', 'active', { clubId: OTHER_CLUB });
