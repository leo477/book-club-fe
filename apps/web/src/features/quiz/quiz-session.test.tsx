import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { gate, t } from '@/features/club-manage/test-support';
import { NEXT_ROUTES } from '@/features/organizer/test-support';
import { StranglerProvider } from '@/strangler/context';
import { API, eventJson, renderWithProviders, server, setupApiServer } from '@/test/harness';
import { QuizSession } from './quiz-session';
import { CLUB, QUIZ, SESSION, count, entryJson, mockViewer, quizJson, sessionJson } from './test-support';

const nav = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn(), hard: vi.fn(), toast: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: nav.push, replace: nav.replace }) }));
vi.mock('@/lib/navigate', () => ({ hardNavigate: nav.hard, replaceNavigate: vi.fn() }));
vi.mock('@/lib/toast', () => ({ showToast: nav.toast }));

setupApiServer();
beforeEach(() => Object.values(nav).forEach((fn) => fn.mockReset()));
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

const POLL_MS = 15_000;
const board = `/quizzes/${QUIZ}/sessions/${SESSION}/leaderboard`;
const entries = (n: number) => Array.from({ length: n }, (_, i) => entryJson(i + 1));

function setup({ session = sessionJson() as unknown, rows = entries(5) as unknown[], events = [eventJson({ id: 'e1', clubId: CLUB, title: 'Dune night', date: '2099-05-01T18:00:00Z' })] as unknown[] } = {}) {
  mockViewer('owner');
  server.use(
    http.get(`${API}/quizzes/${QUIZ}`, () => HttpResponse.json(quizJson({ status: 'live', isActive: true }))),
    http.get(`${API}/quizzes/${QUIZ}/sessions/active`, () => (session ? HttpResponse.json(session) : HttpResponse.json({ detail: 'No active session' }, { status: 404 }))),
    http.get(`${API}/clubs/${CLUB}/events`, () => HttpResponse.json(events)),
  );
  const hits = count(board, () => HttpResponse.json({ entries: rows }));
  const view = renderWithProviders(
    <StranglerProvider value={NEXT_ROUTES}>
      <QuizSession clubId={CLUB} quizId={QUIZ} />
    </StranglerProvider>,
  );
  return { hits, ...view };
}

// intervals only: the network, MSW and TanStack's own scheduling keep running on real timers
const fakeIntervals = () => vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] });
// the refresh button reads "refreshing" while a request is in flight; a request being sent is not it being settled
const settled = () => screen.findByRole('button', { name: t('QUIZ.session_refresh') });
const tick = (ms: number) => act(() => vi.advanceTimersByTimeAsync(ms));
const setVisibility = (state: 'visible' | 'hidden') => {
  vi.spyOn(document, 'visibilityState', 'get').mockReturnValue(state);
  document.dispatchEvent(new Event('visibilitychange', { bubbles: true }));
};

describe('QuizSession without a running session', () => {
  it('offers the club events and starts a session for the chosen one', async () => {
    const user = userEvent.setup();
    const started: unknown[] = [];
    setup({ session: null });
    server.use(
      http.post(`${API}/quizzes/${QUIZ}/sessions`, async ({ request }) => {
        started.push(await request.json());
        return HttpResponse.json(sessionJson(), { status: 201 });
      }),
    );
    expect(await screen.findByRole('heading', { level: 2, name: t('QUIZ.session_start_heading') })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(t('QUIZ.session_title'));
    const select = await screen.findByRole('combobox', { name: t('QUIZ.session_pick_event_label') });
    const start = screen.getByRole('button', { name: t('QUIZ.session_start') });
    expect(start).toBeDisabled();
    await screen.findByRole('option', { name: /Dune night — 1 травня 2099/ });
    await user.selectOptions(select, 'e1');
    await user.click(start);
    expect(await screen.findByText(t('QUIZ.session_live'))).toBeInTheDocument();
    expect(started).toEqual([{ eventId: 'e1' }]);
    expect(screen.getByText(new RegExp(`7 ${t('QUIZ.session_participants')}`))).toBeInTheDocument();
  });

  it('says so when the club has no events', async () => {
    setup({ session: null, events: [] });
    expect(await screen.findByText(t('QUIZ.session_no_events'))).toBeInTheDocument();
    expect(screen.getByRole('button', { name: t('QUIZ.session_start') })).toBeDisabled();
  });

  it('retries a failed session lookup', async () => {
    const user = userEvent.setup();
    setup();
    let failing = true;
    server.use(http.get(`${API}/quizzes/${QUIZ}/sessions/active`, () => (failing ? new HttpResponse(null, { status: 500 }) : HttpResponse.json(sessionJson()))));
    await screen.findByRole('button', { name: t('ERRORS.retry') });
    failing = false;
    await user.click(screen.getByRole('button', { name: t('ERRORS.retry') }));
    expect(await screen.findByText(t('QUIZ.session_live'))).toBeInTheDocument();
  });
});

describe('QuizSession running', () => {
  it('shows the podium for the top three and a table for the rest', async () => {
    setup();
    await screen.findByText('Player 1');
    const standings = screen.getByRole('list', { name: t('QUIZ.leaderboard_title') });
    expect(within(standings).getAllByRole('listitem')).toHaveLength(3);
    expect(within(standings).getByText('Player 1')).toBeInTheDocument();
    expect(within(standings).getByText('9/10')).toBeInTheDocument();
    const table = await screen.findByRole('table');
    expect(within(table).getAllByRole('columnheader').map((h) => h.textContent)).toEqual([t('QUIZ.leaderboard_rank'), t('QUIZ.leaderboard_player'), t('QUIZ.leaderboard_score'), t('QUIZ.leaderboard_status')]);
    expect(within(table).getAllByRole('row')).toHaveLength(3);
    expect(within(table).getByText('Player 5')).toBeInTheDocument();
  });

  it('shows only safe avatar URLs', async () => {
    setup({ rows: [entryJson(1, { avatarUrl: 'https://img.example/a.png' }), entryJson(2, { avatarUrl: 'javascript:alert(1)' })] });
    const standings = await screen.findByRole('list', { name: t('QUIZ.leaderboard_title') });
    await within(standings).findByText('Player 1');
    expect([...standings.querySelectorAll('img')].map((img) => img.getAttribute('src'))).toEqual(['https://img.example/a.png']);
    expect(standings.querySelector('[src^="javascript"]')).toBeNull();
  });

  it('waits for participants with an empty-state message', async () => {
    setup({ rows: [] });
    expect(await screen.findByText(t('QUIZ.session_no_participants'))).toBeInTheDocument();
  });

  it('refreshes the leaderboard every 15 seconds and on demand', async () => {
    fakeIntervals();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const { hits } = setup();
    await screen.findByRole('table');
    expect(hits.n).toBe(1);
    await tick(POLL_MS - 1);
    expect(hits.n).toBe(1);
    await tick(1);
    await vi.waitFor(() => expect(hits.n).toBe(2));
    await settled();
    await tick(POLL_MS);
    await vi.waitFor(() => expect(hits.n).toBe(3));
    await user.click(await settled());
    await vi.waitFor(() => expect(hits.n).toBe(4));
    await settled();
  });

  it('pauses while the tab is hidden and catches up once when it is visible again', async () => {
    fakeIntervals();
    const { hits } = setup();
    await screen.findByRole('table');
    setVisibility('hidden');
    await tick(POLL_MS * 4);
    expect(hits.n).toBe(1);
    setVisibility('visible');
    await vi.waitFor(() => expect(hits.n).toBe(2));
    await settled();
    await tick(POLL_MS);
    await vi.waitFor(() => expect(hits.n).toBe(3));
  });

  it('stops polling when the page is left', async () => {
    fakeIntervals();
    const { hits, unmount } = setup();
    await screen.findByRole('table');
    unmount();
    await tick(POLL_MS * 5);
    expect(hits.n).toBe(1);
  });

  it('keeps the standings on screen when a refresh fails', async () => {
    fakeIntervals();
    setup();
    await screen.findByRole('table');
    server.use(http.get(`${API}${board}`, () => new HttpResponse(null, { status: 404 })));
    await tick(POLL_MS);
    await waitFor(() => expect(screen.getByRole('button', { name: t('QUIZ.session_refresh') })).toBeEnabled());
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('ends the session once and returns to the list', async () => {
    const user = userEvent.setup();
    const hold = gate();
    const closed = count(`/quizzes/${QUIZ}/sessions/${SESSION}/close`, async () => {
      await hold.open;
      return new HttpResponse(null, { status: 204 });
    }, 'patch');
    setup();
    const end = await screen.findByRole('button', { name: t('QUIZ.session_end') });
    await user.dblClick(end);
    await waitFor(() => expect(screen.getByRole('button', { name: t('QUIZ.session_ending') })).toBeDisabled());
    hold.release();
    await waitFor(() => expect(nav.push).toHaveBeenCalledWith(`/clubs/${CLUB}/quizzes`));
    expect(closed.n).toBe(1);
  });

  it('stays on the page and says why when ending is refused', async () => {
    const user = userEvent.setup();
    setup();
    server.use(http.patch(`${API}/quizzes/${QUIZ}/sessions/${SESSION}/close`, () => HttpResponse.json({ detail: 'Already closed' }, { status: 400 })));
    await user.click(await screen.findByRole('button', { name: t('QUIZ.session_end') }));
    await waitFor(() => expect(nav.toast).toHaveBeenCalledWith('error', 'Already closed'));
    expect(nav.push).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.getByRole('button', { name: t('QUIZ.session_end') })).toBeEnabled());
  });
});
