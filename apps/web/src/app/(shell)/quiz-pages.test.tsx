import { screen, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { NextIntlClientProvider } from 'next-intl';
import type { ReactNode } from 'react';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { nest } from '@/i18n/locale';
import { NEXT_ROUTES } from '@/features/organizer/test-support';
import { CLUB, QUIZ, SESSION, entryJson, mockViewer, questionJson, quizJson, sessionJson } from '@/features/quiz/test-support';
import { StranglerProvider } from '@/strangler/context';
import { API, messages, renderWithProviders, server, setupApiServer } from '@/test/harness';
import QuizListPage, { generateMetadata as listMeta } from './clubs/[id]/quizzes/page';
import QuizCreatePage, { generateMetadata as createMeta } from './clubs/[id]/quizzes/create/page';
import QuizTakePage, { generateMetadata as takeMeta } from './clubs/[id]/quizzes/[quizId]/page';
import QuizEditPage, { generateMetadata as editMeta } from './clubs/[id]/quizzes/[quizId]/edit/page';
import QuizPreviewPage, { generateMetadata as previewMeta } from './clubs/[id]/quizzes/[quizId]/preview/page';
import QuizSessionPage, { generateMetadata as sessionMeta } from './clubs/[id]/quizzes/[quizId]/session/page';
import QuizLeaderboardPage, { generateMetadata as leaderboardMeta } from './clubs/[id]/quizzes/[quizId]/leaderboard/page';

const nav = vi.hoisted(() => ({ replace: vi.fn(), hard: vi.fn(), toast: vi.fn(), missing: [] as string[] }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: nav.replace }),
  notFound: () => {
    throw new Error('NEXT_NOT_FOUND');
  },
}));
vi.mock('@/lib/navigate', () => ({ hardNavigate: vi.fn(), replaceNavigate: nav.hard }));
vi.mock('@/lib/toast', () => ({ showToast: nav.toast }));
// like the real wrapper, ship only the listed namespaces, so a screen that needs another one reports a missing message
vi.mock('@/components/namespaces-intl', async () => {
  const { messages, nest } = await import('@/test/harness').then(async (h) => ({ messages: h.messages, nest: (await import('@/i18n/locale')).nest }));
  const all = nest(messages.uk);
  return {
    NamespacesIntl: ({ namespaces, children }: { namespaces: readonly string[]; children: ReactNode }) => (
      <NextIntlClientProvider locale="uk" messages={Object.fromEntries(namespaces.map((ns) => [ns, all[ns]]))} onError={(error) => nav.missing.push(error.message)}>
        {children}
      </NextIntlClientProvider>
    ),
  };
});
vi.mock('next-intl/server', async () => {
  const { messages } = await import('@/test/harness');
  return {
    getLocale: async () => 'uk',
    getMessages: async () => nest(messages.uk),
    getTranslations: async () => (key: string) => messages.uk[key] ?? key,
  };
});

setupApiServer();
// each organizer page lazy-loads its screen; a cold transform under load would otherwise eat the findBy budget
beforeAll(async () => {
  await Promise.all([import('@/features/quiz/quiz-create'), import('@/features/quiz/quiz-edit'), import('@/features/quiz/quiz-preview'), import('@/features/quiz/quiz-session')]);
}, 30_000);
beforeEach(() => {
  nav.replace.mockReset();
  nav.hard.mockReset();
  nav.toast.mockReset();
  nav.missing.length = 0;
});

const UPPER = CLUB.toUpperCase();
const QUIZ_UPPER = QUIZ.toUpperCase();
const params = (id: string, quizId: string = QUIZ) => ({ params: Promise.resolve({ id, quizId }) });

const pages = [
  { name: '/clubs/:id/quizzes', el: () => QuizListPage(params(UPPER)), meta: () => listMeta(params(UPPER)), path: '', organizer: false, heading: 'QUIZ.title' },
  { name: '/clubs/:id/quizzes/create', el: () => QuizCreatePage(params(UPPER)), meta: () => createMeta(params(UPPER)), path: '/create', organizer: true, heading: 'QUIZ.create_heading' },
  { name: '/clubs/:id/quizzes/:quizId', el: () => QuizTakePage(params(UPPER, QUIZ_UPPER)), meta: () => takeMeta(params(UPPER, QUIZ_UPPER)), path: `/${QUIZ}`, organizer: false, heading: null },
  { name: '/clubs/:id/quizzes/:quizId/edit', el: () => QuizEditPage(params(UPPER, QUIZ_UPPER)), meta: () => editMeta(params(UPPER, QUIZ_UPPER)), path: `/${QUIZ}/edit`, organizer: true, heading: 'QUIZ.edit_title' },
  { name: '/clubs/:id/quizzes/:quizId/preview', el: () => QuizPreviewPage(params(UPPER, QUIZ_UPPER)), meta: () => previewMeta(params(UPPER, QUIZ_UPPER)), path: `/${QUIZ}/preview`, organizer: true, heading: 'QUIZ.preview_heading' },
  { name: '/clubs/:id/quizzes/:quizId/session', el: () => QuizSessionPage(params(UPPER, QUIZ_UPPER)), meta: () => sessionMeta(params(UPPER, QUIZ_UPPER)), path: `/${QUIZ}/session`, organizer: true, heading: 'QUIZ.session_title' },
  { name: '/clubs/:id/quizzes/:quizId/leaderboard', el: () => QuizLeaderboardPage(params(UPPER, QUIZ_UPPER)), meta: () => leaderboardMeta(params(UPPER, QUIZ_UPPER)), path: `/${QUIZ}/leaderboard`, organizer: false, heading: 'QUIZ.leaderboard_title' },
];

function mockData() {
  server.use(
    http.get(`${API}/clubs/${CLUB}/quizzes`, () => HttpResponse.json([quizJson({ status: 'active', isActive: true })])),
    http.get(`${API}/quizzes/${QUIZ}`, () => HttpResponse.json(quizJson({ status: 'active', isActive: true }))),
    http.get(`${API}/quizzes/${QUIZ}/questions`, () => HttpResponse.json([questionJson()])),
    http.get(`${API}/quizzes/${QUIZ}/sessions/active`, () => HttpResponse.json(sessionJson())),
    http.get(`${API}/quizzes/${QUIZ}/sessions/${SESSION}/leaderboard`, () => HttpResponse.json({ entries: [entryJson(1)] })),
    http.get(`${API}/clubs/${CLUB}/events`, () => HttpResponse.json([])),
  );
}

const render = async (el: () => Promise<ReactNode>) => renderWithProviders(<StranglerProvider value={NEXT_ROUTES}>{await el()}</StranglerProvider>);
const h1 = (key: string | null) => screen.findByRole('heading', { level: 1, ...(key ? { name: new RegExp(messages.uk[key] ?? key) } : {}) }, { timeout: 5000 });

describe('quiz pages: metadata', () => {
  it.each(pages)('$name is titled, never indexed and canonical in lower case', async ({ meta, path }) => {
    const metadata = await meta();
    expect(metadata.title).toBe(messages.uk['SEO.clubs_title']);
    expect(metadata.robots).toEqual({ index: false, follow: true });
    expect(String(metadata.alternates?.canonical)).toMatch(new RegExp(`/clubs/${CLUB}/quizzes${path}$`));
  });
});

describe('quiz pages: id parameters', () => {
  const calls = [
    ['/clubs/:id/quizzes', (id: string) => QuizListPage(params(id))],
    ['/clubs/:id/quizzes/create', (id: string) => QuizCreatePage(params(id))],
  ] as const;
  const withQuiz = [
    ['/clubs/:id/quizzes/:quizId', QuizTakePage],
    ['/clubs/:id/quizzes/:quizId/edit', QuizEditPage],
    ['/clubs/:id/quizzes/:quizId/preview', QuizPreviewPage],
    ['/clubs/:id/quizzes/:quizId/session', QuizSessionPage],
    ['/clubs/:id/quizzes/:quizId/leaderboard', QuizLeaderboardPage],
  ] as const;

  it.each(calls)('%s answers 404 for a club id that is not a UUID', async (_name, page) => {
    await expect(page('create')).rejects.toThrow('NEXT_NOT_FOUND');
    await expect(page('../../auth/me')).rejects.toThrow('NEXT_NOT_FOUND');
  });

  it.each(withQuiz)('%s answers 404 for a club id or a quiz id that is not a UUID', async (_name, page) => {
    await expect(page(params('create', QUIZ))).rejects.toThrow('NEXT_NOT_FOUND');
    await expect(page(params(CLUB, 'create'))).rejects.toThrow('NEXT_NOT_FOUND');
    await expect(page(params(CLUB, '../../auth/me'))).rejects.toThrow('NEXT_NOT_FOUND');
  });
});

describe.each(pages)('$name page', ({ el, organizer, heading }) => {
  it('renders for the club owner with every message it needs in the shipped namespaces', async () => {
    mockViewer('owner');
    mockData();
    await render(el);
    await h1(heading);
    expect(nav.missing).toEqual([]);
  });

  it('sends a guest to /login', async () => {
    server.use(http.get(`${API}/auth/session-status`, () => HttpResponse.json({ hasSession: false })));
    await render(el);
    await waitFor(() => expect(nav.hard).toHaveBeenCalledWith('/login'));
  });

  if (organizer) {
    it.each([['a plain member', 'member', 'user'], ['a global organizer who is not in the club', 'outsider', 'organizer']] as const)('turns %s away with the organizers-only notice', async (_label, viewer, role) => {
      mockViewer(viewer, role);
      mockData();
      await render(el);
      await waitFor(() => expect(nav.replace).toHaveBeenCalledWith('/clubs'));
      expect(nav.toast).toHaveBeenCalledWith('error', messages.uk['ERRORS.organizers_only'] ?? '');
      expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
    });

    it('admits a member who organizes this club', async () => {
      mockViewer('co-organizer');
      mockData();
      await render(el);
      await h1(heading);
      expect(nav.missing).toEqual([]);
    });
  } else {
    it('admits a plain member', async () => {
      mockViewer('member');
      mockData();
      await render(el);
      await h1(heading);
      expect(nav.replace).not.toHaveBeenCalled();
      expect(nav.missing).toEqual([]);
    });
  }
});
