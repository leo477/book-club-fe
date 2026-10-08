import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { API, messages, renderWithProviders, server, setupApiServer, userJson } from '@/test/harness';
import { StranglerProvider } from '@/strangler/context';
import { SupportBoard } from './support-board';

const toast = vi.hoisted(() => vi.fn());
vi.mock('@/lib/toast', () => ({ showToast: toast }));
vi.mock('@/lib/navigate', () => ({ hardNavigate: vi.fn(), replaceNavigate: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), replace: vi.fn() }) }));

setupApiServer();
beforeEach(() => toast.mockReset());

const t = (key: string) => (messages.uk[key] ?? key).replace(/''/g, "'");

const sub = (overrides: Record<string, unknown> = {}) => ({
  id: 's1',
  authorId: 'u1',
  type: 'suggestion',
  title: 'Dark mode',
  body: 'Please add it',
  status: 'pending',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  likeCount: 0,
  likedByMe: false,
  ...overrides,
});

function mockApi(list: Record<string, unknown>[] | number, role = 'user') {
  const calls = { patches: [] as unknown[] };
  server.use(
    http.get(`${API}/auth/session-status`, () => HttpResponse.json({ hasSession: true })),
    http.get(`${API}/auth/me`, () => HttpResponse.json(userJson({ role }))),
    http.get(`${API}/support`, () => {
      return typeof list === 'number' ? new HttpResponse(null, { status: list }) : HttpResponse.json(list);
    }),
    http.patch(`${API}/support/:id/status`, async ({ params, request }) => {
      const body = (await request.json()) as { status: string };
      calls.patches.push({ id: params['id'], ...body });
      const current = (list as Record<string, unknown>[]).find((s) => s['id'] === params['id'])!;
      return HttpResponse.json({ ...current, status: body.status });
    }),
  );
  return calls;
}

async function renderBoard() {
  const view = renderWithProviders(<SupportBoard />);
  await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
  return view;
}

const column = (status: string) => screen.getByText(t(`SUPPORT.status_${status}`), { selector: 'span.text-sm' }).parentElement!.parentElement!;

describe('SupportBoard', () => {
  it('shows the header, a link to the form and a loading spinner while fetching', async () => {
    mockApi([]);
    renderWithProviders(<SupportBoard />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(t('SUPPORT.title'));
    expect(screen.getByTestId('support-new')).toHaveAttribute('href', '/support/new');
    expect(screen.getByRole('status', { name: t('SUPPORT.loading') })).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
  });

  it('shows the empty state of every section when there is nothing', async () => {
    mockApi([]);
    await renderBoard();
    for (const key of ['complaints', 'comments', 'suggestions']) {
      expect(screen.getByText(t(`SUPPORT.empty_${key}_title`))).toBeInTheDocument();
    }
  });

  it('reads a failed load as an empty board', async () => {
    mockApi(500);
    await renderBoard();
    expect(screen.getByText(t('SUPPORT.empty_complaints_title'))).toBeInTheDocument();
  });

  it('splits submissions into complaints, comments and a status board of suggestions', async () => {
    mockApi([
      sub({ id: 'c1', type: 'complaint', title: 'Too slow', status: 'open' }),
      sub({ id: 'm1', type: 'comment', title: 'Nice app', status: 'open' }),
      sub({ id: 's1', title: 'Pending idea', status: 'pending' }),
      sub({ id: 's2', title: 'Approved idea', status: 'approved' }),
      sub({ id: 's3', title: 'Shipped idea', status: 'done' }),
      sub({ id: 's4', title: 'Hidden open idea', status: 'open' }),
    ]);
    await renderBoard();
    expect(screen.getByText('Too slow')).toBeInTheDocument();
    expect(screen.getByText('Nice app')).toBeInTheDocument();
    expect(within(column('pending')).getByText('Pending idea')).toBeInTheDocument();
    expect(within(column('approved')).getByText('Approved idea')).toBeInTheDocument();
    expect(within(column('done')).getByText('Shipped idea')).toBeInTheDocument();
    expect(within(column('rejected')).getByText(t('SUPPORT.column_empty'))).toBeInTheDocument();
    expect(screen.queryByText('Hidden open idea')).not.toBeInTheDocument();
  });

  describe('reactions', () => {
    it('offers a reaction on complaints and comments only', async () => {
      mockApi([sub({ id: 'c1', type: 'complaint', title: 'Complaint' }), sub({ id: 'm1', type: 'comment', title: 'Comment' }), sub({ id: 's1' })]);
      await renderBoard();
      expect(screen.getAllByTestId('support-like')).toHaveLength(2);
      expect(screen.getAllByTestId('support-like')[0]).toHaveTextContent('😠');
      expect(screen.getAllByTestId('support-like')[1]).toHaveTextContent('👍');
    });

    it('likes optimistically, then keeps the state once the server confirms', async () => {
      mockApi([sub({ id: 'c1', type: 'complaint', likeCount: 2 })]);
      let release!: () => void;
      const gate = new Promise<void>((resolve) => (release = resolve));
      server.use(
        http.post(`${API}/support/c1/like`, async () => {
          await gate;
          return HttpResponse.json(sub({ id: 'c1', type: 'complaint', likeCount: 3, likedByMe: true }), { status: 201 });
        }),
      );
      const user = userEvent.setup();
      await renderBoard();
      await user.click(screen.getByTestId('support-like'));
      expect(screen.getByTestId('support-like')).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByTestId('support-like')).toHaveTextContent('3');
      release();
      await waitFor(() => expect(screen.getByTestId('support-like')).toHaveTextContent('3'));
    });

    it('unlikes with DELETE', async () => {
      mockApi([sub({ id: 'm1', type: 'comment', likeCount: 4, likedByMe: true })]);
      let deleted = false;
      server.use(
        http.delete(`${API}/support/m1/like`, () => {
          deleted = true;
          return new HttpResponse(null, { status: 204 });
        }),
      );
      const user = userEvent.setup();
      await renderBoard();
      await user.click(screen.getByTestId('support-like'));
      expect(screen.getByTestId('support-like')).toHaveAttribute('aria-pressed', 'false');
      expect(screen.getByTestId('support-like')).toHaveTextContent('3');
      await waitFor(() => expect(deleted).toBe(true));
    });

    it('rolls the like back when the server refuses it', async () => {
      mockApi([sub({ id: 'c1', type: 'complaint', likeCount: 2 })]);
      server.use(http.post(`${API}/support/c1/like`, () => HttpResponse.json({ detail: 'Already liked' }, { status: 409 })));
      const user = userEvent.setup();
      await renderBoard();
      await user.click(screen.getByTestId('support-like'));
      await waitFor(() => expect(screen.getByTestId('support-like')).toHaveAttribute('aria-pressed', 'false'));
      expect(screen.getByTestId('support-like')).toHaveTextContent('2');
    });

    it('rolls an unlike back when the server fails', async () => {
      mockApi([sub({ id: 'm1', type: 'comment', likeCount: 4, likedByMe: true })]);
      server.use(http.delete(`${API}/support/m1/like`, () => new HttpResponse(null, { status: 404 })));
      const user = userEvent.setup();
      await renderBoard();
      await user.click(screen.getByTestId('support-like'));
      await waitFor(() => expect(screen.getByTestId('support-like')).toHaveAttribute('aria-pressed', 'true'));
      expect(screen.getByTestId('support-like')).toHaveTextContent('4');
    });
  });

  describe('admin controls', () => {
    const board = [sub({ id: 'p', title: 'P', status: 'pending' }), sub({ id: 'a', title: 'A', status: 'approved' }), sub({ id: 'i', title: 'I', status: 'in_progress' }), sub({ id: 'd', title: 'D', status: 'done' }), sub({ id: 'r', title: 'R', status: 'rejected' })];

    it.each(['user', 'organizer'])('hides them from a %s', async (role) => {
      mockApi(board, role);
      await renderBoard();
      expect(screen.getByText('P')).toBeInTheDocument();
      for (const id of ['support-approve', 'support-reject', 'support-advance']) expect(screen.queryByTestId(id)).not.toBeInTheDocument();
    });

    it('gives an admin approve and reject on pending and an advance step on approved and in-progress only', async () => {
      mockApi(board, 'admin');
      await renderBoard();
      await screen.findByTestId('support-approve');
      expect(within(column('pending')).getByTestId('support-approve')).toHaveTextContent(t('SUPPORT.action_approve'));
      expect(within(column('pending')).getByTestId('support-reject')).toHaveTextContent(t('SUPPORT.action_reject'));
      expect(within(column('approved')).getByTestId('support-advance')).toHaveTextContent(t('SUPPORT.action_move_to_in_progress'));
      expect(within(column('in_progress')).getByTestId('support-advance')).toHaveTextContent(t('SUPPORT.action_move_to_done'));
      expect(within(column('done')).queryByRole('button')).not.toBeInTheDocument();
      expect(within(column('rejected')).queryByRole('button')).not.toBeInTheDocument();
    });

    it('does not give an admin controls on complaints and comments', async () => {
      mockApi([sub({ id: 'c1', type: 'complaint', status: 'pending' })], 'admin');
      await renderBoard();
      await screen.findByTestId('support-like');
      expect(screen.queryByTestId('support-approve')).not.toBeInTheDocument();
    });

    it('approves: PATCH, card moves column, status toast', async () => {
      const calls = mockApi(board, 'admin');
      const user = userEvent.setup();
      await renderBoard();
      await user.click(await screen.findByTestId('support-approve'));
      await waitFor(() => expect(within(column('approved')).getByText('P')).toBeInTheDocument());
      expect(calls.patches).toEqual([{ id: 'p', status: 'approved' }]);
      expect(toast).toHaveBeenCalledWith('success', t('SUPPORT.status_updated'));
    });

    it('rejects a pending suggestion', async () => {
      const calls = mockApi(board, 'admin');
      const user = userEvent.setup();
      await renderBoard();
      await user.click(await screen.findByTestId('support-reject'));
      await waitFor(() => expect(within(column('rejected')).getByText('P')).toBeInTheDocument());
      expect(calls.patches).toEqual([{ id: 'p', status: 'rejected' }]);
    });

    it('advances approved to in progress and in progress to done', async () => {
      const calls = mockApi(board, 'admin');
      const user = userEvent.setup();
      await renderBoard();
      await user.click(await within(column('approved')).findByTestId('support-advance'));
      await waitFor(() => expect(within(column('in_progress')).getByText('A')).toBeInTheDocument());
      await user.click(within(screen.getByText('A').closest('[data-slot="card"]') as HTMLElement).getByTestId('support-advance'));
      await waitFor(() => expect(calls.patches).toHaveLength(2));
      expect(calls.patches).toEqual([
        { id: 'a', status: 'in_progress' },
        { id: 'a', status: 'done' },
      ]);
    });

    it('swallows a failed status change: no success toast, the card stays', async () => {
      mockApi(board, 'admin');
      server.use(http.patch(`${API}/support/p/status`, () => new HttpResponse(null, { status: 403 })));
      const user = userEvent.setup();
      await renderBoard();
      await user.click(await screen.findByTestId('support-approve'));
      await waitFor(() => expect(screen.getByTestId('support-approve')).toBeEnabled());
      expect(toast).not.toHaveBeenCalled();
      expect(within(column('pending')).getByText('P')).toBeInTheDocument();
    });
  });

  it('keeps the new-submission link on a Next-owned route in the router', async () => {
    mockApi([]);
    renderWithProviders(
      <StranglerProvider value={['/support/new']}>
        <SupportBoard />
      </StranglerProvider>,
    );
    expect(screen.getByTestId('support-new')).toHaveAttribute('href', '/support/new');
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
  });
});
