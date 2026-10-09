import { StrictMode } from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { API, messages, renderWithProviders, server, setupApiServer, userJson } from '@/test/harness';
import { sessionKey } from '@/features/clubs/use-session';
import { RegisterView, WELCOME_MS } from './register-form';

const nav = vi.hoisted(() => ({ hard: vi.fn() }));
vi.mock('@/lib/navigate', () => ({ hardNavigate: nav.hard, replaceNavigate: vi.fn() }));

setupApiServer();

const t = (key: string, locale: 'uk' | 'en' = 'uk') => (messages[locale][key] ?? key).replace(/''/g, "'");
const TOKENS = { accessToken: 'jwt-access-secret', refreshToken: 'jwt-refresh-secret' };

function mockApi(register?: () => Response | Promise<Response>) {
  const posts: unknown[] = [];
  server.use(
    http.get(`${API}/auth/session-status`, () => HttpResponse.json({ hasSession: false })),
    http.post(`${API}/auth/register`, async ({ request }) => {
      posts.push(await request.json());
      return register ? register() : HttpResponse.json({ ...TOKENS, user: userJson({ displayName: 'Ada Lovelace', role: 'organizer' }) });
    }),
  );
  return posts;
}

const field = (id: string) => document.querySelector<HTMLInputElement>(`#${id}`)!;
const submit = () => screen.getByRole('button', { name: t('AUTH.create_account_h2') });

async function fillValid(overrides: Partial<Record<'name' | 'email' | 'password' | 'confirm', string>> = {}) {
  await userEvent.type(field('reg-display-name'), overrides.name ?? 'Ada Lovelace');
  await userEvent.type(field('reg-email'), overrides.email ?? 'ada@example.com');
  await userEvent.type(field('reg-password'), overrides.password ?? 'Correct-horse1');
  await userEvent.type(field('reg-confirm-password'), overrides.confirm ?? overrides.password ?? 'Correct-horse1');
}

// The welcome redirect timer outlives the test that started it and would call the next test's navigation mock.
const timers = new Set<ReturnType<typeof setTimeout>>();
const realSetTimeout = globalThis.setTimeout;

beforeEach(() => {
  vi.spyOn(globalThis, 'setTimeout').mockImplementation(((...args: Parameters<typeof setTimeout>) => {
    const id = realSetTimeout(...args);
    if (args[1] === WELCOME_MS) timers.add(id);
    return id;
  }) as typeof setTimeout);
  nav.hard.mockReset();
  localStorage.clear();
  sessionStorage.clear();
});

afterEach(() => {
  vi.mocked(globalThis.setTimeout).mockRestore();
  for (const id of timers) clearTimeout(id);
  timers.clear();
});

describe('RegisterView', () => {
  it('renders the four fields with their e2e ids and a reader role selected by default', () => {
    mockApi();
    renderWithProviders(<RegisterView />);
    for (const id of ['reg-display-name', 'reg-email', 'reg-password', 'reg-confirm-password']) expect(field(id)).toBeInTheDocument();
    expect(screen.getByLabelText(t('AUTH.confirm_password'))).toBe(field('reg-confirm-password'));
    expect(screen.getByRole('button', { name: new RegExp(t('AUTH.role_reader_label')) })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: new RegExp(t('AUTH.role_organizer_label')) })).toHaveAttribute('aria-pressed', 'false');
  });

  it.each(['uk', 'en'] as const)('reports required, rule and mismatch errors in %s with aria wiring and no request', async (locale) => {
    const posts = mockApi();
    renderWithProviders(<RegisterView />, locale);
    await userEvent.click(screen.getByRole('button', { name: t('AUTH.create_account_h2', locale) }));
    expect(await screen.findAllByText(t('FORM_ERRORS.required', locale))).toHaveLength(4);

    await userEvent.type(field('reg-display-name'), '<b>');
    await userEvent.type(field('reg-email'), 'nope');
    await userEvent.type(field('reg-password'), 'short');
    await userEvent.type(field('reg-confirm-password'), 'different');
    await userEvent.tab();
    expect(await screen.findByText(t('SECURITY.invalid_display_name', locale))).toBeInTheDocument();
    expect(screen.getByTestId('register-email-error')).toHaveTextContent(t('FORM_ERRORS.email', locale));
    expect(screen.getByText(t('FORM_ERRORS.minlength', locale).replace('{requiredLength}', '8'))).toBeInTheDocument();
    expect(screen.getByText(t('AUTH.passwords_no_match', locale))).toBeInTheDocument();
    expect(field('reg-display-name')).toHaveAttribute('aria-invalid', 'true');
    expect(field('reg-confirm-password').getAttribute('aria-describedby')).toBeTruthy();
    expect(posts).toEqual([]);
  });

  it('applies the two-character minimum with its length', async () => {
    mockApi();
    renderWithProviders(<RegisterView />);
    await userEvent.type(field('reg-display-name'), 'a');
    await userEvent.tab();
    expect(await screen.findByText(t('FORM_ERRORS.minlength').replace('{requiredLength}', '2'))).toBeInTheDocument();
  });

  it('re-checks the mismatch when the password changes after the confirmation was touched', async () => {
    mockApi();
    renderWithProviders(<RegisterView />);
    await userEvent.type(field('reg-password'), 'Correct-horse1');
    await userEvent.type(field('reg-confirm-password'), 'Correct-horse2');
    await userEvent.tab();
    expect(await screen.findByText(t('AUTH.passwords_no_match'))).toBeInTheDocument();
    await userEvent.clear(field('reg-password'));
    await userEvent.type(field('reg-password'), 'Correct-horse2');
    await waitFor(() => expect(screen.queryByText(t('AUTH.passwords_no_match'))).toBeNull());
  });

  it('shows the password strength', async () => {
    mockApi();
    renderWithProviders(<RegisterView />);
    expect(screen.queryByText(t('AUTH.password_weak'))).toBeNull();
    await userEvent.type(field('reg-password'), 'abc');
    expect(screen.getByText(t('AUTH.password_weak'))).toBeInTheDocument();
    await userEvent.clear(field('reg-password'));
    await userEvent.type(field('reg-password'), 'abcdefgh1');
    expect(screen.getByText(t('AUTH.password_medium'))).toBeInTheDocument();
    await userEvent.clear(field('reg-password'));
    await userEvent.type(field('reg-password'), 'Abcdefgh1');
    expect(screen.getByText(t('AUTH.password_strong'))).toBeInTheDocument();
  });

  it('registers with the chosen role, primes the session, shows the welcome card and then hard-navigates to /events', async () => {
    const posts = mockApi();
    const { queryClient } = renderWithProviders(<RegisterView />);
    await userEvent.click(screen.getByRole('button', { name: new RegExp(t('AUTH.role_organizer_label')) }));
    expect(screen.getByRole('button', { name: new RegExp(t('AUTH.role_organizer_label')) })).toHaveAttribute('aria-pressed', 'true');
    await fillValid();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      fireEvent.click(submit());
      const feedback = await screen.findByTestId('register-feedback');
      expect(feedback).toHaveTextContent(t('AUTH.account_created'));
      expect(feedback).toHaveTextContent('Ada Lovelace');
      expect(screen.getByRole('link', { name: t('AUTH.back_to_login') })).toHaveAttribute('href', '/login');
      expect(posts).toEqual([{ displayName: 'Ada Lovelace', email: 'ada@example.com', password: 'Correct-horse1', role: 'organizer' }]);
      expect(queryClient.getQueryData(sessionKey)).toMatchObject({ id: 'u1' });
      expect(nav.hard).not.toHaveBeenCalled();
      vi.advanceTimersByTime(WELCOME_MS);
      expect(nav.hard).toHaveBeenCalledWith('/events');
      vi.advanceTimersByTime(WELCOME_MS * 2);
      expect(nav.hard).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it('navigates exactly once under Strict Mode, after the delay', async () => {
    mockApi();
    renderWithProviders(
      <StrictMode>
        <RegisterView />
      </StrictMode>,
    );
    await fillValid();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      fireEvent.click(submit());
      await screen.findByText(t('AUTH.account_created'));
      expect(nav.hard).not.toHaveBeenCalled();
      vi.advanceTimersByTime(WELCOME_MS);
      expect(nav.hard).toHaveBeenCalledExactlyOnceWith('/events');
      vi.advanceTimersByTime(WELCOME_MS * 2);
      expect(nav.hard).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it('cancels the welcome redirect when the user leaves before the delay', async () => {
    mockApi();
    const { unmount } = renderWithProviders(<RegisterView />);
    await fillValid();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      fireEvent.click(submit());
      await screen.findByText(t('AUTH.account_created'));
      unmount();
      vi.advanceTimersByTime(WELCOME_MS * 2);
      expect(nav.hard).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });

  it('treats the 202 e-mail confirmation as success with the confirm-your-email card, no session and no navigation', async () => {
    mockApi(() => HttpResponse.json({ message: 'Check your email to confirm registration', code: 'EMAIL_CONFIRMATION_REQUIRED' }, { status: 202 }));
    const { queryClient } = renderWithProviders(<RegisterView />);
    await fillValid();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const scheduled = vi.spyOn(globalThis, 'setTimeout');
    try {
      fireEvent.click(submit());
      const card = await screen.findByTestId('register-feedback');
      expect(card).toHaveTextContent(t('AUTH.check_email'));
      expect(card).toHaveTextContent(t('AUTH.confirmation_sent'));
      expect(card).toHaveTextContent('ada@example.com');
      expect(card).not.toHaveTextContent(t('AUTH.account_created'));
      expect(screen.getByRole('link', { name: t('AUTH.back_to_login') })).toHaveAttribute('href', '/login');
      expect(queryClient.getQueryData(sessionKey) ?? null).toBeNull();
      expect(scheduled.mock.calls.some(([, ms]) => ms === WELCOME_MS)).toBe(false);
      expect(nav.hard).not.toHaveBeenCalled();
      vi.advanceTimersByTime(WELCOME_MS * 2);
      expect(nav.hard).not.toHaveBeenCalled();
    } finally {
      scheduled.mockRestore();
      vi.useRealTimers();
    }
  });

  it('never writes a token to storage, cookies or the query cache', async () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    mockApi();
    const { queryClient } = renderWithProviders(<RegisterView />);
    await fillValid();
    await userEvent.click(submit());
    await screen.findByTestId('register-feedback');
    expect(setItem).not.toHaveBeenCalled();
    expect(localStorage.length + sessionStorage.length).toBe(0);
    expect(document.cookie).toBe('');
    expect(JSON.stringify(queryClient.getQueryCache().getAll().map((q) => q.state.data))).not.toContain('jwt-');
    setItem.mockRestore();
  });

  it.each([
    ['success', undefined],
    ['failure', () => HttpResponse.json({ detail: 'Email already registered' }, { status: 409 })],
  ])('keeps the typed password out of the mutation and query caches after %s', async (_name, register) => {
    mockApi(register);
    const { queryClient } = renderWithProviders(<RegisterView />);
    await fillValid({ password: 'hunter2-Secret' });
    await userEvent.click(submit());
    await screen.findByTestId('register-feedback');
    const cached = JSON.stringify([queryClient.getMutationCache().getAll().map((m) => m.state), queryClient.getQueryCache().getAll().map((q) => q.state.data)]);
    expect(cached).not.toContain('hunter2-Secret');
    expect(cached).not.toContain('jwt-');
  });

  it('shows the backend message in a register-feedback alert and keeps the form editable', async () => {
    mockApi(() => HttpResponse.json({ detail: 'Email already registered' }, { status: 409 }));
    const { queryClient } = renderWithProviders(<RegisterView />);
    await fillValid();
    await userEvent.click(submit());

    expect(await screen.findByTestId('register-feedback')).toHaveTextContent('Email already registered');
    expect(field('reg-email')).toHaveValue('ada@example.com');
    expect(submit()).toBeEnabled();
    expect(nav.hard).not.toHaveBeenCalled();
    expect(queryClient.getQueryData(sessionKey) ?? null).toBeNull();
  });

  it('shows a localized message for a server error without detail', async () => {
    mockApi(() => new HttpResponse(null, { status: 500 }));
    renderWithProviders(<RegisterView />);
    await fillValid();
    await userEvent.click(submit());
    expect(await screen.findByTestId('register-feedback')).toHaveTextContent(t('ERRORS.serverError'));
  });

  it('disables the button with the creating-account label while the request is in flight', async () => {
    let release!: () => void;
    const gate = new Promise<void>((resolve) => (release = resolve));
    mockApi(async () => {
      await gate;
      return HttpResponse.json({ ...TOKENS, user: userJson() });
    });
    renderWithProviders(<RegisterView />);
    await fillValid();
    await userEvent.click(submit());
    expect(await screen.findByRole('button', { name: new RegExp(t('AUTH.creating_account')) })).toBeDisabled();
    release();
    await screen.findByText(t('AUTH.account_created'));
  });
});
