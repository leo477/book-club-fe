import { act, screen } from '@testing-library/react';
import type { QueryClient } from '@tanstack/react-query';
import { HttpResponse, http } from 'msw';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { t } from '@/features/club-manage/test-support';
import { NEXT_ROUTES } from '@/features/organizer/test-support';
import { StranglerProvider } from '@/strangler/context';
import { API, renderWithProviders, server, setupApiServer } from '@/test/harness';
import { QuizLeaderboard } from './quiz-leaderboard';
import { CLUB, QUIZ, SESSION, count, entryJson, mockViewer, quizJson, sessionJson } from './test-support';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), replace: vi.fn() }) }));
vi.mock('@/lib/navigate', () => ({ hardNavigate: vi.fn(), replaceNavigate: vi.fn() }));
vi.mock('@/lib/toast', () => ({ showToast: vi.fn() }));

setupApiServer();
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

const POLL_MS = 30_000;
const board = `/quizzes/${QUIZ}/sessions/${SESSION}/leaderboard`;

function setup({ session = sessionJson() as unknown, rows = [entryJson(1), entryJson(2), entryJson(3), entryJson(4)] as unknown[] } = {}) {
  mockViewer('member');
  server.use(
    http.get(`${API}/quizzes/${QUIZ}`, () => HttpResponse.json(quizJson({ status: 'live', isActive: true }))),
    http.get(`${API}/quizzes/${QUIZ}/sessions/active`, () => (session ? HttpResponse.json(session) : HttpResponse.json({ detail: 'No active session' }, { status: 404 }))),
  );
  const hits = count(board, () => HttpResponse.json({ entries: rows }));
  const view = renderWithProviders(
    <StranglerProvider value={NEXT_ROUTES}>
      <QuizLeaderboard clubId={CLUB} quizId={QUIZ} />
    </StranglerProvider>,
  );
  return { hits, ...view };
}

const fakeIntervals = () => vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] });
// a request reaching MSW is not it settling; the query client reports an in-flight fetch synchronously
const settled = (queryClient: QueryClient) => vi.waitFor(() => expect(queryClient.isFetching()).toBe(0));
const tick = (ms: number) => act(() => vi.advanceTimersByTimeAsync(ms));
const setVisibility = (state: 'visible' | 'hidden') => {
  vi.spyOn(document, 'visibilityState', 'get').mockReturnValue(state);
  document.dispatchEvent(new Event('visibilitychange', { bubbles: true }));
};

describe('QuizLeaderboard', () => {
  it('shows the standings of the running session to any member, with a way back', async () => {
    setup();
    expect(await screen.findByText('Player 1')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(t('QUIZ.leaderboard_title'));
    expect(screen.getByText(t('QUIZ.leaderboard_refresh_hint'))).toBeInTheDocument();
    expect(screen.getByRole('table')).toHaveTextContent('Player 4');
    expect(screen.getByRole('link', { name: t('QUIZ.back_to_quizzes') })).toHaveAttribute('href', `/clubs/${CLUB}/quizzes`);
  });

  it('says there is no session, and never asks for a leaderboard', async () => {
    const { hits } = setup({ session: null });
    expect(await screen.findByRole('heading', { level: 2, name: t('QUIZ.no_active_session') })).toBeInTheDocument();
    expect(screen.getByText(t('QUIZ.no_active_session_hint'))).toBeInTheDocument();
    expect(hits.n).toBe(0);
  });

  it('says nobody has taken part yet', async () => {
    setup({ rows: [] });
    expect(await screen.findByText(t('QUIZ.leaderboard_empty'))).toBeInTheDocument();
  });

  it('polls every 30 seconds, one request per period', async () => {
    fakeIntervals();
    const { hits, queryClient } = setup();
    await screen.findByText('Player 1');
    expect(hits.n).toBe(1);
    await tick(POLL_MS - 1);
    expect(hits.n).toBe(1);
    await tick(1);
    await vi.waitFor(() => expect(hits.n).toBe(2));
    await settled(queryClient);
    await tick(POLL_MS);
    await vi.waitFor(() => expect(hits.n).toBe(3));
    await settled(queryClient);
    await tick(POLL_MS);
    await vi.waitFor(() => expect(hits.n).toBe(4));
    await settled(queryClient);
    await tick(POLL_MS);
    await vi.waitFor(() => expect(hits.n).toBe(5));
  });

  it('pauses in a hidden tab and refreshes once on return', async () => {
    fakeIntervals();
    const { hits } = setup();
    await screen.findByText('Player 1');
    setVisibility('hidden');
    await tick(POLL_MS * 3);
    expect(hits.n).toBe(1);
    setVisibility('visible');
    await vi.waitFor(() => expect(hits.n).toBe(2));
  });

  it('stops polling when the page is left', async () => {
    fakeIntervals();
    const { hits, unmount } = setup();
    await screen.findByText('Player 1');
    unmount();
    await tick(POLL_MS * 4);
    expect(hits.n).toBe(1);
  });

  it('shows new standings after a poll', async () => {
    fakeIntervals();
    setup();
    await screen.findByText('Player 1');
    server.use(http.get(`${API}${board}`, () => HttpResponse.json({ entries: [entryJson(1, { displayName: 'Newcomer' })] })));
    await tick(POLL_MS);
    expect(await screen.findByText('Newcomer')).toBeInTheDocument();
    expect(screen.queryByText('Player 1')).not.toBeInTheDocument();
  });
});
