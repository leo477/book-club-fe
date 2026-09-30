import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { API, clubJson, messages, renderWithProviders, roundJson, server, setupApiServer, userJson } from '@/test/harness';
import { BookVote } from './book-vote';

const toast = vi.hoisted(() => vi.fn());
vi.mock('@/lib/toast', () => ({ showToast: toast }));
vi.mock('@/lib/navigate', () => ({ hardNavigate: vi.fn() }));

setupApiServer();
beforeEach(() => toast.mockReset());

const t = (key: string) => messages.uk[key] ?? key;
const club = { id: 'c1', organizerId: 'o1' };

function mockApi({ user = 'u1', mine = true, rounds }: { user?: string | null; mine?: boolean; rounds: (Record<string, unknown> | null)[] }) {
  const gets: number[] = [];
  let i = 0;
  server.use(
    http.get(`${API}/auth/session-status`, () => HttpResponse.json({ hasSession: user !== null })),
    http.get(`${API}/auth/me`, () => HttpResponse.json(userJson({ id: user }))),
    http.get(`${API}/clubs/my`, () => HttpResponse.json(mine ? [clubJson({ id: 'c1' })] : [])),
    http.get(`${API}/clubs/c1/book-vote/round`, () => {
      gets.push(i);
      const round = rounds[Math.min(i, rounds.length - 1)] ?? null;
      i += 1;
      return HttpResponse.json(round);
    }),
  );
  return gets;
}

describe('BookVote visibility', () => {
  it('renders nothing for guests and for signed-in non-members, without fetching the round', async () => {
    const gets = mockApi({ user: null, rounds: [roundJson()] });
    const { container, unmount } = renderWithProviders(<BookVote club={club} />);
    await new Promise((r) => setTimeout(r, 30));
    expect(container).toBeEmptyDOMElement();
    unmount();
    mockApi({ mine: false, rounds: [roundJson()] });
    const again = renderWithProviders(<BookVote club={club} />);
    await new Promise((r) => setTimeout(r, 50));
    expect(again.container).toBeEmptyDOMElement();
    expect(gets).toEqual([]);
  });

  it('renders nothing for a member when there is no round', async () => {
    const gets = mockApi({ rounds: [null] });
    const { container } = renderWithProviders(<BookVote club={club} />);
    await waitFor(() => expect(gets).toHaveLength(1));
    await new Promise((r) => setTimeout(r, 20));
    expect(container).toBeEmptyDOMElement();
  });
});

describe('BookVote as member', () => {
  it('shows a skeleton, then options with percentages and pluralised votes', async () => {
    mockApi({ rounds: [roundJson({ options: [{ id: 'b1', title: 'Dune', author: 'Herbert', votes: 1, hasVoted: false }, { id: 'b2', title: 'Emma', author: '', votes: 3, hasVoted: true }], totalVotes: 4 })] });
    renderWithProviders(<BookVote club={club} />);
    expect(await screen.findByText('Dune')).toBeInTheDocument();
    expect(screen.getByText('1 голос · 25%')).toBeInTheDocument();
    expect(screen.getByText('3 голоси · 75%')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: `✓ ${t('BOOK_VOTE.voted')}` })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.queryByRole('button', { name: t('BOOK_VOTE.close_round') })).toBeNull();
    expect(screen.queryByRole('textbox')).toBeNull();
    expect(screen.queryByRole('button', { name: t('BOOK_VOTE.remove_option_aria') })).toBeNull();
  });

  it('votes optimistically, then reloads the round from the server (invalidation)', async () => {
    const gets = mockApi({ rounds: [roundJson(), roundJson({ options: [{ id: 'b1', title: 'Dune', author: 'Herbert', votes: 3, hasVoted: true }, { id: 'b2', title: 'Emma', author: 'Austen', votes: 0, hasVoted: false }], totalVotes: 3 })] });
    let release: (r: Response) => void = () => {};
    server.use(http.post(`${API}/clubs/c1/book-vote/options/b1/vote`, () => new Promise<Response>((r) => (release = r))));
    const u = userEvent.setup();
    renderWithProviders(<BookVote club={club} />);
    const [vote] = await screen.findAllByRole('button', { name: t('BOOK_VOTE.vote') });
    await u.click(vote!);
    expect(await screen.findByText('3 голоси · 100%')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: `✓ ${t('BOOK_VOTE.voted')}` })).toBeInTheDocument();
    expect(gets).toHaveLength(1);
    release(HttpResponse.json(roundJson()));
    await waitFor(() => expect(gets).toHaveLength(2));
  });

  it('rolls the optimistic vote back and toasts the backend detail when it fails', async () => {
    mockApi({ rounds: [roundJson()] });
    server.use(http.post(`${API}/clubs/c1/book-vote/options/b1/vote`, () => HttpResponse.json({ detail: 'Round closed' }, { status: 409 })));
    const u = userEvent.setup();
    renderWithProviders(<BookVote club={club} />);
    const [vote] = await screen.findAllByRole('button', { name: t('BOOK_VOTE.vote') });
    await u.click(vote!);
    await waitFor(() => expect(toast).toHaveBeenCalledWith('error', 'Round closed'));
    expect(await screen.findByText('2 голоси · 100%')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: `✓ ${t('BOOK_VOTE.voted')}` })).toBeNull();
  });

  it('removes a vote', async () => {
    mockApi({ rounds: [roundJson({ options: [{ id: 'b1', title: 'Dune', author: '', votes: 1, hasVoted: true }], totalVotes: 1 })] });
    const deleted: string[] = [];
    server.use(
      http.delete(`${API}/clubs/c1/book-vote/options/b1/vote`, () => {
        deleted.push('b1');
        return HttpResponse.json(roundJson());
      }),
    );
    const u = userEvent.setup();
    renderWithProviders(<BookVote club={club} />);
    await u.click(await screen.findByRole('button', { name: `✓ ${t('BOOK_VOTE.voted')}` }));
    await waitFor(() => expect(deleted).toEqual(['b1']));
  });

  it('shows closed results with the winner badge, best first', async () => {
    mockApi({ rounds: [roundJson({ status: 'closed', winnerId: 'b2', options: [{ id: 'b1', title: 'Dune', author: '', votes: 1, hasVoted: false }, { id: 'b2', title: 'Emma', author: '', votes: 5, hasVoted: false }], totalVotes: 6 })] });
    renderWithProviders(<BookVote club={club} />);
    const items = await screen.findAllByRole('listitem');
    expect(items[0]).toHaveTextContent('Emma');
    expect(within(items[0]!).getByText(`🏆 ${t('BOOK_VOTE.winner_badge')}`)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: t('BOOK_VOTE.new_round') })).toBeNull();
  });
});

describe('BookVote as organizer', () => {
  const owner = { user: 'o1' };

  it('adds a book: validates the title, posts trimmed input, clears the form, reloads', async () => {
    const gets = mockApi({ ...owner, rounds: [roundJson()] });
    const posted: unknown[] = [];
    server.use(
      http.post(`${API}/clubs/c1/book-vote/rounds/r1/options`, async ({ request }) => {
        posted.push(await request.json());
        return HttpResponse.json(roundJson());
      }),
    );
    const u = userEvent.setup();
    renderWithProviders(<BookVote club={club} />);
    await screen.findByText('Dune');
    await u.click(screen.getByRole('button', { name: t('BOOK_VOTE.add_button') }));
    const title = screen.getByRole('textbox', { name: t('BOOK_VOTE.title_aria') });
    expect(title).toHaveAccessibleDescription(t('BOOK_VOTE.title_required_error'));
    expect(title).toBeInvalid();
    expect(posted).toEqual([]);

    await u.type(title, '  Solaris ');
    await u.type(screen.getByRole('textbox', { name: t('BOOK_VOTE.author_aria') }), 'Lem');
    await u.click(screen.getByRole('button', { name: t('BOOK_VOTE.add_button') }));
    await waitFor(() => expect(posted).toEqual([{ title: 'Solaris', author: 'Lem' }]));
    await waitFor(() => expect(title).toHaveValue(''));
    await waitFor(() => expect(gets.length).toBeGreaterThan(1));
  });

  it('removes only options without votes, and closes the round', async () => {
    mockApi({ ...owner, rounds: [roundJson()] });
    const calls: string[] = [];
    server.use(
      http.delete(`${API}/clubs/c1/book-vote/options/b2`, () => {
        calls.push('remove b2');
        return HttpResponse.json(roundJson());
      }),
      http.post(`${API}/clubs/c1/book-vote/rounds/r1/close`, () => {
        calls.push('close');
        return HttpResponse.json(roundJson({ status: 'closed' }));
      }),
    );
    const u = userEvent.setup();
    renderWithProviders(<BookVote club={club} />);
    const remove = await screen.findAllByRole('button', { name: t('BOOK_VOTE.remove_option_aria') });
    expect(remove).toHaveLength(1);
    await u.click(remove[0]!);
    await u.click(screen.getByRole('button', { name: t('BOOK_VOTE.close_round') }));
    await waitFor(() => expect(calls).toEqual(['remove b2', 'close']));
  });

  it('starts a round when none exists and a new one after a closed round', async () => {
    mockApi({ ...owner, rounds: [null] });
    let created = 0;
    server.use(
      http.post(`${API}/clubs/c1/book-vote/rounds`, () => {
        created += 1;
        return HttpResponse.json(roundJson());
      }),
    );
    const u = userEvent.setup();
    const first = renderWithProviders(<BookVote club={club} />);
    await u.click(await screen.findByRole('button', { name: t('BOOK_VOTE.start_round') }));
    await waitFor(() => expect(created).toBe(1));
    first.unmount();

    mockApi({ ...owner, rounds: [roundJson({ status: 'closed', winnerId: 'b1' })] });
    renderWithProviders(<BookVote club={club} />);
    await u.click(await screen.findByRole('button', { name: t('BOOK_VOTE.new_round') }));
    await waitFor(() => expect(created).toBe(2));
  });

  it('toasts a failed action once without swallowing the page', async () => {
    mockApi({ ...owner, rounds: [null] });
    server.use(http.post(`${API}/clubs/c1/book-vote/rounds`, () => HttpResponse.json({ detail: 'Not allowed' }, { status: 403 })));
    const u = userEvent.setup();
    renderWithProviders(<BookVote club={club} />);
    await u.click(await screen.findByRole('button', { name: t('BOOK_VOTE.start_round') }));
    await waitFor(() => expect(toast).toHaveBeenCalledWith('error', 'Not allowed'));
  });
});
