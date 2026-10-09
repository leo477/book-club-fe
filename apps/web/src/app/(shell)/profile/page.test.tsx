import { screen, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { API, messages, renderWithProviders, server, setupApiServer, userJson } from '@/test/harness';
import ProfilePage, { generateMetadata } from './page';

const nav = vi.hoisted(() => ({ hard: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: vi.fn() }) }));
vi.mock('@/lib/navigate', () => ({ hardNavigate: vi.fn(), replaceNavigate: nav.hard }));
// the real wrapper is an async Server Component; the harness provider supplies the messages
vi.mock('@/components/namespaces-intl', () => ({ NamespacesIntl: ({ children }: { children: ReactNode }) => children }));
vi.mock('next-intl/server', async () => {
  const { messages, nest } = await import('@/test/harness').then(async (h) => ({ messages: h.messages, nest: (await import('@/i18n/locale')).nest }));
  return {
    getLocale: async () => 'uk',
    getMessages: async () => nest(messages.uk),
    getTranslations: async () => (key: string) => messages.uk[key] ?? key,
  };
});

setupApiServer();

describe('/profile page', () => {
  it('is titled SEO.profile_title, not indexed, with an absolute canonical', async () => {
    const meta = await generateMetadata();
    expect(meta.title).toBe(messages.uk['SEO.profile_title']);
    expect(meta.robots).toEqual({ index: false, follow: true });
    expect(String(meta.alternates?.canonical)).toMatch(/\/profile$/);
  });

  it('renders the profile for a signed-in user (any role)', async () => {
    server.use(
      http.get(`${API}/auth/session-status`, () => HttpResponse.json({ hasSession: true })),
      http.get(`${API}/auth/me`, () => HttpResponse.json(userJson({ displayName: 'Ada' }))),
      http.get(`${API}/users/me/stats`, () => HttpResponse.json({ clubsJoined: 1, quizzesTaken: 0, quizWins: 0, likesReceived: 0, booksRead: 0 })),
    );
    renderWithProviders(ProfilePage());
    // the first render in this file pays the cold lazy import and ICU parsing (~0.5s idle), so the 1s default is too tight under load
    expect(await screen.findByRole('heading', { level: 1, name: 'Ada' }, { timeout: 5000 })).toBeInTheDocument();
  });

  it('sends a guest to /login without rendering the profile (authGuard parity)', async () => {
    server.use(http.get(`${API}/auth/session-status`, () => HttpResponse.json({ hasSession: false })));
    renderWithProviders(ProfilePage());
    await waitFor(() => expect(nav.hard).toHaveBeenCalledWith('/login'));
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
  });
});
