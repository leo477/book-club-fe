import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { API, clubJson, messages, parsedClub, renderWithProviders, server, userJson, setupApiServer } from '@/test/harness';
import { ClubsListClient } from './clubs-list-client';
import { filterClubs } from './use-clubs';

const navigate = vi.hoisted(() => vi.fn());
vi.mock('@/lib/navigate', () => ({ hardNavigate: navigate }));

setupApiServer();

const t = (key: string) => messages.uk[key] ?? key;

const alpha = parsedClub();
const beta = parsedClub({ id: 'c2', name: 'Beta Poets', description: 'Poetry night', city: 'Lviv', organizerId: 'u1' });
const initial = [alpha, beta];

interface Scenario {
  session?: boolean;
  me?: Record<string, unknown>;
  mine?: unknown[];
}

function mockApi({ session = false, me = userJson(), mine = [] }: Scenario = {}) {
  const calls: string[] = [];
  const track = (label: string) => calls.push(label);
  server.use(
    http.get(`${API}/auth/session-status`, () => {
      track('session-status');
      return HttpResponse.json({ hasSession: session });
    }),
    http.get(`${API}/auth/me`, () => {
      track('me');
      return HttpResponse.json(me);
    }),
    http.get(`${API}/clubs/my`, () => {
      track('my');
      return HttpResponse.json(mine);
    }),
    http.get(`${API}/clubs`, () => {
      track('clubs');
      return HttpResponse.json([clubJson(), clubJson({ id: 'c2', name: 'Beta Poets', organizerId: 'u1' })]);
    }),
  );
  return calls;
}

describe('ClubsListClient as guest', () => {
  it('renders the server-provided clubs with login CTAs, no tabs, and no duplicate GET /clubs', async () => {
    const calls = mockApi();
    renderWithProviders(<ClubsListClient initialClubs={initial} />);

    expect(screen.getAllByTestId('club-card')).toHaveLength(2);
    expect(screen.getByRole('heading', { level: 1, name: t('CLUBS.title') })).toBeInTheDocument();
    const cta = await screen.findAllByTestId('login-to-join');
    expect(cta).toHaveLength(2);
    expect(cta[0]).toHaveAttribute('href', '/login');
    expect(screen.getAllByRole('link', { name: new RegExp(`${t('CLUBS.view')} Alpha`) })[0]).toHaveAttribute('href', '/clubs/c1');
    expect(screen.queryByRole('tablist')).toBeNull();
    expect(screen.queryByTestId('tablist-placeholder')).toBeNull();

    await waitFor(() => expect(calls).toContain('session-status'));
    expect(calls).not.toContain('me');
    expect(calls).not.toContain('clubs');
    expect(calls).not.toContain('my');
  });

  it('filters by name or description, and shows the search empty state', async () => {
    mockApi();
    const u = userEvent.setup();
    renderWithProviders(<ClubsListClient initialClubs={initial} />);
    const search = screen.getByRole('searchbox', { name: t('CLUBS.search_placeholder') });

    await u.type(search, 'poetry');
    expect(screen.getAllByTestId('club-card')).toHaveLength(1);
    expect(screen.getByRole('heading', { name: 'Beta Poets' })).toBeInTheDocument();

    await u.clear(search);
    await u.type(search, '  ALPHA ');
    expect(screen.getAllByTestId('club-card')).toHaveLength(1);

    await u.clear(search);
    await u.type(search, 'nothing matches');
    const empty = screen.getByTestId('empty-state');
    expect(within(empty).getByText(t('CLUBS.empty_search_title'))).toBeInTheDocument();
    expect(screen.queryByTestId('club-card')).toBeNull();
  });

  it('shows the plain empty state when there are no clubs', () => {
    mockApi();
    renderWithProviders(<ClubsListClient initialClubs={[]} />);
    expect(within(screen.getByTestId('empty-state')).getByText(t('CLUBS.empty_title'))).toBeInTheDocument();
  });

  it('shows a spinner then fetches the list itself when the server fetch failed', async () => {
    const calls = mockApi();
    renderWithProviders(<ClubsListClient initialClubs={null} />);
    expect(screen.getByLabelText('Loading clubs')).toHaveAttribute('aria-busy', 'true');
    expect(await screen.findAllByTestId('club-card')).toHaveLength(2);
    expect(calls).toContain('clubs');
  });

  it('shows the load error banner and the empty state when the client fetch fails', async () => {
    mockApi();
    server.use(http.get(`${API}/clubs`, () => HttpResponse.json({ detail: 'boom' }, { status: 500 })));
    renderWithProviders(<ClubsListClient initialClubs={null} />);
    expect(await screen.findByRole('alert')).toHaveTextContent(t('CLUBS.load_error'));
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
  });
});

describe('ClubsListClient while the session resolves', () => {
  it('never shows the guest login CTA to a signed-in user: invisible placeholders, then real actions and tabs', async () => {
    mockApi({ session: true, me: userJson({ id: 'u9' }) });
    let release = () => {};
    const gate = new Promise<void>((resolve) => (release = resolve));
    server.use(
      http.get(`${API}/auth/session-status`, async () => {
        await gate;
        return HttpResponse.json({ hasSession: true });
      }),
    );
    renderWithProviders(<ClubsListClient initialClubs={initial} />);

    expect(screen.getAllByTestId('club-card')).toHaveLength(2);
    expect(screen.queryByTestId('login-to-join')).toBeNull();
    expect(screen.queryByRole('button', { name: new RegExp(t('CLUBS.join')) })).toBeNull();
    const placeholders = screen.getAllByTestId('card-actions-pending');
    expect(placeholders).toHaveLength(2);
    expect(placeholders[0]).toHaveAttribute('aria-hidden', 'true');
    expect(placeholders[0]).toHaveClass('invisible', 'h-8');
    expect(screen.getByTestId('tablist-placeholder')).toHaveClass('h-12');

    release();
    expect(await screen.findByRole('tablist', { name: 'Club filter' })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: `${t('CLUBS.join')} Alpha Readers` })).toBeEnabled();
    expect(screen.queryByTestId('login-to-join')).toBeNull();
    expect(screen.queryByTestId('card-actions-pending')).toBeNull();
    expect(screen.queryByTestId('tablist-placeholder')).toBeNull();
  });
});

describe('ClubsListClient as member', () => {
  const member = { session: true, mine: [clubJson({ id: 'c2', name: 'Beta Poets', organizerId: 'u1' })] };

  it('hydrates auth, shows tabs, member/organizer badges, and the join button only for non-member clubs', async () => {
    mockApi({ ...member, me: userJson({ id: 'u9' }) });
    renderWithProviders(<ClubsListClient initialClubs={initial} />);

    expect(await screen.findByRole('tablist', { name: 'Club filter' })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: `${t('CLUBS.join')} Alpha Readers` })).toBeEnabled();
    expect(screen.queryByTestId('login-to-join')).toBeNull();
    const cards = screen.getAllByTestId('club-card');
    expect(within(cards[1]!).getByText(t('CLUBS.member_badge'))).toBeInTheDocument();
    expect(within(cards[1]!).queryByRole('button', { name: /Beta/ })).toBeNull();
    expect(screen.getByRole('tab', { name: new RegExp(t('CLUBS.my_clubs')) })).toHaveTextContent('1');
  });

  it('switches between all and my tabs by click and arrow key', async () => {
    mockApi({ ...member, me: userJson({ id: 'u9' }) });
    const u = userEvent.setup();
    renderWithProviders(<ClubsListClient initialClubs={initial} />);

    const all = await screen.findByRole('tab', { name: t('CLUBS.all') });
    expect(all).toHaveAttribute('aria-selected', 'true');
    await u.click(await screen.findByRole('tab', { name: new RegExp(t('CLUBS.my_clubs')) }));
    expect(screen.getAllByTestId('club-card')).toHaveLength(1);
    expect(screen.getByRole('heading', { name: 'Beta Poets' })).toBeInTheDocument();

    all.focus();
    await u.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: new RegExp(t('CLUBS.my_clubs')) })).toHaveAttribute('aria-selected', 'true');
    await u.keyboard('{ArrowLeft}');
    expect(all).toHaveAttribute('aria-selected', 'true');
    expect(screen.getAllByTestId('club-card')).toHaveLength(2);
  });

  it('shows the my-clubs empty state when the member has no clubs', async () => {
    mockApi({ session: true, mine: [] });
    const u = userEvent.setup();
    renderWithProviders(<ClubsListClient initialClubs={initial} />);
    await u.click(await screen.findByRole('tab', { name: new RegExp(t('CLUBS.my_clubs')) }));
    expect(within(screen.getByTestId('empty-state')).getByText(t('CLUBS.no_clubs'))).toBeInTheDocument();
  });

  it('shows the my-clubs load error', async () => {
    mockApi({ session: true });
    server.use(http.get(`${API}/clubs/my`, () => HttpResponse.json({}, { status: 500 })));
    renderWithProviders(<ClubsListClient initialClubs={initial} />);
    expect(await screen.findByRole('alert')).toHaveTextContent(t('CLUBS.load_my_error'));
  });

  it('treats a failing /auth/me as a guest without redirecting', async () => {
    mockApi({ session: true });
    server.use(http.get(`${API}/auth/me`, () => HttpResponse.json({}, { status: 401 })));
    renderWithProviders(<ClubsListClient initialClubs={initial} />);
    await waitFor(() => expect(screen.getAllByTestId('login-to-join')).toHaveLength(2));
    expect(screen.queryByRole('tablist')).toBeNull();
  });
});

describe('ClubsListClient joining', () => {
  it('posts the join, disables only that button with a spinner while pending, then re-enables it', async () => {
    mockApi({ session: true });
    let release = () => {};
    const gate = new Promise<void>((resolve) => (release = resolve));
    const joined: string[] = [];
    server.use(
      http.post(`${API}/clubs/:id/join`, async ({ params }) => {
        joined.push(String(params['id']));
        await gate;
        return HttpResponse.json({ status: 'pending' });
      }),
    );
    const u = userEvent.setup();
    renderWithProviders(<ClubsListClient initialClubs={[alpha, parsedClub({ id: 'c3', name: 'Gamma' })]} />);

    const join = await screen.findByRole('button', { name: `${t('CLUBS.join')} Alpha Readers` });
    await u.click(join);
    await waitFor(() => expect(join).toBeDisabled());
    expect(within(join).getByRole('status')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: `${t('CLUBS.join')} Gamma` })).toBeEnabled();

    release();
    await waitFor(() => expect(join).toBeEnabled());
    expect(joined).toEqual(['c1']);
    expect(screen.getByRole('button', { name: `${t('CLUBS.join')} Alpha Readers` })).toBeInTheDocument();
  });

  it('keeps an independent spinner per club for concurrent joins and refetches /clubs/my after each success', async () => {
    const calls = mockApi({ session: true });
    const gates: Record<string, () => void> = {};
    server.use(
      http.post(`${API}/clubs/:id/join`, async ({ params }) => {
        await new Promise<void>((resolve) => (gates[String(params['id'])] = resolve));
        return HttpResponse.json({ status: 'pending' });
      }),
    );
    const u = userEvent.setup();
    renderWithProviders(<ClubsListClient initialClubs={[alpha, parsedClub({ id: 'c3', name: 'Gamma' })]} />);

    const a = await screen.findByRole('button', { name: `${t('CLUBS.join')} Alpha Readers` });
    const g = screen.getByRole('button', { name: `${t('CLUBS.join')} Gamma` });
    await waitFor(() => expect(calls.filter((c) => c === 'my')).toHaveLength(1));
    await u.click(a);
    await u.click(g);
    await waitFor(() => expect(a).toBeDisabled());
    expect(g).toBeDisabled();
    expect(within(a).getByRole('status')).toBeInTheDocument();
    expect(within(g).getByRole('status')).toBeInTheDocument();

    gates['c1']!();
    await waitFor(() => expect(a).toBeEnabled());
    expect(g).toBeDisabled();
    await waitFor(() => expect(calls.filter((c) => c === 'my')).toHaveLength(2));

    gates['c3']!();
    await waitFor(() => expect(g).toBeEnabled());
    await waitFor(() => expect(calls.filter((c) => c === 'my')).toHaveLength(3));
  });

  it.each(['member', 'already_requested'] as const)('handles the %s response like pending (no card change)', async (status) => {
    mockApi({ session: true });
    server.use(http.post(`${API}/clubs/c1/join`, () => HttpResponse.json({ status })));
    const u = userEvent.setup();
    renderWithProviders(<ClubsListClient initialClubs={[alpha]} />);
    const join = await screen.findByRole('button', { name: `${t('CLUBS.join')} Alpha Readers` });
    await u.click(join);
    await waitFor(() => expect(join).toBeEnabled());
  });

  it('resets the pending state when the join fails', async () => {
    mockApi({ session: true });
    server.use(http.post(`${API}/clubs/c1/join`, () => HttpResponse.json({ detail: 'banned' }, { status: 403 })));
    const u = userEvent.setup();
    renderWithProviders(<ClubsListClient initialClubs={[alpha]} />);
    const join = await screen.findByRole('button', { name: `${t('CLUBS.join')} Alpha Readers` });
    await u.click(join);
    await waitFor(() => expect(join).toBeEnabled());
    expect(navigate).toHaveBeenCalledWith('/clubs');
  });
});

describe('ClubsListClient as organizer', () => {
  it('marks owned clubs and hides the create FAB once the organizer owns a club', async () => {
    mockApi({ session: true, me: userJson({ id: 'u1', role: 'organizer' }), mine: [clubJson({ id: 'c2', organizerId: 'u1' })] });
    renderWithProviders(<ClubsListClient initialClubs={initial} />);
    await screen.findByRole('tablist');
    const beta = screen.getAllByTestId('club-card')[1]!;
    expect(await within(beta).findByText(t('CLUBS.organizer_badge'))).toBeInTheDocument();
    expect(within(beta).getByLabelText('Your club')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: t('CLUBS.create') })).toBeNull();
  });

  it('shows the create FAB for an organizer who owns no club, but not for a plain member', async () => {
    mockApi({ session: true, me: userJson({ id: 'u7', role: 'organizer' }) });
    const { unmount } = renderWithProviders(<ClubsListClient initialClubs={initial} />);
    expect(await screen.findByRole('link', { name: t('CLUBS.create') })).toHaveAttribute('href', '/clubs/create');
    unmount();

    mockApi({ session: true, me: userJson({ id: 'u7', role: 'user' }) });
    renderWithProviders(<ClubsListClient initialClubs={initial} />);
    await screen.findByRole('tablist');
    expect(screen.queryByRole('link', { name: t('CLUBS.create') })).toBeNull();
  });
});

describe('filterClubs', () => {
  it('combines the text query and the exact city filter', () => {
    expect(filterClubs(initial, '', 'Lviv').map((c) => c.id)).toEqual(['c2']);
    expect(filterClubs(initial, 'read', 'Lviv')).toEqual([]);
    expect(filterClubs(initial, ' READS ').map((c) => c.id)).toEqual(['c1']);
    expect(filterClubs(initial, '')).toHaveLength(2);
  });
});
