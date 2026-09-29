import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { sessionKey } from '@/features/clubs/use-session';
import { setErrorTranslator } from '@/lib/api';
import { API, messages, renderWithProviders, server, userJson, setupApiServer } from '@/test/harness';
import { ChatLink } from './chat-link';
import { Header } from './header';

const nav = vi.hoisted(() => ({ pathname: '/clubs', refresh: vi.fn(), hardNavigate: vi.fn(), toasts: [] as [string, string][] }));
vi.mock('next/navigation', () => ({ usePathname: () => nav.pathname, useRouter: () => ({ refresh: nav.refresh }) }));
vi.mock('@/lib/navigate', () => ({ hardNavigate: nav.hardNavigate }));
vi.mock('@/lib/toast', () => ({ showToast: (kind: string, message: string) => nav.toasts.push([kind, message]) }));

setupApiServer();

const t = (key: string) => messages.uk[key] ?? key;

function mockSession(authenticated: boolean) {
  server.use(
    http.get(`${API}/auth/session-status`, () => HttpResponse.json({ hasSession: authenticated })),
    http.get(`${API}/auth/me`, () => HttpResponse.json(userJson())),
  );
}

afterEach(() => {
  setErrorTranslator((key) => key);
  vi.restoreAllMocks();
});

beforeEach(() => {
  nav.pathname = '/clubs';
  nav.refresh.mockClear();
  nav.hardNavigate.mockReset();
  nav.toasts.length = 0;
  document.documentElement.classList.remove('dark');
  document.cookie = 'theme=; max-age=0; path=/';
  document.cookie = 'lang=; max-age=0; path=/';
  localStorage.clear();
});

describe('Header', () => {
  it('renders guest navigation with the active link marked and no support link', async () => {
    mockSession(false);
    renderWithProviders(<Header initialDark={false} />);
    const main = screen.getByRole('navigation', { name: 'Main navigation' });
    expect(within(main).getByTestId('nav-clubs')).toHaveAttribute('aria-current', 'page');
    expect(within(main).getByTestId('nav-events')).not.toHaveAttribute('aria-current');
    expect(within(main).queryByTestId('nav-support')).toBeNull();
    expect(await screen.findByRole('link', { name: t('NAV.login') })).toHaveAttribute('href', '/login');
    expect(screen.getByRole('link', { name: t('NAV.join_free') })).toHaveAttribute('href', '/register');
    expect(screen.getByRole('link', { name: 'BookClub home' })).toHaveAttribute('href', '/');
  });

  it('adds the support link for signed-in users and marks it active on nested paths', async () => {
    mockSession(true);
    nav.pathname = '/support/new';
    renderWithProviders(<Header initialDark={false} />);
    const support = await screen.findByTestId('nav-support');
    expect(support).toHaveAttribute('aria-current', 'page');
    expect(within(screen.getByRole('navigation', { name: 'Main navigation' })).getByTestId('nav-clubs')).not.toHaveAttribute('aria-current');
  });

  it('opens the user menu with the arrow key, moves focus between items, closes on Escape and returns focus', async () => {
    mockSession(true);
    const u = userEvent.setup();
    renderWithProviders(<Header initialDark={false} />);
    const trigger = await screen.findByRole('button', { name: 'User menu for Ada Lovelace' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    trigger.focus();
    await u.keyboard('{ArrowDown}');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    const menu = await screen.findByRole('menu');
    const chats = within(menu).getByRole('menuitem', { name: t('NAV.chats') });
    expect(chats).toHaveAttribute('href', '/chats');
    expect(within(menu).getByRole('menuitem', { name: t('NAV.profile') })).toHaveAttribute('href', '/profile');
    await waitFor(() => expect(chats).toHaveFocus());

    await u.keyboard('{ArrowDown}');
    expect(within(menu).getByRole('menuitem', { name: t('NAV.profile') })).toHaveFocus();
    await u.keyboard('{ArrowDown}');
    expect(within(menu).getByRole('menuitem', { name: t('NAV.logout') })).toHaveFocus();

    await u.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
    expect(trigger).toHaveFocus();
  });

  it('closes the user menu on an outside click', async () => {
    mockSession(true);
    const u = userEvent.setup({ pointerEventsCheck: 0 }) // Radix disables body pointer events while a modal menu is open;
    renderWithProviders(<Header initialDark={false} />);
    await u.click(await screen.findByRole('button', { name: /User menu/ }));
    expect(await screen.findByRole('menu')).toBeInTheDocument();
    await u.click(document.body);
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
  });

  it('logs out with POST /auth/logout, clears the session hint and cache, then hard-navigates to /login', async () => {
    mockSession(true);
    const posted: string[] = [];
    server.use(
      http.post(`${API}/auth/logout`, () => {
        posted.push('logout');
        return new HttpResponse(null, { status: 204 });
      }),
    );
    const u = userEvent.setup();
    const { queryClient } = renderWithProviders(<Header initialDark={false} />);
    let cachedAtNavigation: unknown = 'not navigated';
    nav.hardNavigate.mockImplementation(() => {
      cachedAtNavigation = queryClient.getQueryData(sessionKey);
    });
    await u.click(await screen.findByRole('button', { name: /User menu/ }));
    expect(queryClient.getQueryData(sessionKey)).toMatchObject({ id: 'u1' });
    await u.click(await screen.findByRole('menuitem', { name: t('NAV.logout') }));
    await waitFor(() => expect(nav.hardNavigate).toHaveBeenCalledWith('/login'));
    expect(posted).toEqual(['logout']);
    expect(cachedAtNavigation).toBeUndefined();
  });

  it('does not pretend to be logged out when POST /auth/logout fails: toast, no navigation', async () => {
    mockSession(true);
    server.use(http.post(`${API}/auth/logout`, () => HttpResponse.json({ detail: 'nope' }, { status: 400 })));
    const u = userEvent.setup();
    renderWithProviders(<Header initialDark={false} />);
    await u.click(await screen.findByRole('button', { name: /User menu/ }));
    await u.click(await screen.findByRole('menuitem', { name: t('NAV.logout') }));
    await waitFor(() => expect(nav.toasts).toContainEqual(['error', t('ERRORS.requestFailed')]));
    expect(nav.hardNavigate).not.toHaveBeenCalled();
  });

  it('shows the server-error toast once and stays put when logout returns 5xx', async () => {
    mockSession(true);
    server.use(http.post(`${API}/auth/logout`, () => HttpResponse.json({}, { status: 500 })));
    setErrorTranslator((key) => t(key));
    const u = userEvent.setup();
    renderWithProviders(<Header initialDark={false} />);
    await u.click(await screen.findByRole('button', { name: /User menu/ }));
    await u.click(await screen.findByRole('menuitem', { name: t('NAV.logout') }));
    await waitFor(() => expect(nav.toasts).toEqual([['error', t('ERRORS.serverError')]]));
    expect(nav.hardNavigate).not.toHaveBeenCalled();
  });

  it('toggles the theme through the html class, the theme cookie and localStorage, with CSS-driven icons and name', async () => {
    mockSession(false);
    const u = userEvent.setup();
    renderWithProviders(<Header initialDark={false} />);
    const [toggle] = screen.getAllByTestId('theme-toggle');
    expect(toggle).toHaveTextContent(t('NAV.theme_toggle_dark'));
    expect(toggle).toHaveTextContent(t('NAV.theme_toggle_light'));
    expect(toggle).not.toHaveAttribute('aria-label');

    await u.click(toggle!);
    expect(document.documentElement).toHaveClass('dark');
    expect(localStorage.getItem('theme')).toBe('dark');
    expect(document.cookie).toContain('theme=dark');

    await u.click(screen.getAllByTestId('theme-toggle')[0]!);
    expect(document.documentElement).not.toHaveClass('dark');
    expect(document.cookie).toContain('theme=light');
  });

  it('still applies the theme and language through the cookie when localStorage throws', async () => {
    mockSession(false);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('blocked', 'SecurityError');
    });
    const u = userEvent.setup();
    renderWithProviders(<Header initialDark={false} />);
    await u.click(screen.getAllByTestId('theme-toggle')[0]!);
    expect(document.documentElement).toHaveClass('dark');
    expect(document.cookie).toContain('theme=dark');
    await u.click(screen.getByRole('button', { name: 'Switch to English' }));
    expect(document.cookie).toContain('lang=en');
    expect(nav.refresh).toHaveBeenCalledOnce();
  });

  it('switches language via cookie and localStorage, then refreshes the router', async () => {
    mockSession(false);
    const u = userEvent.setup();
    renderWithProviders(<Header initialDark={false} />);
    await u.click(screen.getByRole('button', { name: 'Switch to English' }));
    expect(document.cookie).toContain('lang=en');
    expect(localStorage.getItem('lang')).toBe('en');
    expect(nav.refresh).toHaveBeenCalledOnce();
  });

  it('offers the way back to Ukrainian under the en locale', () => {
    mockSession(false);
    renderWithProviders(<Header initialDark={false} />, 'en');
    expect(screen.getByRole('button', { name: 'Перейти на українську' })).toHaveTextContent('UK');
  });
});

describe('mobile sheet', () => {
  it('opens as a dialog, traps focus, closes on Escape and returns focus to the trigger', async () => {
    mockSession(false);
    const u = userEvent.setup();
    renderWithProviders(<Header initialDark={false} />);
    const trigger = screen.getByRole('button', { name: 'Toggle navigation menu' });

    await u.click(trigger);
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByRole('heading', { name: 'BookClub' })).toBeInTheDocument();
    expect(within(dialog).getByRole('link', { name: t('NAV.events') })).toHaveAttribute('href', '/events');
    expect(within(dialog).getByRole('link', { name: t('NAV.login') })).toBeInTheDocument();
    const close = within(dialog).getByRole('button', { name: t('ERRORS.dismiss') });

    await waitFor(() => expect(dialog).toContainElement(document.activeElement as HTMLElement));
    const focusable = within(dialog).getAllByRole('link').concat(within(dialog).getAllByRole('button'));
    for (let i = 0; i < focusable.length + 2; i++) {
      await u.tab();
      expect(dialog).toContainElement(document.activeElement as HTMLElement);
    }
    await u.tab({ shift: true });
    expect(dialog).toContainElement(document.activeElement as HTMLElement);

    await u.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(trigger).toHaveFocus();
    expect(close).not.toBeInTheDocument();
  });

  it('shows signed-in items and closes when a link is activated', async () => {
    mockSession(true);
    const u = userEvent.setup();
    renderWithProviders(<Header initialDark={false} />);
    await screen.findByRole('button', { name: /User menu/ });
    await u.click(screen.getByRole('button', { name: 'Toggle navigation menu' }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText(t('NAV.signed_in_as'))).toBeInTheDocument();
    expect(within(dialog).getByText('Ada Lovelace')).toBeInTheDocument();
    expect(within(dialog).getByTestId('nav-support-mobile')).toHaveAttribute('href', '/support');
    expect(within(dialog).getByTestId('logout')).toBeInTheDocument();
    expect(within(dialog).queryByRole('link', { name: t('NAV.login') })).toBeNull();

    document.addEventListener('click', (e) => e.preventDefault(), { once: true });
    await u.click(within(dialog).getByRole('link', { name: t('NAV.profile') }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });
});

describe('ChatLink', () => {
  it('is absent for guests', async () => {
    mockSession(false);
    renderWithProviders(<ChatLink />);
    await waitFor(() => expect(screen.queryByRole('link')).toBeNull());
  });

  it('links to /chats for signed-in users, shifted up on the clubs list only', async () => {
    mockSession(true);
    const { unmount } = renderWithProviders(<ChatLink />);
    const link = await screen.findByRole('link', { name: t('CHAT.open') });
    expect(link).toHaveAttribute('href', '/chats');
    expect(link).toHaveClass('bottom-24', 'right-6', 'w-14', 'h-14');
    unmount();

    nav.pathname = '/events';
    renderWithProviders(<ChatLink />);
    expect(await screen.findByRole('link', { name: t('CHAT.open') })).toHaveClass('bottom-6');
  });
});
