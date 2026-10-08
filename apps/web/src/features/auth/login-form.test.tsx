import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, screen, waitFor, within } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { API, messages, renderWithProviders, server, setupApiServer, userJson } from '@/test/harness';
import { nest } from '@/i18n/locale';
import { sessionKey } from '@/features/clubs/use-session';
import { LoginView } from './login-form';

const nav = vi.hoisted(() => ({ hard: vi.fn(), toast: vi.fn() }));
vi.mock('@/lib/toast', () => ({ showToast: nav.toast }));
vi.mock('@/lib/navigate', () => ({ hardNavigate: nav.hard, replaceNavigate: vi.fn() }));

setupApiServer();

const t = (key: string, locale: 'uk' | 'en' = 'uk') => (messages[locale][key] ?? key).replace(/''/g, "'");
const TOKENS = { accessToken: 'jwt-access-secret', refreshToken: 'jwt-refresh-secret' };

function mockApi({ guest = true, login }: { guest?: boolean; login?: () => Response | Promise<Response> } = {}) {
  const posts: unknown[] = [];
  server.use(
    http.get(`${API}/auth/session-status`, () => HttpResponse.json({ hasSession: !guest })),
    http.get(`${API}/auth/me`, () => HttpResponse.json(userJson())),
    http.post(`${API}/auth/login`, async ({ request }) => {
      posts.push(await request.json());
      return login ? login() : HttpResponse.json({ ...TOKENS, user: userJson() });
    }),
  );
  return posts;
}

const email = () => document.querySelector<HTMLInputElement>('#login-email')!;
const password = () => document.querySelector<HTMLInputElement>('#login-password')!;
const submit = () => screen.getByRole('button', { name: t('AUTH.submit_login') });

beforeEach(() => {
  nav.hard.mockReset();
  nav.toast.mockReset();
  localStorage.clear();
  sessionStorage.clear();
  window.history.replaceState({}, '', '/login');
});

describe('LoginView', () => {
  it('renders the fields with their e2e ids, labels and the Google and register links', async () => {
    mockApi();
    renderWithProviders(<LoginView />);
    expect(email()).toHaveAttribute('type', 'email');
    expect(screen.getByLabelText(t('AUTH.email'))).toBe(email());
    expect(screen.getByLabelText(t('AUTH.password'))).toBe(password());
    expect(screen.getByRole('heading', { level: 2, name: t('AUTH.sign_in_h2') })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: t('AUTH.continue_with_google') })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: t('AUTH.register_title') })).toHaveAttribute('href', '/register');
    expect(screen.queryByRole('link', { name: t('NAV.back_home') })).toBeNull();
  });

  it.each(['uk', 'en'] as const)('shows required and minlength errors in %s without calling the API', async (locale) => {
    const posts = mockApi();
    renderWithProviders(<LoginView />, locale);
    await userEvent.click(screen.getByRole('button', { name: t('AUTH.submit_login', locale) }));
    expect(await screen.findAllByText(t('FORM_ERRORS.required', locale))).toHaveLength(2);
    expect(email()).toHaveAttribute('aria-invalid', 'true');
    expect(email().getAttribute('aria-describedby')).toBeTruthy();

    await userEvent.type(email(), 'not-an-email');
    await userEvent.type(password(), 'short');
    await userEvent.tab();
    expect(await screen.findByText(t('FORM_ERRORS.email', locale))).toBeInTheDocument();
    expect(screen.getByText(t('FORM_ERRORS.minlength', locale).replace('{requiredLength}', '8'))).toBeInTheDocument();
    expect(posts).toEqual([]);
    expect(nav.hard).not.toHaveBeenCalled();
  });

  it('signs in with the cookie transport, primes the session and hard-navigates to /events', async () => {
    const posts = mockApi();
    const { queryClient } = renderWithProviders(<LoginView />);
    await userEvent.type(email(), 'ada@example.com');
    await userEvent.type(password(), 'correct-horse');
    await userEvent.click(submit());

    await waitFor(() => expect(nav.hard).toHaveBeenCalledWith('/events'));
    expect(nav.hard).toHaveBeenCalledTimes(1);
    expect(posts).toEqual([{ email: 'ada@example.com', password: 'correct-horse' }]);
    expect(queryClient.getQueryData(sessionKey)).toMatchObject({ id: 'u1', displayName: 'Ada Lovelace' });
    expect(screen.getByRole('button', { name: new RegExp(t('AUTH.signing_in')) })).toBeDisabled();
  });

  it('keeps every token out of storage, cookies and the cached session', async () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    mockApi();
    const { queryClient } = renderWithProviders(<LoginView />);
    await userEvent.type(email(), 'ada@example.com');
    await userEvent.type(password(), 'correct-horse');
    await userEvent.click(submit());
    await waitFor(() => expect(nav.hard).toHaveBeenCalled());

    expect(setItem).not.toHaveBeenCalled();
    expect(localStorage.length + sessionStorage.length).toBe(0);
    expect(document.cookie).toBe('');
    expect(JSON.stringify(queryClient.getQueryCache().getAll().map((q) => q.state.data))).not.toContain('jwt-');
    setItem.mockRestore();
  });

  it('ignores redirect and returnUrl parameters', async () => {
    window.history.replaceState({}, '', '/login?redirect=https://evil.example&returnUrl=//evil.example&next=/clubs');
    mockApi();
    renderWithProviders(<LoginView />);
    await userEvent.type(email(), 'ada@example.com');
    await userEvent.type(password(), 'correct-horse');
    await userEvent.click(submit());
    await waitFor(() => expect(nav.hard).toHaveBeenCalledTimes(1));
    expect(nav.hard).toHaveBeenCalledWith('/events');
  });

  it('maps the backend "Invalid credentials" to the localized message in a login-error alert', async () => {
    mockApi({ login: () => HttpResponse.json({ detail: 'Invalid credentials' }, { status: 401 }) });
    const { queryClient } = renderWithProviders(<LoginView />);
    await userEvent.type(email(), 'ada@example.com');
    await userEvent.type(password(), 'wrong-password');
    await userEvent.click(submit());

    const alert = await screen.findByTestId('login-error');
    expect(alert).toHaveAttribute('role', 'alert');
    expect(alert).toHaveTextContent(t('AUTH.error_invalid_credentials'));
    expect(nav.hard).not.toHaveBeenCalled();
    expect(queryClient.getQueryData(sessionKey) ?? null).toBeNull();
    expect(submit()).toBeEnabled();
  });

  it('shows another backend message as sent', async () => {
    mockApi({ login: () => HttpResponse.json({ detail: 'Too many attempts' }, { status: 429 }) });
    renderWithProviders(<LoginView />);
    await userEvent.type(email(), 'ada@example.com');
    await userEvent.type(password(), 'correct-horse');
    await userEvent.click(submit());
    expect(await screen.findByTestId('login-error')).toHaveTextContent('Too many attempts');
  });

  it('falls back to a localized message for a server error without detail and clears it on the next try', async () => {
    let fail = true;
    mockApi({ login: () => (fail ? new HttpResponse(null, { status: 500 }) : HttpResponse.json({ ...TOKENS, user: userJson() })) });
    renderWithProviders(<LoginView />);
    await userEvent.type(email(), 'ada@example.com');
    await userEvent.type(password(), 'correct-horse');
    await userEvent.click(submit());
    expect(await screen.findByTestId('login-error')).toHaveTextContent(t('ERRORS.serverError'));

    fail = false;
    await userEvent.click(submit());
    await waitFor(() => expect(nav.hard).toHaveBeenCalledWith('/events'));
  });

  it('disables the button and shows the signing-in state while the request is in flight', async () => {
    let release!: () => void;
    const gate = new Promise<void>((resolve) => (release = resolve));
    mockApi({
      login: async () => {
        await gate;
        return HttpResponse.json({ ...TOKENS, user: userJson() });
      },
    });
    renderWithProviders(<LoginView />);
    await userEvent.type(email(), 'ada@example.com');
    await userEvent.type(password(), 'correct-horse');
    await userEvent.click(submit());

    const busy = await screen.findByRole('button', { name: new RegExp(t('AUTH.signing_in')) });
    expect(busy).toBeDisabled();
    release();
    await waitFor(() => expect(nav.hard).toHaveBeenCalledWith('/events'));
  });

  it('shows the OAuth failure the callback page left behind, once, and clears it', async () => {
    sessionStorage.setItem('bc_flash', 'oauth_failed');
    mockApi();
    renderWithProviders(<LoginView />);
    await waitFor(() => expect(nav.toast).toHaveBeenCalledWith('error', t('AUTH.oauth_failed')));
    expect(nav.toast).toHaveBeenCalledTimes(1);
    expect(sessionStorage.getItem('bc_flash')).toBeNull();
  });

  it('shows the same message for the backend redirect /login?oauth=failed and strips the parameter', async () => {
    window.history.replaceState({}, '', '/login?oauth=failed');
    mockApi();
    renderWithProviders(<LoginView />);
    await waitFor(() => expect(nav.toast).toHaveBeenCalledWith('error', t('AUTH.oauth_failed')));
    expect(window.location.search).toBe('');
    expect(nav.hard).not.toHaveBeenCalled();
  });

  it('shows no message for other values, and a stray flash value is discarded without a toast', async () => {
    window.history.replaceState({}, '', '/login?oauth=%3Cb%3E&redirect=//evil.example');
    sessionStorage.setItem('bc_flash', 'anything else');
    mockApi();
    renderWithProviders(<LoginView />);
    await screen.findByRole('heading', { level: 2 });
    expect(nav.toast).not.toHaveBeenCalled();
    expect(sessionStorage.getItem('bc_flash')).toBeNull();
    expect(nav.hard).not.toHaveBeenCalled();
  });

  it('offers a way back home to a signed-in visitor', async () => {
    mockApi({ guest: false });
    renderWithProviders(<LoginView />);
    expect(await screen.findByRole('link', { name: t('NAV.back_home') })).toHaveAttribute('href', '/events');
  });

  it('migrates a legacy refresh token before the session probe and removes both keys', async () => {
    localStorage.setItem('bc_refresh_token', 'legacy-token');
    localStorage.setItem('bc_has_session', '1');
    const order: string[] = [];
    mockApi({ guest: false });
    server.use(
      http.post(`${API}/auth/refresh`, async ({ request }) => {
        order.push(`refresh:${JSON.stringify(await request.json())}`);
        return HttpResponse.json(TOKENS);
      }),
      http.get(`${API}/auth/session-status`, () => {
        order.push('probe');
        return HttpResponse.json({ hasSession: true });
      }),
    );
    renderWithProviders(<LoginView />);
    await screen.findByRole('link', { name: t('NAV.back_home') });
    expect(order).toEqual(['refresh:{"refreshToken":"legacy-token"}', 'probe']);
    expect(localStorage.getItem('bc_refresh_token')).toBeNull();
    expect(localStorage.getItem('bc_has_session')).toBeNull();
  });
});

describe('LoginView hydration', () => {
  it('keeps text typed into the server-rendered inputs before React attached', async () => {
    const posts = mockApi();
    const client = () => new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const tree = (c: QueryClient) => (
      <QueryClientProvider client={c}>
        <NextIntlClientProvider locale="uk" messages={nest(messages.uk)}>
          <LoginView />
        </NextIntlClientProvider>
      </QueryClientProvider>
    );
    const container = document.body.appendChild(document.createElement('div'));
    container.innerHTML = renderToString(tree(client()));
    container.querySelector<HTMLInputElement>('#login-email')!.value = 'early@example.com';
    container.querySelector<HTMLInputElement>('#login-password')!.value = 'typed-before-hydration';

    let root!: ReturnType<typeof hydrateRoot>;
    await act(async () => {
      root = hydrateRoot(container, tree(client()));
    });
    expect(container.querySelector<HTMLInputElement>('#login-email')!.value).toBe('early@example.com');

    await userEvent.click(within(container).getByRole('button', { name: t('AUTH.submit_login') }));
    await waitFor(() => expect(posts).toEqual([{ email: 'early@example.com', password: 'typed-before-hydration' }]));
    act(() => root.unmount());
    container.remove();
  });
});
