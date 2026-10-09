import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RequireRole } from '@/features/auth/require-auth';
import { NEXT_ROUTES, mockSession } from '@/features/organizer/test-support';
import { StranglerProvider } from '@/strangler/context';
import { API, clubJson, memberJson, renderWithProviders, server, setupApiServer } from '@/test/harness';
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

  it.each([404, 403])('says the club is missing when it answers %s', async (status) => {
    setup(status);
    expect(await screen.findByRole('alert')).toHaveTextContent(t('CLUB_DETAIL.not_found'));
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
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

  it('turns a plain reader away before anything of the club is requested', async () => {
    const requested = vi.fn();
    mockSession({ role: 'user' });
    server.use(http.get(`${API}/clubs/${ID}`, () => (requested(), HttpResponse.json(club()))));
    renderWithProviders(
      <StranglerProvider value={NEXT_ROUTES}>
        <RequireRole role="organizer">
          <ClubManage id={ID} />
        </RequireRole>
      </StranglerProvider>,
    );
    await waitFor(() => expect(nav.replace).toHaveBeenCalledWith('/clubs'));
    expect(nav.toast).toHaveBeenCalledWith('error', t('ERRORS.organizers_only'));
    expect(requested).not.toHaveBeenCalled();
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
  });
});
