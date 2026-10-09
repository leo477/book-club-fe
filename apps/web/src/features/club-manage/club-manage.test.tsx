import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { nest } from '@/i18n/locale';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NEXT_ROUTES, mockSession } from '@/features/organizer/test-support';
import { StranglerProvider } from '@/strangler/context';
import { API, clubJson, memberJson, messages, renderWithProviders, server, setupApiServer } from '@/test/harness';
import { ClubManage } from './club-manage';
import { ID, mockManageReads, requestJson, t } from './test-support';

const nav = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn(), hard: vi.fn(), toast: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: nav.push, replace: nav.replace }) }));
vi.mock('@/lib/navigate', () => ({ hardNavigate: nav.hard, replaceNavigate: vi.fn() }));
vi.mock('@/lib/toast', () => ({ showToast: nav.toast }));

setupApiServer();
beforeEach(() => Object.values(nav).forEach((fn) => fn.mockReset()));

const club = (overrides: Record<string, unknown> = {}) => clubJson({ id: ID, organizerId: 'u1', ...overrides });

function setup(clubBody: Record<string, unknown> | number = club(), reads: Parameters<typeof mockManageReads>[0] = {}) {
  mockSession({ id: 'u1', role: 'organizer' });
  mockManageReads(reads);
  server.use(http.get(`${API}/clubs/${ID}`, () => (typeof clubBody === 'number' ? HttpResponse.json({ detail: 'x' }, { status: clubBody }) : HttpResponse.json(clubBody))));
  return renderWithProviders(
    <StranglerProvider value={NEXT_ROUTES}>
      <ClubManage id={ID} />
    </StranglerProvider>,
  );
}

const tab = (key: string) => screen.findByRole('tab', { name: new RegExp(t(key)) });

describe('ClubManage', () => {
  it('shows a spinner, then the club name, the status badge and the dashboard', async () => {
    setup();
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(await screen.findByRole('heading', { level: 1, name: 'Alpha Readers' })).toBeInTheDocument();
    expect(screen.getByText(t('CLUB_MANAGE.status_active'))).toBeInTheDocument();
    expect(await screen.findByText('340')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: new RegExp(t('CLUB_MANAGE.back_to_club')) })).toHaveAttribute('href', `/clubs/${ID}`);
  });

  it.each([
    ['paused', 'CLUBS.paused'],
    ['cancelled', 'CLUBS.cancelled'],
  ])('badges a %s club', async (status, key) => {
    setup(club({ status }));
    expect(await screen.findByText(t(key))).toBeInTheDocument();
  });

  it('says the club is missing when it answers 404', async () => {
    setup(404);
    expect(await screen.findByRole('alert')).toHaveTextContent(t('CLUB_DETAIL.not_found'));
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
  });

  it('says organizers only when the club answers 403', async () => {
    setup(403);
    expect(await screen.findByRole('alert')).toHaveTextContent(t('ERRORS.organizers_only'));
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
  });

  it('shows a real error state, not "club not found", for a server failure, and retries', async () => {
    setup(500);
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(t('ERRORS.unexpected'));
    expect(alert).not.toHaveTextContent(t('CLUB_DETAIL.not_found'));
    server.use(http.get(`${API}/clubs/${ID}`, () => HttpResponse.json(club())));
    await userEvent.setup().click(screen.getByRole('button', { name: t('ERRORS.retry') }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Alpha Readers' })).toBeInTheDocument();
  });

  it('treats the stub of a private club as missing', async () => {
    setup({ id: ID, name: 'Hidden', isPublic: false, memberCount: 3 });
    expect(await screen.findByRole('alert')).toHaveTextContent(t('CLUB_DETAIL.not_found'));
    expect(screen.queryByText('Hidden')).not.toBeInTheDocument();
  });

  it('counts pending join requests on the Requests tab, and lists them there', async () => {
    setup(club(), { requests: [requestJson(), requestJson({ userId: 'r2', displayName: 'Mary Jackson' })] });
    const requests = await tab('CLUB_MANAGE.tab_requests');
    await waitFor(() => expect(within(requests).getByText('2')).toBeInTheDocument());
    await userEvent.setup().click(requests);
    expect(await screen.findByText('Mary Jackson')).toBeInTheDocument();
  });

  it('shows members with role controls and bans on the Members tab', async () => {
    setup(club(), { members: [memberJson({ userId: 'u1', displayName: 'Me', role: 'organizer' }), memberJson()], bans: [{ userId: 'b1', clubId: ID, bannedAt: '2099-01-01T00:00:00Z', duration: 1, bannedBy: 'u1' }] });
    await userEvent.setup().click(await tab('CLUB_MANAGE.tab_members'));
    expect(await screen.findByRole('button', { name: t('CLUB_MANAGE.promote') })).toBeInTheDocument();
    expect(await screen.findByText(t('CLUB_MANAGE.bans_title') + ' (1)')).toBeInTheDocument();
  });

  it('embeds the edit form on the Settings tab without the standalone page frame', async () => {
    setup();
    await userEvent.setup().click(await tab('CLUB_MANAGE.tab_settings'));
    expect(await screen.findByTestId('club-name-input')).toHaveValue('Alpha Readers');
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });

  it('links the tools to quizzes, randomizer and event creation', async () => {
    setup();
    await userEvent.setup().click(await tab('CLUB_MANAGE.tab_tools'));
    expect(await screen.findByRole('link', { name: new RegExp(t('CLUB_DETAIL.randomizer_title')) })).toHaveAttribute('href', `/clubs/${ID}/randomizer`);
    expect(screen.getByRole('link', { name: new RegExp(t('CLUB_DETAIL.quizzes_title')) })).toHaveAttribute('href', `/clubs/${ID}/quizzes`);
    expect(screen.getByRole('link', { name: new RegExp(t('CLUB_DETAIL.create_event_title')) })).toHaveAttribute('href', `/clubs/${ID}/events/create`);
    expect(screen.getByRole('heading', { name: t('CLUB_MANAGE.danger_title') })).toBeInTheDocument();
  });

  describe('ClubManage per-club gate', () => {
  const asViewer = (userId: string, role: string, membership: Record<string, unknown> | number) => {
    mockSession({ id: userId, role: 'organizer' });
    const stats = vi.fn();
    mockManageReads();
    server.use(
      http.get(`${API}/clubs/${ID}`, () => HttpResponse.json(club())),
      http.get(`${API}/clubs/${ID}/stats`, () => (stats(), HttpResponse.json({}))),
      http.get(`${API}/clubs/${ID}/my-membership`, () => (typeof membership === 'number' ? HttpResponse.json({ detail: 'x' }, { status: membership }) : HttpResponse.json({ isMember: true, role, joinRequestStatus: 'none', ...membership }))),
    );
    renderWithProviders(
      <StranglerProvider value={NEXT_ROUTES}>
        <ClubManage id={ID} />
      </StranglerProvider>,
    );
    return stats;
  };

  it('admits an organizer of this club who is not its owner', async () => {
    asViewer('co', 'organizer', {});
    expect(await screen.findByRole('heading', { level: 1, name: 'Alpha Readers' })).toBeInTheDocument();
  });

  it('shows organizers only, and loads none of the tools, to a global organizer who is a plain member of this club', async () => {
    const stats = asViewer('other', 'member', {});
    expect(await screen.findByRole('alert')).toHaveTextContent(t('ERRORS.organizers_only'));
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
    expect(stats).not.toHaveBeenCalled();
  });

  it('shows organizers only to a global organizer with no membership', async () => {
    asViewer('other', 'member', { isMember: false, role: null });
    expect(await screen.findByRole('alert')).toHaveTextContent(t('ERRORS.organizers_only'));
  });

  it('shows the error panel without retry delays, and re-checks a cached role on mount', async () => {
    mockSession({ id: 'other', role: 'organizer' });
    mockManageReads();
    let reads = 0;
    server.use(
      http.get(`${API}/clubs/${ID}`, () => HttpResponse.json(club())),
      http.get(`${API}/clubs/${ID}/my-membership`, () => (reads++, HttpResponse.json({ detail: 'x' }, { status: 400 }))),
    );
    // the defaults a real app has: three retries with growing delays
    const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 60_000 } } });
    queryClient.setQueryData(['club', ID, 'membership'], { isMember: true, role: 'organizer', joinRequestStatus: 'none' }, { updatedAt: Date.now() - 1000 });
    render(
      <QueryClientProvider client={queryClient}>
        <NextIntlClientProvider locale="uk" messages={nest(messages.uk)}>
          <StranglerProvider value={NEXT_ROUTES}>
            <ClubManage id={ID} />
          </StranglerProvider>
        </NextIntlClientProvider>
      </QueryClientProvider>,
    );
    expect(await screen.findByRole('alert', {}, { timeout: 500 })).toHaveTextContent(t('ERRORS.unexpected'));
    expect(reads).toBe(1);
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
  });

  it('does not show the controls from a cached organizer role while the role is being re-checked', async () => {
    mockSession({ id: 'other', role: 'organizer' });
    mockManageReads();
    server.use(
      http.get(`${API}/clubs/${ID}`, () => HttpResponse.json(club())),
      http.get(`${API}/clubs/${ID}/my-membership`, async () => {
        await new Promise((r) => setTimeout(r, 100));
        return HttpResponse.json({ isMember: true, role: 'member', joinRequestStatus: 'none' });
      }),
    );
    const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 60_000 } } });
    queryClient.setQueryData(['club', ID, 'membership'], { isMember: true, role: 'organizer', joinRequestStatus: 'none' }, { updatedAt: Date.now() - 1000 });
    render(
      <QueryClientProvider client={queryClient}>
        <NextIntlClientProvider locale="uk" messages={nest(messages.uk)}>
          <StranglerProvider value={NEXT_ROUTES}>
            <ClubManage id={ID} />
          </StranglerProvider>
        </NextIntlClientProvider>
      </QueryClientProvider>,
    );
    expect(await screen.findByRole('alert')).toHaveTextContent(t('ERRORS.organizers_only'));
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
  });

  it('shows an error state when the membership cannot be read', async () => {
    asViewer('other', 'member', 500);
    expect(await screen.findByRole('alert')).toHaveTextContent(t('ERRORS.unexpected'));
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
  });
});

  it('shows organizers only, not a spinner, when there is no signed-in user', async () => {
    mockSession(null);
    mockManageReads();
    server.use(http.get(`${API}/clubs/${ID}`, () => HttpResponse.json(club())));
    renderWithProviders(
      <StranglerProvider value={NEXT_ROUTES}>
        <ClubManage id={ID} />
      </StranglerProvider>,
    );
    expect(await screen.findByRole('alert')).toHaveTextContent(t('ERRORS.organizers_only'));
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
  });

  it('does not show a cached club before this visit has re-fetched it', async () => {
    mockSession({ id: 'u1', role: 'user' });
    mockManageReads();
    server.use(
      http.get(`${API}/clubs/${ID}`, async () => {
        await new Promise((r) => setTimeout(r, 100));
        return HttpResponse.json({ detail: 'x' }, { status: 404 });
      }),
    );
    const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 60_000 } } });
    queryClient.setQueryData(['club', ID, 'detail'], club(), { updatedAt: Date.now() - 1000 });
    render(
      <QueryClientProvider client={queryClient}>
        <NextIntlClientProvider locale="uk" messages={nest(messages.uk)}>
          <StranglerProvider value={NEXT_ROUTES}>
            <ClubManage id={ID} />
          </StranglerProvider>
        </NextIntlClientProvider>
      </QueryClientProvider>,
    );
    expect(screen.queryByRole('heading', { level: 1, name: 'Alpha Readers' })).not.toBeInTheDocument();
    expect(await screen.findByRole('alert')).toHaveTextContent(t('CLUB_DETAIL.not_found'));
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
  });
});
