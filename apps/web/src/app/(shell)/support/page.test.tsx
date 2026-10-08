import { screen, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { API, messages, renderWithProviders, server, setupApiServer, userJson } from '@/test/harness';
import SupportPage, { generateMetadata } from './page';
import NewSubmissionPage, { generateMetadata as newMetadata } from './new/page';

const nav = vi.hoisted(() => ({ hard: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: vi.fn(), push: vi.fn() }) }));
vi.mock('@/lib/navigate', () => ({ hardNavigate: vi.fn(), replaceNavigate: nav.hard }));
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

const signedIn = () =>
  server.use(
    http.get(`${API}/auth/session-status`, () => HttpResponse.json({ hasSession: true })),
    http.get(`${API}/auth/me`, () => HttpResponse.json(userJson())),
    http.get(`${API}/support`, () => HttpResponse.json([])),
  );

describe('/support pages', () => {
  it('are titled like the Angular components, not indexed, with absolute canonicals', async () => {
    const board = await generateMetadata();
    expect(board.title).toBe(messages.uk['SUPPORT.title']);
    expect(board.robots).toEqual({ index: false, follow: true });
    expect(String(board.alternates?.canonical)).toMatch(/\/support$/);
    const create = await newMetadata();
    expect(create.title).toBe(messages.uk['SUPPORT.create_title']);
    expect(String(create.alternates?.canonical)).toMatch(/\/support\/new$/);
  });

  it('render the board and the form for any signed-in user', async () => {
    signedIn();
    const board = renderWithProviders(SupportPage());
    expect(await screen.findByTestId('support-new')).toBeInTheDocument();
    board.unmount();
    renderWithProviders(NewSubmissionPage());
    expect(await screen.findByTestId('submission-submit')).toBeInTheDocument();
  });

  it.each([
    ['board', () => SupportPage()],
    ['form', () => NewSubmissionPage()],
  ])('send a guest to /login from the %s', async (_name, page) => {
    nav.hard.mockReset();
    server.use(http.get(`${API}/auth/session-status`, () => HttpResponse.json({ hasSession: false })));
    renderWithProviders(page());
    await waitFor(() => expect(nav.hard).toHaveBeenCalledWith('/login'));
    expect(screen.queryByTestId('support-new')).not.toBeInTheDocument();
    expect(screen.queryByTestId('submission-submit')).not.toBeInTheDocument();
  });
});
