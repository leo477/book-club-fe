// Deterministic API for the R8 (/profile, /support, /support/new) parity specs. Every /api/v1 call is fulfilled through
// page.route, so no backend and no seeded persona is involved. The profile user and the submissions are mutable so that a
// PATCH/POST is visible to the next GET (and to a refetch of /auth/me), like the real backend.
import type { Page } from '@playwright/test';
import { handleApi, newState, type MockState, type Role } from '../r6/fixtures';

export interface MockUser {
  id: string;
  email: string;
  displayName: string;
  role: 'user' | 'organizer' | 'admin';
  avatarUrl: null;
  createdAt: string;
  socialsPublic: boolean;
  socials: Record<string, string>;
}

export interface MockSubmission {
  id: string;
  authorId: string;
  type: 'complaint' | 'suggestion' | 'comment';
  title: string;
  body: string;
  status: 'open' | 'pending' | 'approved' | 'rejected' | 'in_progress' | 'done';
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  likedByMe: boolean;
}

export const SUB_IDS = {
  complaint: 'a8000000-0000-4000-8000-000000000001',
  comment: 'a8000000-0000-4000-8000-000000000002',
  pending: 'a8000000-0000-4000-8000-000000000003',
  approved: 'a8000000-0000-4000-8000-000000000004',
  inProgress: 'a8000000-0000-4000-8000-000000000005',
  done: 'a8000000-0000-4000-8000-000000000006',
  rejected: 'a8000000-0000-4000-8000-000000000007',
} as const;

const sub = (id: string, over: Partial<MockSubmission>): MockSubmission => ({
  id,
  authorId: 'user-other',
  type: 'suggestion',
  title: 'Заголовок',
  body: 'Опис звернення для перевірки',
  status: 'open',
  createdAt: '2026-09-01T10:00:00Z',
  updatedAt: '2026-09-01T10:00:00Z',
  likeCount: 0,
  likedByMe: false,
  ...over,
});

export const freshSubmissions = (): MockSubmission[] => [
  sub(SUB_IDS.complaint, {
    type: 'complaint',
    title: 'Скарга перша',
    status: 'open',
    likeCount: 3,
  }),
  sub(SUB_IDS.comment, {
    type: 'comment',
    title: 'Коментар перший',
    status: 'open',
    likeCount: 1,
    likedByMe: true,
  }),
  sub(SUB_IDS.pending, { title: 'Ідея на розгляді', status: 'pending' }),
  sub(SUB_IDS.approved, { title: 'Ідея схвалена', status: 'approved' }),
  sub(SUB_IDS.inProgress, { title: 'Ідея в роботі', status: 'in_progress' }),
  sub(SUB_IDS.done, { title: 'Ідея готова', status: 'done' }),
  sub(SUB_IDS.rejected, { title: 'Ідея відхилена', status: 'rejected' }),
];

export interface ProfileMock {
  state: MockState;
  user: MockUser;
  submissions: MockSubmission[];
  log: { method: string; path: string; query: string; body: string | null }[];
  /** forced status per generic key, e.g. `PATCH /users/me` */
  fail: Record<string, number>;
  stats: 'ok' | 'fail';
}

const userFor = (role: Role): MockUser => ({
  id: 'user-member',
  email: 'mock@example.test',
  displayName: 'Максим Учасник',
  role:
    role === 'admin' ? 'admin' : role === 'organizer' ? 'organizer' : 'user',
  avatarUrl: null,
  createdAt: '2026-01-15T00:00:00Z',
  socialsPublic: false,
  socials: { telegram: 'maxim_reads' },
});

export async function installProfileMock(
  page: Page,
  role: Role,
  opts: {
    latency?: Record<string, number>;
    fail?: Record<string, number>;
    stats?: 'ok' | 'fail';
    submissions?: MockSubmission[];
  } = {},
): Promise<ProfileMock> {
  const mock: ProfileMock = {
    state: newState(role),
    user: userFor(role),
    submissions: opts.submissions ?? freshSubmissions(),
    log: [],
    fail: opts.fail ?? {},
    stats: opts.stats ?? 'ok',
  };
  await page.route('**/api/v1/**', async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    const path = url.pathname.replace(/^\/api\/v1/, '');
    const body = req.postData();
    mock.log.push({ method: req.method(), path, query: url.search, body });
    const generic = `${req.method()} ${path.replace(/[0-9a-f-]{36}/g, ':id')}`;
    const wait = opts.latency?.[generic];
    if (wait) await new Promise((r) => setTimeout(r, wait));
    const reply =
      handleProfile(mock, req.method(), path, body, generic) ??
      handleApi(mock.state, req.method(), path, url.search, body);
    await route.fulfill({
      status: reply.status,
      contentType: 'application/json',
      body: reply.body === undefined ? '' : JSON.stringify(reply.body),
    });
  });
  await page.routeWebSocket(/^(?!.*_next).*$/, (ws) => void ws.close());
  return mock;
}

function handleProfile(
  m: ProfileMock,
  method: string,
  path: string,
  raw: string | null,
  generic: string,
): { status: number; body?: unknown } | null {
  const authed = m.state.role !== 'guest';
  const forced = m.fail[generic];
  if (forced) return { status: forced, body: { detail: 'forced failure' } };
  const json = (): Record<string, unknown> => {
    try {
      return raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
    } catch {
      return {};
    }
  };

  if (method === 'GET' && path === '/auth/me')
    return authed
      ? { status: 200, body: m.user }
      : { status: 401, body: { detail: 'no' } };
  if (method === 'POST' && path === '/auth/refresh')
    return authed
      ? {
          status: 200,
          body: { accessToken: 'mock', refreshToken: 'mock', user: m.user },
        }
      : { status: 401, body: { detail: 'no' } };
  if (!authed && (path.startsWith('/users') || path.startsWith('/support')))
    return { status: 401, body: { detail: 'no' } };

  if (method === 'GET' && path === '/users/me')
    return { status: 200, body: m.user };
  if (method === 'GET' && path === '/users/me/stats')
    return m.stats === 'fail'
      ? { status: 404, body: { detail: 'no stats' } }
      : {
          status: 200,
          body: {
            clubsJoined: 4,
            quizzesTaken: 7,
            quizWins: 2,
            likesReceived: 11,
            booksRead: 9,
          },
        };
  if (method === 'PATCH' && path === '/users/me') {
    const b = json();
    if (typeof b['displayName'] === 'string')
      m.user.displayName = b['displayName'];
    return { status: 200, body: m.user };
  }
  if (method === 'PATCH' && path === '/users/me/role') {
    m.user.role = json()['role'] as MockUser['role'];
    return { status: 200, body: m.user };
  }
  if (method === 'PATCH' && path === '/users/me/socials') {
    m.user.socials = json() as Record<string, string>;
    return { status: 200, body: m.user };
  }
  if (method === 'PATCH' && path === '/users/me/socials-visibility') {
    m.user.socialsPublic = json()['socialsPublic'] === true;
    return { status: 200, body: m.user };
  }

  if (method === 'GET' && path === '/support')
    return { status: 200, body: m.submissions };
  if (method === 'POST' && path === '/support') {
    const b = json();
    const created = sub(
      `a8000000-0000-4000-8000-0000000001${String(m.submissions.length).padStart(2, '0')}`,
      {
        authorId: m.user.id,
        type: b['type'] as MockSubmission['type'],
        title: String(b['title']),
        body: String(b['body']),
        status: b['type'] === 'suggestion' ? 'pending' : 'open',
      },
    );
    m.submissions = [created, ...m.submissions];
    return { status: 201, body: created };
  }
  const match = path.match(/^\/support\/([0-9a-f-]{36})\/(status|like)$/);
  if (match) {
    const s = m.submissions.find((x) => x.id === match[1]);
    if (!s) return { status: 404, body: { detail: 'not found' } };
    if (match[2] === 'status' && method === 'PATCH') {
      if (m.user.role !== 'admin')
        return { status: 403, body: { detail: 'admin only' } };
      s.status = json()['status'] as MockSubmission['status'];
      return { status: 200, body: s };
    }
    if (match[2] === 'like' && method === 'POST') {
      if (!s.likedByMe) {
        s.likedByMe = true;
        s.likeCount += 1;
      }
      return { status: 200, body: s };
    }
    if (match[2] === 'like' && method === 'DELETE') {
      if (s.likedByMe) {
        s.likedByMe = false;
        s.likeCount -= 1;
      }
      return { status: 204 };
    }
  }
  return null;
}
