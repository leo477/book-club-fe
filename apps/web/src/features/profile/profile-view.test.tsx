import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { API, messages, renderWithProviders, server, setupApiServer, userJson } from '@/test/harness';
import { ProfileView } from './profile-view';

const toast = vi.hoisted(() => vi.fn());
vi.mock('@/lib/toast', () => ({ showToast: toast }));
vi.mock('@/lib/navigate', () => ({ hardNavigate: vi.fn(), replaceNavigate: vi.fn() }));

setupApiServer();
beforeEach(() => toast.mockReset());

// the ICU build doubles literal apostrophes
const t = (key: string) => (messages.uk[key] ?? key).replace(/''/g, "'");
const STATS = { clubsJoined: 3, quizzesTaken: 7, quizWins: 2, likesReceived: 11, booksRead: 5 };

/** Serves a mutable session user; `calls.me` counts GET /auth/me so a refetch after a save is observable. */
function mockApi(initial: Record<string, unknown> = {}, stats: number | typeof STATS = STATS) {
  let user = userJson(initial);
  const calls = { me: 0, patches: [] as { path: string; body: unknown }[], gate: null as Promise<void> | null };
  const patch = (path: string, merge: (body: Record<string, unknown>) => Record<string, unknown>) =>
    http.patch(`${API}${path}`, async ({ request }) => {
      const body = (await request.json()) as Record<string, unknown>;
      calls.patches.push({ path, body });
      await calls.gate;
      user = { ...user, ...merge(body) };
      return HttpResponse.json(user);
    });
  server.use(
    http.get(`${API}/auth/session-status`, () => HttpResponse.json({ hasSession: true })),
    http.get(`${API}/auth/me`, () => {
      calls.me += 1;
      return HttpResponse.json(user);
    }),
    http.get(`${API}/users/me/stats`, () => (typeof stats === 'number' ? new HttpResponse(null, { status: stats }) : HttpResponse.json(stats))),
    patch('/users/me', (b) => b),
    patch('/users/me/role', (b) => b),
    patch('/users/me/socials', (b) => ({ socials: b })),
    patch('/users/me/socials-visibility', (b) => b),
  );
  return calls;
}

async function renderProfile() {
  const view = renderWithProviders(<ProfileView />);
  await screen.findByRole('heading', { level: 1 });
  return view;
}

const nameInput = () => screen.getByTestId('display-name-input');
const saveName = () => screen.getByRole('button', { name: t('PROFILE.save_name') });

describe('ProfileView', () => {
  it('renders the hero with initials, role badge and join date', async () => {
    mockApi({ displayName: 'ada lovelace', createdAt: '2024-03-10T00:00:00Z' });
    await renderProfile();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('ada lovelace');
    expect(screen.getByText('AL')).toBeInTheDocument();
    const hero = screen.getByRole('heading', { level: 1 }).closest('section')!;
    expect(within(hero).getByText(new RegExp(t('PROFILE.role_reader')))).toBeInTheDocument();
    expect(within(hero).getByText(new RegExp(`${t('PROFILE.member_since')} .*2024`))).toBeInTheDocument();
  });

  it('labels organizers as organizers and everyone else (admin included) as readers', async () => {
    mockApi({ role: 'organizer' });
    await renderProfile();
    const hero = screen.getByRole('heading', { level: 1 }).closest('section')!;
    expect(within(hero).getByText(new RegExp(t('PROFILE.role_organizer')))).toBeInTheDocument();
  });

  it('labels an admin as administrator and offers no role selector', async () => {
    mockApi({ role: 'admin' });
    await renderProfile();
    const hero = screen.getByRole('heading', { level: 1 }).closest('section')!;
    expect(within(hero).getByText(new RegExp(t('PROFILE.role_admin')))).toBeInTheDocument();
    expect(screen.queryByTestId('role-user')).not.toBeInTheDocument();
    expect(screen.queryByTestId('role-organizer')).not.toBeInTheDocument();
    expect(screen.queryByText(t('PROFILE.role_subtitle'))).not.toBeInTheDocument();
  });

  it('shows the five stats from /users/me/stats', async () => {
    mockApi();
    await renderProfile();
    const clubs = screen.getByText(t('PROFILE.clubs_joined'));
    expect(await screen.findByText('11')).toBeInTheDocument();
    expect(clubs.nextElementSibling).toHaveTextContent('3');
    expect(screen.queryByText(t('PROFILE.no_stats'))).not.toBeInTheDocument();
  });

  it('falls back to zeros and the empty note when the stats call fails', async () => {
    mockApi({}, 404);
    await renderProfile();
    expect(await screen.findByText(t('PROFILE.no_stats'))).toBeInTheDocument();
    expect(screen.getAllByText('0')).toHaveLength(5);
  });

  describe('display name form', () => {
    it('is seeded with the current name and can be saved straight away', async () => {
      mockApi({ displayName: 'Ada Lovelace' });
      await renderProfile();
      expect(nameInput()).toHaveValue('Ada Lovelace');
      await waitFor(() => expect(saveName()).toBeEnabled());
    });

    it.each([
      ['', 'PROFILE.display_name_required'],
      ['a', 'PROFILE.display_name_min'],
      ['x'.repeat(51), 'SECURITY.invalid_display_name'],
      ['<script>', 'SECURITY.invalid_display_name'],
    ])('rejects %j with %s once the field was touched', async (value, key) => {
      mockApi();
      const user = userEvent.setup();
      await renderProfile();
      await user.clear(nameInput());
      if (value) await user.type(nameInput(), value);
      await user.tab();
      const error = await screen.findByRole('alert');
      expect(error).toHaveTextContent(t(key));
      expect(nameInput()).toHaveAttribute('aria-invalid', 'true');
      expect(nameInput().getAttribute('aria-describedby')).toContain(error.id);
      expect(saveName()).toBeDisabled();
    });

    it('stays silent until the field is touched, and keeps a11y attributes off a valid field', async () => {
      mockApi();
      await renderProfile();
      expect(nameInput()).not.toHaveAttribute('aria-invalid');
      expect(screen.queryByText(t('SECURITY.invalid_display_name'))).not.toBeInTheDocument();
    });

    it('accepts cyrillic names and punctuation from the allowlist', async () => {
      mockApi();
      const user = userEvent.setup();
      await renderProfile();
      await user.clear(nameInput());
      await user.type(nameInput(), "Олена Пчілка-O'Neil_2.0");
      await user.tab();
      await waitFor(() => expect(saveName()).toBeEnabled());
      expect(nameInput()).not.toHaveAttribute('aria-invalid');
    });

    it('saves, shows the saving state, toasts, and refreshes the session user', async () => {
      const calls = mockApi({ displayName: 'Ada Lovelace' });
      const user = userEvent.setup();
      await renderProfile();
      expect(calls.me).toBe(1);
      await user.clear(nameInput());
      await user.type(nameInput(), 'Grace Hopper');
      let release!: () => void;
      calls.gate = new Promise<void>((resolve) => (release = resolve));
      await user.click(saveName());
      expect(await screen.findByRole('button', { name: t('PROFILE.saving') })).toBeDisabled();
      expect(toast).not.toHaveBeenCalled();
      release();
      await waitFor(() => expect(toast).toHaveBeenCalledWith('success', t('common.saved')));
      expect(calls.patches).toEqual([{ path: '/users/me', body: { displayName: 'Grace Hopper' } }]);
      await waitFor(() => expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Grace Hopper'));
      expect(calls.me).toBe(2);
      expect(saveName()).toBeEnabled();
    });

    it('toasts the save error and re-enables the button when the call fails', async () => {
      mockApi();
      server.use(http.patch(`${API}/users/me`, () => new HttpResponse(null, { status: 422 })));
      const user = userEvent.setup();
      await renderProfile();
      await user.click(saveName());
      await waitFor(() => expect(toast).toHaveBeenCalledWith('error', t('common.saveError')));
      expect(toast).not.toHaveBeenCalledWith('success', expect.anything());
      expect(saveName()).toBeEnabled();
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Ada Lovelace');
    });

    it('treats a whitespace-only name like an empty one', async () => {
      const calls = mockApi();
      const user = userEvent.setup();
      await renderProfile();
      await user.clear(nameInput());
      await user.type(nameInput(), '   ');
      await user.tab();
      expect(await screen.findByRole('alert')).toHaveTextContent(t('PROFILE.display_name_required'));
      expect(calls.patches).toEqual([]);
    });

    it('sends the trimmed name', async () => {
      const calls = mockApi();
      const user = userEvent.setup();
      await renderProfile();
      await user.clear(nameInput());
      await user.type(nameInput(), '  Grace Hopper  ');
      await user.click(saveName());
      await waitFor(() => expect(calls.patches).toHaveLength(1));
      expect(calls.patches[0]?.body).toEqual({ displayName: 'Grace Hopper' });
    });

    it('does not submit an invalid name', async () => {
      const calls = mockApi();
      const user = userEvent.setup();
      await renderProfile();
      await user.clear(nameInput());
      await user.type(nameInput(), '<b>');
      await user.keyboard('{Enter}');
      expect(calls.patches).toEqual([]);
    });
  });

  describe('role selector', () => {
    it('marks the current role as pressed with the active badge', async () => {
      mockApi({ role: 'organizer' });
      await renderProfile();
      expect(screen.getByTestId('role-organizer')).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByTestId('role-user')).toHaveAttribute('aria-pressed', 'false');
      expect(within(screen.getByTestId('role-organizer')).getByText(t('PROFILE.active_badge'))).toBeInTheDocument();
    });

    it('switches to organizer, toasts, and follows the refreshed session', async () => {
      const calls = mockApi();
      const user = userEvent.setup();
      await renderProfile();
      await user.click(screen.getByTestId('role-organizer'));
      await waitFor(() => expect(toast).toHaveBeenCalledWith('success', t('common.saved')));
      expect(calls.patches).toEqual([{ path: '/users/me/role', body: { role: 'organizer' } }]);
      await waitFor(() => expect(screen.getByTestId('role-organizer')).toHaveAttribute('aria-pressed', 'true'));
      expect(calls.me).toBe(2);
    });

    it('switches back to reader', async () => {
      const calls = mockApi({ role: 'organizer' });
      const user = userEvent.setup();
      await renderProfile();
      await user.click(screen.getByTestId('role-user'));
      await waitFor(() => expect(screen.getByTestId('role-user')).toHaveAttribute('aria-pressed', 'true'));
      expect(calls.patches[0]).toEqual({ path: '/users/me/role', body: { role: 'user' } });
    });

    it('toasts the error and leaves the role alone when the call fails', async () => {
      const calls = mockApi();
      server.use(http.patch(`${API}/users/me/role`, () => new HttpResponse(null, { status: 403 })));
      const user = userEvent.setup();
      await renderProfile();
      await user.click(screen.getByTestId('role-organizer'));
      await waitFor(() => expect(toast).toHaveBeenCalledWith('error', t('common.saveError')));
      expect(screen.getByTestId('role-user')).toHaveAttribute('aria-pressed', 'true');
      expect(calls.me).toBe(1);
    });
  });

  describe('social links', () => {
    it('seeds the inputs and badges from the saved socials', async () => {
      mockApi({ socials: { telegram: 'ada', linkedin: 'https://linkedin.com/in/ada' }, socialsPublic: true });
      await renderProfile();
      expect(screen.getByTestId('social-telegram')).toHaveValue('ada');
      expect(screen.getByTestId('social-github')).toHaveValue('');
      expect(screen.getByRole('link', { name: 'Telegram: @ada' })).toHaveAttribute('href', 'https://t.me/ada');
      expect(screen.getByRole('link', { name: 'LinkedIn: https://linkedin.com/in/ada' })).toHaveAttribute('href', 'https://linkedin.com/in/ada');
      expect(screen.getByRole('checkbox')).toBeChecked();
    });

    it('renders no badge list without socials', async () => {
      mockApi();
      await renderProfile();
      expect(screen.queryByRole('list', { name: t('PROFILE.socials_title') })).not.toBeInTheDocument();
      expect(screen.getByRole('checkbox')).not.toBeChecked();
    });

    it('builds handle links for known networks and never links an unsafe scheme', async () => {
      mockApi({ socials: { github: 'ada', goodreads: 'javascript:alert(1)', twitter: 'ada_x' } });
      await renderProfile();
      expect(screen.getByRole('link', { name: 'GitHub: ada' })).toHaveAttribute('href', 'https://github.com/ada');
      expect(screen.getByRole('link', { name: 'Twitter / X: @ada_x' })).toHaveAttribute('href', 'https://x.com/ada_x');
      expect(screen.getByRole('link', { name: 'Goodreads: javascript:alert(1)' })).toHaveAttribute('href', 'https://goodreads.com/javascript:alert(1)');
    });

    it('sends only the filled inputs, toasts, and refreshes the session', async () => {
      const calls = mockApi();
      const user = userEvent.setup();
      await renderProfile();
      await user.type(screen.getByTestId('social-telegram'), 'ada');
      await user.type(screen.getByTestId('social-github'), 'lovelace');
      await user.click(screen.getByRole('button', { name: t('PROFILE.save') }));
      await waitFor(() => expect(toast).toHaveBeenCalledWith('success', t('common.saved')));
      expect(calls.patches).toEqual([{ path: '/users/me/socials', body: { telegram: 'ada', github: 'lovelace' } }]);
      expect(await screen.findByRole('link', { name: 'GitHub: lovelace' })).toBeInTheDocument();
    });

    it('sends null for a cleared saved link, omits never-set ones, and trims', async () => {
      const calls = mockApi({ socials: { github: 'ada', telegram: 'old' } });
      const user = userEvent.setup();
      await renderProfile();
      await user.clear(screen.getByTestId('social-github'));
      await user.clear(screen.getByTestId('social-telegram'));
      await user.type(screen.getByTestId('social-telegram'), '   ');
      await user.type(screen.getByTestId('social-twitter'), '  ada_x  ');
      await user.click(screen.getByRole('button', { name: t('PROFILE.save') }));
      await waitFor(() => expect(calls.patches).toHaveLength(1));
      expect(calls.patches[0]).toEqual({ path: '/users/me/socials', body: { github: null, telegram: null, twitter: 'ada_x' } });
    });

    it('strips a leading @ from the telegram handle', async () => {
      const calls = mockApi();
      const user = userEvent.setup();
      await renderProfile();
      await user.type(screen.getByTestId('social-telegram'), ' @ada ');
      await user.click(screen.getByRole('button', { name: t('PROFILE.save') }));
      await waitFor(() => expect(calls.patches).toHaveLength(1));
      expect(calls.patches[0]?.body).toEqual({ telegram: 'ada' });
    });

    it('sends an empty object when every input is blank and nothing was saved', async () => {
      const calls = mockApi();
      const user = userEvent.setup();
      await renderProfile();
      await user.click(screen.getByRole('button', { name: t('PROFILE.save') }));
      await waitFor(() => expect(calls.patches).toEqual([{ path: '/users/me/socials', body: {} }]));
    });

    it('toasts the error when saving the socials fails', async () => {
      mockApi();
      server.use(http.patch(`${API}/users/me/socials`, () => new HttpResponse(null, { status: 400 })));
      const user = userEvent.setup();
      await renderProfile();
      await user.click(screen.getByRole('button', { name: t('PROFILE.save') }));
      await waitFor(() => expect(toast).toHaveBeenCalledWith('error', t('common.saveError')));
    });

    it('saves the visibility toggle immediately', async () => {
      const calls = mockApi();
      const user = userEvent.setup();
      await renderProfile();
      await user.click(screen.getByRole('checkbox'));
      expect(screen.getByRole('checkbox')).toBeChecked();
      await waitFor(() => expect(toast).toHaveBeenCalledWith('success', t('common.saved')));
      expect(calls.patches).toEqual([{ path: '/users/me/socials-visibility', body: { socialsPublic: true } }]);
      await user.click(screen.getByRole('checkbox'));
      await waitFor(() => expect(calls.patches.at(-1)).toEqual({ path: '/users/me/socials-visibility', body: { socialsPublic: false } }));
    });

    it('toasts an error when the visibility call fails', async () => {
      mockApi();
      server.use(http.patch(`${API}/users/me/socials-visibility`, () => new HttpResponse(null, { status: 400 })));
      const user = userEvent.setup();
      await renderProfile();
      await user.click(screen.getByRole('checkbox'));
      await waitFor(() => expect(toast).toHaveBeenCalledWith('error', t('common.saveError')));
    });

    it('reverts the checkbox to the session value when the call fails', async () => {
      mockApi({ socialsPublic: true });
      server.use(http.patch(`${API}/users/me/socials-visibility`, () => new HttpResponse(null, { status: 400 })));
      const user = userEvent.setup();
      await renderProfile();
      await user.click(screen.getByRole('checkbox'));
      await waitFor(() => expect(toast).toHaveBeenCalledWith('error', t('common.saveError')));
      expect(screen.getByRole('checkbox')).toBeChecked();
    });
  });
});
