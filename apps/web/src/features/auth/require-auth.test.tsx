import { screen, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { StranglerProvider } from '@/strangler/context';
import { API, messages, renderWithProviders, server, setupApiServer, userJson } from '@/test/harness';
import { RequireAuth, RequireRole } from './require-auth';

const nav = vi.hoisted(() => ({ replace: vi.fn(), hard: vi.fn(), toast: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: nav.replace }) }));
vi.mock('@/lib/navigate', () => ({ replaceNavigate: nav.hard, hardNavigate: vi.fn() }));
vi.mock('@/lib/toast', () => ({ showToast: nav.toast }));

setupApiServer();
beforeEach(() => {
  nav.replace.mockReset();
  nav.hard.mockReset();
  nav.toast.mockReset();
});

function session(user: Record<string, unknown> | null) {
  server.use(
    http.get(`${API}/auth/session-status`, () => HttpResponse.json({ hasSession: user !== null })),
    http.get(`${API}/auth/me`, () => (user ? HttpResponse.json(userJson(user)) : new HttpResponse(null, { status: 401 }))),
  );
}

const withRoutes = (routes: string[], ui: ReactNode) => <StranglerProvider value={routes}>{ui}</StranglerProvider>;

describe('RequireAuth', () => {
  it('shows a busy placeholder while the session resolves and never flashes the content', async () => {
    server.use(http.get(`${API}/auth/session-status`, async () => new Promise(() => undefined)));
    renderWithProviders(<RequireAuth>secret</RequireAuth>);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByText('secret')).not.toBeInTheDocument();
    expect(nav.hard).not.toHaveBeenCalled();
  });

  it('renders the content for a signed-in user', async () => {
    session({});
    renderWithProviders(<RequireAuth>secret</RequireAuth>);
    expect(await screen.findByText('secret')).toBeInTheDocument();
    expect(nav.hard).not.toHaveBeenCalled();
  });

  it('replaces with /login (no returnUrl) for a guest, once resolved', async () => {
    session(null);
    renderWithProviders(<RequireAuth>secret</RequireAuth>);
    await waitFor(() => expect(nav.hard).toHaveBeenCalledWith('/login'));
    expect(screen.queryByText('secret')).not.toBeInTheDocument();
    expect(nav.replace).not.toHaveBeenCalled();
  });

  it('stays in the router for a guest once /login is Next-owned, and hard-replaces while it is legacy', async () => {
    session(null);
    renderWithProviders(withRoutes(['/login'], <RequireAuth>secret</RequireAuth>));
    await waitFor(() => expect(nav.replace).toHaveBeenCalledWith('/login'));
    expect(nav.hard).not.toHaveBeenCalled();
  });

  it('treats a failing /auth/me as a guest', async () => {
    server.use(
      http.get(`${API}/auth/session-status`, () => HttpResponse.json({ hasSession: true })),
      http.get(`${API}/auth/me`, () => new HttpResponse(null, { status: 500 })),
    );
    renderWithProviders(<RequireAuth>secret</RequireAuth>);
    await waitFor(() => expect(nav.hard).toHaveBeenCalledWith('/login'));
  });
});

describe('RequireRole', () => {
  it.each([['organizer'], ['admin']])('admits %s to organizer pages', async (role) => {
    session({ role });
    renderWithProviders(<RequireRole role="organizer">secret</RequireRole>);
    expect(await screen.findByText('secret')).toBeInTheDocument();
    expect(nav.toast).not.toHaveBeenCalled();
  });

  it('toasts ERRORS.organizers_only and replaces with /clubs for a plain user', async () => {
    session({ role: 'user' });
    renderWithProviders(withRoutes(['/clubs'], <RequireRole role="organizer">secret</RequireRole>));
    await waitFor(() => expect(nav.replace).toHaveBeenCalledWith('/clubs'));
    expect(nav.toast).toHaveBeenCalledTimes(1);
    expect(nav.toast).toHaveBeenCalledWith('error', messages.uk['ERRORS.organizers_only']);
    expect(screen.queryByText('secret')).not.toBeInTheDocument();
  });

  it('falls back to a hard replace when /clubs is not Next-owned', async () => {
    session({ role: 'user' });
    renderWithProviders(<RequireRole role="organizer">secret</RequireRole>);
    await waitFor(() => expect(nav.hard).toHaveBeenCalledWith('/clubs'));
  });

  it('sends a guest to /login without the role toast', async () => {
    session(null);
    renderWithProviders(<RequireRole role="organizer">secret</RequireRole>);
    await waitFor(() => expect(nav.hard).toHaveBeenCalledWith('/login'));
    expect(nav.toast).not.toHaveBeenCalled();
  });

  it('only admins pass an admin gate', async () => {
    session({ role: 'organizer' });
    renderWithProviders(withRoutes(['/clubs'], <RequireRole role="admin">secret</RequireRole>));
    await waitFor(() => expect(nav.replace).toHaveBeenCalledWith('/clubs'));
  });
});
