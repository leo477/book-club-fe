import { HttpResponse, http } from 'msw';
import { API, clubJson, server, userJson } from '@/test/harness';

export const CLUB = '3f2b8c1e-9a4d-4e7b-8c5f-1a2b3c4d5e6f';
export const QUIZ = '9d0e1f2a-3b4c-4d5e-8f60-718293a4b5c6';
export const SESSION = 'a1b2c3d4-0000-4000-8000-000000000001';

export const quizJson = (overrides: Record<string, unknown> = {}) => ({
  id: QUIZ,
  clubId: CLUB,
  createdBy: 'u1',
  title: 'Dune quiz',
  description: 'About Arrakis',
  isActive: false,
  status: 'draft',
  ...overrides,
});

export const questionJson = (overrides: Record<string, unknown> = {}) => ({
  id: 'q1',
  quizId: QUIZ,
  question: 'Who rules Arrakis?',
  options: ['Harkonnen', 'Atreides', 'Corrino', 'Fremen'],
  correctIndex: 1,
  position: 0,
  ...overrides,
});

export const sessionJson = (overrides: Record<string, unknown> = {}) => ({
  id: SESSION,
  quizId: QUIZ,
  eventId: 'e1',
  startedBy: 'u1',
  startedAt: '2099-05-01T18:30:00Z',
  closedAt: null,
  participantCount: 7,
  ...overrides,
});

export const entryJson = (rank: number, overrides: Record<string, unknown> = {}) => ({
  rank,
  userId: `p${rank}`,
  displayName: `Player ${rank}`,
  avatarUrl: null,
  score: 10 - rank,
  totalQuestions: 10,
  hasAttempted: true,
  ...overrides,
});

/** The viewer is the club's owner (`organizer`), a plain member, or an organizer of the club who is not its owner. */
export function mockViewer(kind: 'owner' | 'member' | 'co-organizer' | 'outsider', globalRole = 'user') {
  server.use(
    http.get(`${API}/clubs/${CLUB}`, () => HttpResponse.json(clubJson({ id: CLUB, organizerId: kind === 'owner' ? 'u1' : 'someone' }))),
    http.get(`${API}/clubs/${CLUB}/my-membership`, () =>
      HttpResponse.json(
        kind === 'outsider'
          ? { isMember: false, role: null, joinRequestStatus: 'none' }
          : { isMember: true, role: kind === 'co-organizer' ? 'organizer' : 'member', joinRequestStatus: 'none' },
      ),
    ),
    http.get(`${API}/auth/session-status`, () => HttpResponse.json({ hasSession: true })),
    http.get(`${API}/auth/me`, () => HttpResponse.json(userJson({ id: 'u1', role: globalRole }))),
    http.get(`${API}/clubs/my`, () => HttpResponse.json([])),
  );
}

/** Counts requests to one URL (GET unless told otherwise) while answering with `respond`. */
export function count(path: string, respond: () => Response | Promise<Response>, method: 'get' | 'post' | 'patch' = 'get') {
  const hits = { n: 0 };
  server.use(
    http[method](`${API}${path}`, () => {
      hits.n += 1;
      return respond();
    }),
  );
  return hits;
}
