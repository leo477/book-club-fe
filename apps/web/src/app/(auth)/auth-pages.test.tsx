import { screen } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { API, messages, renderWithProviders, server, setupApiServer } from '@/test/harness';
import { generateMetadata as callbackMeta } from './auth/callback/page';
import LoginPage, { generateMetadata as loginMeta } from './login/page';
import RegisterPage, { generateMetadata as registerMeta } from './register/page';

vi.mock('@/lib/navigate', () => ({ hardNavigate: vi.fn(), replaceNavigate: vi.fn() }));
vi.mock('next-intl/server', async () => {
  const { messages, nest } = await import('@/test/harness').then(async (h) => ({ messages: h.messages, nest: (await import('@/i18n/locale')).nest }));
  return {
    getLocale: async () => 'uk',
    getMessages: async () => nest(messages.uk),
    getTranslations: async () => (key: string) => messages.uk[key] ?? key,
  };
});
vi.mock('@/components/namespaces-intl', () => ({ NamespacesIntl: ({ children }: { children: ReactNode }) => children }));

setupApiServer();

describe('auth pages', () => {
  it.each([
    ['/login', loginMeta, 'SEO.login_title'],
    ['/register', registerMeta, 'SEO.register_title'],
    ['/auth/callback', callbackMeta, 'SEO.login_title'],
  ] as const)('%s is titled, not indexed and canonical', async (path, generate, titleKey) => {
    const meta = await generate();
    expect(meta.title).toBe(messages.uk[titleKey]);
    expect(meta.robots).toEqual({ index: false, follow: true });
    expect(String(meta.alternates?.canonical)).toMatch(new RegExp(`${path}$`));
  });

  it('renders the login form without the shell, after its lazy chunk loads', async () => {
    server.use(http.get(`${API}/auth/session-status`, () => HttpResponse.json({ hasSession: false })));
    renderWithProviders(LoginPage());
    expect(await screen.findByRole('heading', { level: 2, name: messages.uk['AUTH.sign_in_h2']! })).toBeInTheDocument();
    expect(screen.queryByRole('banner')).toBeNull();
    expect(screen.queryByRole('contentinfo')).toBeNull();
  });

  it('renders the register form without the shell', async () => {
    server.use(http.get(`${API}/auth/session-status`, () => HttpResponse.json({ hasSession: false })));
    renderWithProviders(RegisterPage());
    expect(await screen.findByRole('heading', { level: 2, name: messages.uk['AUTH.create_account_h2']! })).toBeInTheDocument();
    expect(screen.queryByRole('banner')).toBeNull();
  });
});
