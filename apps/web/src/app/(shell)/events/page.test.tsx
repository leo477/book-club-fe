import { screen } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { API, eventJson, messages, renderWithProviders, server, setupApiServer, userJson } from '@/test/harness';
import DetailPage, { generateMetadata as detailMetadata } from './[id]/page';
import EventsPage, { generateMetadata } from './page';

const UUID = '3F2B8C1E-9A4D-4E7B-8C5F-1A2B3C4D5E6F';

vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: vi.fn() }) }));
vi.mock('@/lib/navigate', () => ({ hardNavigate: vi.fn(), replaceNavigate: vi.fn() }));
// the real wrapper is an async Server Component; the shell-less messages come from the test harness provider
vi.mock('@/features/events/events-intl', () => ({ EventsIntl: ({ children }: { children: ReactNode }) => children }));
vi.mock('next-intl/server', async () => {
  const { messages, nest } = await import('@/test/harness').then(async (h) => ({ messages: h.messages, nest: (await import('@/i18n/locale')).nest }));
  return {
    getLocale: async () => 'uk',
    getMessages: async () => nest(messages.uk),
    getTranslations: async () => (key: string, values?: Record<string, string>) => (messages.uk[key] ?? key).replace(/\{(\w+)\}/g, (_, k: string) => values?.[k] ?? ''),
  };
});

setupApiServer();

describe('/events pages', () => {
  it('are titled TITLES.events, not indexed, with an absolute canonical', async () => {
    const meta = await generateMetadata();
    expect(meta.title).toBe(messages.uk['TITLES.events']);
    expect(meta.robots).toEqual({ index: false, follow: true });
    expect(String(meta.alternates?.canonical)).toMatch(/\/events$/);

    const detail = await detailMetadata({ params: Promise.resolve({ id: UUID }) });
    expect(detail.robots).toEqual({ index: false, follow: true });
    expect(String(detail.alternates?.canonical)).toMatch(new RegExp(`/events/${UUID.toLowerCase()}$`));
  });

  it('render the feed behind the auth boundary', async () => {
    server.use(
      http.get(`${API}/auth/session-status`, () => HttpResponse.json({ hasSession: true })),
      http.get(`${API}/auth/me`, () => HttpResponse.json(userJson())),
      http.get(`${API}/events/my`, () => HttpResponse.json([])),
      http.get(`${API}/events`, () => HttpResponse.json([eventJson()])),
    );
    renderWithProviders(EventsPage());
    expect(await screen.findByText('Dune night')).toBeInTheDocument();
  });

  it('pass the lower-cased route id to the detail', async () => {
    server.use(
      http.get(`${API}/auth/session-status`, () => HttpResponse.json({ hasSession: true })),
      http.get(`${API}/auth/me`, () => HttpResponse.json(userJson())),
      http.get(`${API}/events/${UUID.toLowerCase()}`, () => HttpResponse.json(eventJson({ id: UUID.toLowerCase(), title: 'By id' }))),
      http.get(`${API}/books/stores`, () => HttpResponse.json([])),
    );
    renderWithProviders(await DetailPage({ params: Promise.resolve({ id: UUID }) }));
    expect(await screen.findByRole('heading', { level: 1, name: 'By id' })).toBeInTheDocument();
  });
});
