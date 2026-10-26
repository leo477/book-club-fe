import { StrictMode } from 'react';
import { screen, waitFor } from '@testing-library/react';
import { RequestTimeoutError } from '@book-club/api-client';
import { HttpResponse, http } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { API, messages, renderWithProviders, server, setupApiServer, userJson } from '@/test/harness';
import { StranglerProvider } from '@/strangler/context';
import { sessionKey } from '@/features/clubs/use-session';
import { OAuthCallback } from './oauth-callback';

const exchangeFault = vi.hoisted(() => ({ error: null as unknown }));
vi.mock('@/lib/api', async (importOriginal) => {
  const real = await importOriginal<typeof import('@/lib/api')>();
  const auth = new Proxy(real.api.auth, {
    get: (target, name) => (name === 'exchangeOAuthSession' && exchangeFault.error ? () => Promise.reject(exchangeFault.error) : Reflect.get(target, name)),
  });
  return { ...real, api: new Proxy(real.api, { get: (target, name) => (name === 'auth' ? auth : Reflect.get(target, name)) }) };
});

const track = vi.hoisted(() => vi.fn());
vi.mock('@/lib/analytics', () => ({ trackEvent: track }));

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
  track.mockReset();
  exchangeFault.error = null;
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

  it('sends the stored PKCE verifier with the code and removes it', async () => {
    visit('?code=one-time-code');
    sessionStorage.setItem('bc_pkce_verifier', 'v'.repeat(43));
    const calls = mockApi();
    renderWithProviders(<OAuthCallback />);
    await waitFor(() => expect(nav.hard).toHaveBeenCalledWith('/events'));
    expect(calls.exchange).toEqual([{ code: 'one-time-code', code_verifier: 'v'.repeat(43) }]);
    expect(sessionStorage.getItem('bc_pkce_verifier')).toBeNull();
  });

  it('removes the PKCE verifier when the exchange fails', async () => {
    visit('?code=bad');
    sessionStorage.setItem('bc_pkce_verifier', 'v'.repeat(43));
    mockApi({ exchange: () => new HttpResponse(null, { status: 400 }) });
    renderWithProviders(<OAuthCallback />);
    await waitFor(() => expect(nav.replaceHard).toHaveBeenCalledWith('/login'));
    expect(sessionStorage.getItem('bc_pkce_verifier')).toBeNull();
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

  it('does not navigate or flash when the page went away before the exchange settled', async () => {
    visit('?code=slow-code');
    let release!: () => void;
    const gate = new Promise<void>((resolve) => (release = resolve));
    const calls = mockApi({ exchange: () => HttpResponse.json(TOKENS) });
    server.use(
      http.post(`${API}/auth/oauth/exchange`, async () => {
        await gate;
        return HttpResponse.json(TOKENS);
      }),
    );
    const { unmount } = renderWithProviders(<OAuthCallback />);
    await waitFor(() => expect(window.location.search).toBe(''));
    unmount();
    release();
    await waitFor(() => expect(calls.me).toBe(1));
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(nav.hard).not.toHaveBeenCalled();
    expect(nav.replaceHard).not.toHaveBeenCalled();
    expect(sessionStorage.getItem('bc_flash')).toBeNull();
  });

  it('starts its own exchange for a different code instead of joining one still running', async () => {
    visit('?code=first-code');
    let release!: () => void;
    const gate = new Promise<void>((resolve) => (release = resolve));
    const calls = mockApi();
    server.use(
      http.post(`${API}/auth/oauth/exchange`, async ({ request }) => {
        const { code } = (await request.json()) as { code: string };
        calls.exchange.push({ code });
        if (code === 'first-code') await gate;
        return HttpResponse.json(TOKENS);
      }),
    );
    const first = renderWithProviders(<OAuthCallback />);
    await waitFor(() => expect(calls.exchange).toEqual([{ code: 'first-code' }]));
    first.unmount();

    visit('?code=second-code');
    renderWithProviders(<OAuthCallback />);
    await waitFor(() => expect(nav.hard).toHaveBeenCalledWith('/events'));
    expect(calls.exchange).toEqual([{ code: 'first-code' }, { code: 'second-code' }]);
    release();
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(nav.hard).toHaveBeenCalledTimes(1);
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

  describe('failure diagnostics', () => {
    const reported = (message: string) => expect(track).toHaveBeenCalledWith('js_error', { kind: 'error', message });
    const invalidCode = () => HttpResponse.json({ detail: { error: 'Invalid or expired OAuth code', code: 'INVALID_OAUTH_CODE' } }, { status: 400 });

    it('classifies INVALID_OAUTH_CODE without a stored verifier', async () => {
      visit('?code=secret-code');
      mockApi({ exchange: invalidCode });
      renderWithProviders(<OAuthCallback />);
      await waitFor(() => expect(nav.replaceHard).toHaveBeenCalled());
      reported('oauth_exchange:invalid_code;verifier=0');
    });

    it('classifies INVALID_OAUTH_CODE with a stored verifier', async () => {
      visit('?code=secret-code');
      sessionStorage.setItem('bc_pkce_verifier', 'secret-verifier'.padEnd(43, 'v'));
      mockApi({ exchange: invalidCode });
      renderWithProviders(<OAuthCallback />);
      await waitFor(() => expect(nav.replaceHard).toHaveBeenCalled());
      reported('oauth_exchange:invalid_code;verifier=1');
      expect(JSON.stringify(track.mock.calls)).not.toMatch(/secret/);
    });

    it('classifies a network failure', async () => {
      visit('?code=c');
      mockApi({ exchange: () => HttpResponse.error() });
      renderWithProviders(<OAuthCallback />);
      await waitFor(() => expect(nav.replaceHard).toHaveBeenCalled());
      reported('oauth_exchange:network;verifier=0');
    });

    it('classifies a request timeout', async () => {
      visit('?code=c');
      mockApi();
      exchangeFault.error = new RequestTimeoutError();
      renderWithProviders(<OAuthCallback />);
      await waitFor(() => expect(nav.replaceHard).toHaveBeenCalled());
      reported('oauth_exchange:timeout;verifier=0');
    });

    it('classifies a non-HTTP rejection as unknown', async () => {
      visit('?code=c');
      mockApi();
      exchangeFault.error = new TypeError('boom');
      renderWithProviders(<OAuthCallback />);
      await waitFor(() => expect(nav.replaceHard).toHaveBeenCalled());
      reported('oauth_exchange:unknown;verifier=0');
    });

    it('classifies another HTTP status', async () => {
      visit('?code=c');
      mockApi({ exchange: () => new HttpResponse(null, { status: 500 }) });
      renderWithProviders(<OAuthCallback />);
      await waitFor(() => expect(nav.replaceHard).toHaveBeenCalled());
      reported('oauth_exchange:http_500;verifier=0');
    });

    it('classifies a profile failure after a successful exchange', async () => {
      visit('?code=c');
      mockApi({ me: () => HttpResponse.json({ detail: 'nope' }, { status: 401 }) });
      renderWithProviders(<OAuthCallback />);
      await waitFor(() => expect(nav.replaceHard).toHaveBeenCalled());
      reported('oauth_exchange:me_failed;verifier=0');
    });

    it('reports nothing on success', async () => {
      visit('?code=c');
      mockApi();
      renderWithProviders(<OAuthCallback />);
      await waitFor(() => expect(nav.hard).toHaveBeenCalled());
      expect(track).not.toHaveBeenCalled();
    });
  });
});
