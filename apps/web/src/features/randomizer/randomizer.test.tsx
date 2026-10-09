import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RequireRole } from '@/features/auth/require-auth';
import { gate, t } from '@/features/club-manage/test-support';
import { NEXT_ROUTES, capture, mockSession } from '@/features/organizer/test-support';
import { StranglerProvider } from '@/strangler/context';
import { API, clubJson, memberJson, renderWithProviders, server, setupApiServer } from '@/test/harness';
import { Randomizer } from './randomizer';

const ID = '3f2b8c1e-9a4d-4e7b-8c5f-1a2b3c4d5e6f';
const nav = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn(), hard: vi.fn(), toast: vi.fn(), pick: vi.fn((count: number) => count - 1) }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: nav.push, replace: nav.replace }) }));
vi.mock('@/lib/navigate', () => ({ hardNavigate: nav.hard, replaceNavigate: vi.fn() }));
vi.mock('@/lib/toast', () => ({ showToast: nav.toast }));
vi.mock('./pick', () => ({ pickIndex: nav.pick }));

setupApiServer();
beforeEach(() => {
  Object.values(nav).forEach((fn) => fn.mockClear());
  nav.pick.mockImplementation((count: number) => count - 1);
});

const members = () => [
  memberJson({ userId: 'm1', displayName: 'Grace Hopper' }),
  memberJson({ userId: 'm2', displayName: 'Alan Turing' }),
  memberJson({ userId: 'm3', displayName: 'Ada Lovelace' }),
];

const sessionJson = (overrides: Record<string, unknown> = {}) => ({
  id: 's1',
  clubId: ID,
  createdBy: 'u1',
  purpose: 'Who presents the book?',
  candidates: [],
  result: { userId: 'm3', displayName: 'Ada Lovelace', avatarUrl: null },
  createdAt: '2099-05-01T10:30:00Z',
  ...overrides,
});

function setup(list: unknown[] = members(), history: unknown[] = []) {
  mockSession({ id: 'u1', role: 'organizer' });
  server.use(
    http.get(`${API}/clubs/${ID}`, () => HttpResponse.json(clubJson({ id: ID, organizerId: 'u1' }))),
    http.get(`${API}/clubs/${ID}/members`, () => HttpResponse.json(list)),
    http.get(`${API}/clubs/${ID}/randomizer/history`, () => HttpResponse.json(history)),
  );
  return renderWithProviders(
    <StranglerProvider value={NEXT_ROUTES}>
      <Randomizer clubId={ID} />
    </StranglerProvider>,
  );
}

const spinButton = () => screen.getByTestId('spin-button');
const ready = () => screen.findByText('Grace Hopper');
const member = (name: string) => screen.getByRole('button', { name });

async function spin(user: ReturnType<typeof userEvent.setup>) {
  await user.click(spinButton());
  expect(screen.getByText(t('RANDOMIZER.spinning'))).toBeInTheDocument();
  return screen.findByTestId('randomizer-result', {}, { timeout: 4000 });
}

describe('Randomizer', () => {
  it('lists the members, all selected, with the translated default purpose', async () => {
    setup();
    expect(await screen.findByText('Grace Hopper')).toBeInTheDocument();
    expect(screen.getByLabelText(t('RANDOMIZER.purpose_label'))).toHaveValue(t('RANDOMIZER.default_purpose'));
    expect(screen.getByText(/3 \/ 3/)).toBeInTheDocument();
    expect(member('Grace Hopper')).toHaveAttribute('aria-pressed', 'true');
    expect(spinButton()).toBeEnabled();
    expect(screen.getByRole('link', { name: t('RANDOMIZER.back_to_club') })).toHaveAttribute('href', `/clubs/${ID}`);
  });

  it('shows the empty state', async () => {
    setup([]);
    expect(await screen.findByText(t('RANDOMIZER.no_members'))).toBeInTheDocument();
    expect(spinButton()).toBeDisabled();
  });

  it('needs two selected members to spin, and says so', async () => {
    const user = userEvent.setup();
    setup();
    await screen.findByText('Grace Hopper');
    await user.click(member('Alan Turing'));
    expect(spinButton()).toBeEnabled();
    await user.click(member('Ada Lovelace'));
    expect(screen.getByText(/1 \/ 3/)).toBeInTheDocument();
    expect(spinButton()).toBeDisabled();
    expect(screen.getByText(t('RANDOMIZER.error_min'))).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: t('RANDOMIZER.select_all') }));
    expect(spinButton()).toBeEnabled();
    expect(member('Ada Lovelace')).toHaveAttribute('aria-pressed', 'true');
  });

  it('spins, then shows the member picked among the selected only', async () => {
    const user = userEvent.setup();
    setup();
    await screen.findByText('Grace Hopper');
    await user.click(member('Grace Hopper'));
    const result = await spin(user);
    expect(nav.pick).toHaveBeenCalledWith(2);
    expect(result).toHaveTextContent('Ada Lovelace');
    expect(spinButton()).toBeEnabled();
  });

  it('starts one spin for two clicks before it re-renders', async () => {
    setup();
    await screen.findByText('Grace Hopper');
    await act(async () => {
      fireEvent.click(spinButton());
      fireEvent.click(spinButton());
    });
    await screen.findByTestId('randomizer-result', {}, { timeout: 4000 });
    expect(nav.pick).toHaveBeenCalledTimes(1);
  });

  it('draws nothing when the page is left during the spin', async () => {
    const { unmount } = setup();
    await screen.findByText('Grace Hopper');
    fireEvent.click(spinButton());
    unmount();
    await new Promise((r) => setTimeout(r, 2300));
    expect(nav.pick).not.toHaveBeenCalled();
  });

  it('saves the session with full candidate objects and the winner, and prepends it to the history', async () => {
    const user = userEvent.setup();
    const bodies = capture('post', `/clubs/${ID}/randomizer/sessions`, () => HttpResponse.json(sessionJson({ purpose: 'Next book' }), { status: 201 }));
    setup(members(), [sessionJson({ id: 's0', purpose: 'Older' })]);
    await screen.findByText('Grace Hopper');
    fireEvent.change(screen.getByLabelText(t('RANDOMIZER.purpose_label')), { target: { value: 'Next book' } });
    await spin(user);
    await user.click(screen.getByRole('button', { name: t('RANDOMIZER.save') }));
    await waitFor(() => expect(screen.getAllByRole('listitem').some((li) => li.textContent?.includes('Next book'))).toBe(true));
    expect(bodies).toEqual([
      {
        purpose: 'Next book',
        candidates: [
          { userId: 'm1', displayName: 'Grace Hopper', avatarUrl: null },
          { userId: 'm2', displayName: 'Alan Turing', avatarUrl: null },
          { userId: 'm3', displayName: 'Ada Lovelace', avatarUrl: null },
        ],
        result: { userId: 'm3', displayName: 'Ada Lovelace', avatarUrl: null },
      },
    ]);
    expect(screen.getByText('Older')).toBeInTheDocument();
  });

  it('toasts the backend detail and keeps the result when saving fails', async () => {
    const user = userEvent.setup();
    server.use(http.post(`${API}/clubs/${ID}/randomizer/sessions`, () => HttpResponse.json({ detail: 'Not a member' }, { status: 400 })));
    setup();
    await screen.findByText('Grace Hopper');
    await spin(user);
    await user.click(screen.getByRole('button', { name: t('RANDOMIZER.save') }));
    await waitFor(() => expect(nav.toast).toHaveBeenCalledWith('error', 'Not a member'));
    expect(screen.getByTestId('randomizer-result')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: t('RANDOMIZER.save') })).toBeEnabled();
  });

  it('saves once for two clicks before the button re-renders', async () => {
    const user = userEvent.setup();
    const { open, release } = gate();
    let posts = 0;
    server.use(
      http.post(`${API}/clubs/${ID}/randomizer/sessions`, async () => {
        posts += 1;
        await open;
        return HttpResponse.json(sessionJson(), { status: 201 });
      }),
    );
    setup();
    await screen.findByText('Grace Hopper');
    await spin(user);
    const save = screen.getByRole('button', { name: t('RANDOMIZER.save') });
    await act(async () => {
      fireEvent.click(save);
      fireEvent.click(save);
    });
    release();
    await waitFor(() => expect(screen.getByRole('button', { name: t('RANDOMIZER.save') })).toBeDisabled());
    expect(posts).toBe(1);
  });

  it('keeps Save disabled after a successful save until the next spin', async () => {
    const user = userEvent.setup();
    const bodies = capture('post', `/clubs/${ID}/randomizer/sessions`, () => HttpResponse.json(sessionJson(), { status: 201 }));
    setup();
    await ready();
    await spin(user);
    await user.click(screen.getByRole('button', { name: t('RANDOMIZER.save') }));
    await waitFor(() => expect(bodies).toHaveLength(1));
    expect(screen.getByRole('button', { name: t('RANDOMIZER.save') })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: t('RANDOMIZER.save') }));
    expect(bodies).toHaveLength(1);
    await spin(user);
    expect(screen.getByRole('button', { name: t('RANDOMIZER.save') })).toBeEnabled();
  });

  it('keeps Save enabled on a new draw when the save of the previous draw resolves during the next spin', async () => {
    const user = userEvent.setup();
    const { open, release } = gate();
    let posts = 0;
    server.use(
      http.post(`${API}/clubs/${ID}/randomizer/sessions`, async () => {
        posts += 1;
        await open;
        return HttpResponse.json(sessionJson(), { status: 201 });
      }),
    );
    setup();
    await ready();
    await spin(user);
    await user.click(screen.getByRole('button', { name: t('RANDOMIZER.save') }));
    await user.click(spinButton());
    release();
    const result = await screen.findByTestId('randomizer-result', {}, { timeout: 4000 });
    expect(result).toHaveTextContent('Ada Lovelace');
    expect(posts).toBe(1);
    expect(screen.getByRole('button', { name: t('RANDOMIZER.save') })).toBeEnabled();
  });

  it('limits the purpose to the 200 characters the backend stores', async () => {
    setup();
    await ready();
    expect(screen.getByLabelText(t('RANDOMIZER.purpose_label'))).toHaveAttribute('maxlength', '200');
  });

  it('asks for up to 200 members', async () => {
    const urls: string[] = [];
    setup();
    server.use(http.get(`${API}/clubs/${ID}/members`, ({ request }) => (urls.push(new URL(request.url).search), HttpResponse.json(members()))));
    await ready();
    expect(urls).toEqual(['?limit=200']);
  });

  it('refuses to spin and says why when a full page of 200 members may hide more', async () => {
    const many = Array.from({ length: 200 }, (_, i) => memberJson({ userId: `m${i}`, displayName: `Member ${i}` }));
    setup(many);
    await screen.findByText('Member 0');
    expect(screen.getByText(t('RANDOMIZER.members_truncated'))).toBeInTheDocument();
    expect(spinButton()).toBeDisabled();
  });

  it('spins with 199 members and shows no note', async () => {
    const many = Array.from({ length: 199 }, (_, i) => memberJson({ userId: `m${i}`, displayName: `Member ${i}` }));
    setup(many);
    await screen.findByText('Member 0');
    expect(screen.queryByText(t('RANDOMIZER.members_truncated'))).not.toBeInTheDocument();
    expect(spinButton()).toBeEnabled();
  });

  it('shows at most five past results, as text', async () => {
    const history = Array.from({ length: 7 }, (_, i) => sessionJson({ id: `s${i}`, purpose: `Round ${i} <b>x</b>` }));
    setup(members(), history);
    expect(await screen.findByText('Round 0 <b>x</b>')).toBeInTheDocument();
    expect(screen.queryByText('Round 5 <b>x</b>')).not.toBeInTheDocument();
    expect(document.querySelector('b')).toBeNull();
  });

  it('shows organizers only, and loads no members, to someone who is not an organizer of this club', async () => {
    const requested = vi.fn();
    mockSession({ id: 'u9', role: 'organizer' });
    server.use(
      http.get(`${API}/clubs/${ID}`, () => HttpResponse.json(clubJson({ id: ID, organizerId: 'u1' }))),
      http.get(`${API}/clubs/${ID}/my-membership`, () => HttpResponse.json({ isMember: true, role: 'member', joinRequestStatus: 'none' })),
      http.get(`${API}/clubs/${ID}/members`, () => (requested(), HttpResponse.json([]))),
    );
    renderWithProviders(
      <StranglerProvider value={NEXT_ROUTES}>
        <Randomizer clubId={ID} />
      </StranglerProvider>,
    );
    expect(await screen.findByRole('alert')).toHaveTextContent(t('ERRORS.organizers_only'));
    expect(requested).not.toHaveBeenCalled();
    expect(screen.queryByTestId('spin-button')).not.toBeInTheDocument();
  });

  it('shows a real error for a failing club request', async () => {
    mockSession({ id: 'u1', role: 'organizer' });
    server.use(http.get(`${API}/clubs/${ID}`, () => HttpResponse.json({ detail: 'x' }, { status: 500 })));
    renderWithProviders(
      <StranglerProvider value={NEXT_ROUTES}>
        <Randomizer clubId={ID} />
      </StranglerProvider>,
    );
    expect(await screen.findByRole('alert')).toHaveTextContent(t('ERRORS.unexpected'));
  });

  it('is behind the organizer gate', async () => {
    const requested = vi.fn();
    mockSession({ role: 'user' });
    server.use(http.get(`${API}/clubs/${ID}/members`, () => (requested(), HttpResponse.json([]))));
    renderWithProviders(
      <StranglerProvider value={NEXT_ROUTES}>
        <RequireRole role="organizer">
          <Randomizer clubId={ID} />
        </RequireRole>
      </StranglerProvider>,
    );
    await waitFor(() => expect(nav.replace).toHaveBeenCalledWith('/clubs'));
    expect(nav.toast).toHaveBeenCalledWith('error', t('ERRORS.organizers_only'));
    expect(requested).not.toHaveBeenCalled();
  });
});
