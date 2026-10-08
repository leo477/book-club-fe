import { StrictMode } from 'react';
import { screen, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { API, messages, renderWithProviders, server, setupApiServer, userJson } from '@/test/harness';
import { StranglerProvider } from '@/strangler/context';
import { sessionKey } from '@/features/clubs/use-session';
import { OAuthCallback } from './oauth-callback';

const nav = vi.hoisted(() => ({ hard: vi.fn(), replaceHard: vi.fn(), router: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: nav.router }) }));
vi.mock('@/lib/navigate', () => ({ hardNavigate: nav.hard, replaceNavigate: nav.replaceHard }));

setupApiServer();

const t = (key: string) => (messages.uk[key] ?? key).replace(/''/g, "'");
const TOKENS = { accessToken: 'jwt-access-secret', refreshToken: 'jwt-refresh-secret' };

function mockApi({ exchange, me }: { exchange?: () => Response; me?: () => Response } = {}) {
  const calls = { exchange: [] as unknown[], me: 0, refresh: 0, probe: 0 };
  server.use(
    http.get(`${API}/auth/session-status`, () => {
      calls.probe += 1;
      return HttpResponse.json({ hasSession: true });
    }),
    http.post(`${API}/auth/oauth/exchange`, async ({ request }) => {
      calls.exchange.push(await request.json());
      return exchange ? exchange() : HttpResponse.json(TOKENS);
    }),
    http.get(`${API}/auth/me`, () => {
      calls.me += 1;
      return me ? me() : HttpResponse.json(userJson());
    }),
    http.post(`${API}/auth/refresh`, () => {
      calls.refresh += 1;
      return HttpResponse.json(TOKENS);
    }),
  );
  return calls;
}

const visit = (search: string) => window.history.replaceState({}, '', `/auth/callback${search}`);

beforeEach(() => {
  nav.hard.mockReset();
  nav.replaceHard.mockReset();
  nav.router.mockReset();
  localStorage.clear();
  sessionStorage.clear();
  vi.restoreAllMocks();
});

describe('OAuthCallback', () => {
  it('exchanges the code, loads the profile, primes the session and hard-navigates to /events', async () => {
    visit('?code=one-time-code');
    const calls = mockApi();
    const { queryClient } = renderWithProviders(<OAuthCallback />);
    expect(screen.getByText(t('AUTH.signing_in'))).toBeInTheDocument();

    await waitFor(() => expect(nav.hard).toHaveBeenCalledWith('/events'));
    expect(calls.exchange).toEqual([{ code: 'one-time-code' }]);
    expect(calls.me).toBe(1);
    expect(calls.probe).toBe(0);
    expect(queryClient.getQueryData(sessionKey)).toMatchObject({ id: 'u1' });
    expect(sessionStorage.getItem('bc_flash')).toBeNull();
  });

  it('strips the code from the URL and history before the exchange completes', async () => {
    visit('?code=one-time-code&other=1');
    const replace = vi.spyOn(window.history, 'replaceState');
    let seenUrl = '';
    mockApi({
      exchange: () => {
        seenUrl = window.location.pathname + window.location.search;
        return HttpResponse.json(TOKENS);
      },
    });
    renderWithProviders(<OAuthCallback />);
    await waitFor(() => expect(nav.hard).toHaveBeenCalled());
    expect(replace).toHaveBeenCalledWith({}, '', '/auth/callback');
    expect(seenUrl).toBe('/auth/callback');
    expect(window.location.search).toBe('');
  });

  it('exchanges once under StrictMode double mounting', async () => {
    visit('?code=single-use');
    const calls = mockApi();
    renderWithProviders(
      <StrictMode>
        <OAuthCallback />
      </StrictMode>,
    );
    await waitFor(() => expect(nav.hard).toHaveBeenCalled());
    expect(calls.exchange).toEqual([{ code: 'single-use' }]);
    expect(nav.hard).toHaveBeenCalledTimes(1);
    expect(nav.hard).toHaveBeenCalledWith('/events');
    expect(sessionStorage.getItem('bc_flash')).toBeNull();
  });

  it('treats a missing code as a failed attempt: toast and /login without any request', async () => {
    visit('');
    const calls = mockApi();
    renderWithProviders(<OAuthCallback />);
    await waitFor(() => expect(nav.replaceHard).toHaveBeenCalledWith('/login'));
    expect(sessionStorage.getItem('bc_flash')).toBe('oauth_failed');
    expect(calls).toEqual({ exchange: [], me: 0, refresh: 0, probe: 0 });
  });

  it('treats an empty code like a missing one', async () => {
    visit('?code=');
    const calls = mockApi();
    renderWithProviders(<OAuthCallback />);
    await waitFor(() => expect(nav.replaceHard).toHaveBeenCalledWith('/login'));
    expect(calls.exchange).toEqual([]);
  });

  it.each([
    ['an expired or used code', () => HttpResponse.json({ detail: 'Invalid code' }, { status: 400 })],
    ['a server error', () => new HttpResponse(null, { status: 500 })],
    ['a network failure', () => HttpResponse.error()],
  ])('toasts and goes to /login after %s', async (_name, exchange) => {
    visit('?code=bad');
    const calls = mockApi({ exchange });
    const { queryClient } = renderWithProviders(<OAuthCallback />);
    await waitFor(() => expect(nav.replaceHard).toHaveBeenCalledWith('/login'));
    expect(sessionStorage.getItem('bc_flash')).toBe('oauth_failed');
    expect(nav.replaceHard).toHaveBeenCalledTimes(1);
    expect(nav.hard).not.toHaveBeenCalled();
    expect(calls.me).toBe(0);
    expect(queryClient.getQueryData(sessionKey)).toBeUndefined();
    expect(window.location.search).toBe('');
  });

  it('fails the same way when the profile cannot be loaded after a successful exchange', async () => {
    visit('?code=ok-code');
    const calls = mockApi({ me: () => HttpResponse.json({ detail: 'nope' }, { status: 401 }) });
    const { queryClient } = renderWithProviders(<OAuthCallback />);
    await waitFor(() => expect(nav.replaceHard).toHaveBeenCalledWith('/login'));
    expect(sessionStorage.getItem('bc_flash')).toBe('oauth_failed');
    expect(calls.refresh).toBe(0);
    expect(queryClient.getQueryData(sessionKey)).toBeUndefined();
  });

  it('stays in the router (no reload, so the message survives in memory) when /login is Next-owned', async () => {
    visit('?code=bad');
    mockApi({ exchange: () => new HttpResponse(null, { status: 400 }) });
    renderWithProviders(
      <StranglerProvider value={['/login']}>
        <OAuthCallback />
      </StranglerProvider>,
    );
    await waitFor(() => expect(nav.router).toHaveBeenCalledWith('/login'));
    expect(nav.replaceHard).not.toHaveBeenCalled();
    expect(nav.hard).not.toHaveBeenCalled();
    expect(sessionStorage.getItem('bc_flash')).toBe('oauth_failed');
  });

  it('never persists the code or a token and never follows a redirect parameter', async () => {
    visit('?code=one-time-code&redirect=https://evil.example&returnUrl=//evil.example');
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    mockApi();
    const { queryClient } = renderWithProviders(<OAuthCallback />);
    await waitFor(() => expect(nav.hard).toHaveBeenCalled());
    expect(nav.hard).toHaveBeenCalledWith('/events');
    expect(setItem).not.toHaveBeenCalled();
    expect(localStorage.length + sessionStorage.length).toBe(0);
    expect(document.cookie).toBe('');
    expect(JSON.stringify(queryClient.getQueryCache().getAll().map((q) => q.state.data))).not.toContain('jwt-');
  });
});
