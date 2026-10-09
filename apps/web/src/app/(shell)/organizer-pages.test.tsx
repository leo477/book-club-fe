import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { NextIntlClientProvider } from 'next-intl';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { nest } from '@/i18n/locale';
import { API, clubJson, eventJson, messages, renderWithProviders, server, setupApiServer, userJson } from '@/test/harness';
import { StranglerProvider } from '@/strangler/context';
import { NEXT_ROUTES } from '@/features/organizer/test-support';
import CreateClubPage, { generateMetadata as createClubMeta } from './clubs/create/page';
import EditClubPage, { generateMetadata as editClubMeta } from './clubs/[id]/edit/page';
import CreateEventPage, { generateMetadata as createEventMeta } from './clubs/[id]/events/create/page';
import EditEventPage, { generateMetadata as editEventMeta } from './events/[id]/edit/page';
import ManagePage, { generateMetadata as manageMeta } from './clubs/[id]/manage/page';
import RandomizerPage, { generateMetadata as randomizerMeta } from './clubs/[id]/randomizer/page';

const nav = vi.hoisted(() => ({ replace: vi.fn(), hard: vi.fn(), toast: vi.fn(), missing: [] as string[] }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: nav.replace }),
  notFound: () => {
    throw new Error('NEXT_NOT_FOUND');
  },
}));
vi.mock('@/lib/navigate', () => ({ hardNavigate: vi.fn(), replaceNavigate: nav.hard }));
vi.mock('@/lib/toast', () => ({ showToast: nav.toast }));
// like the real wrapper, ship only the listed namespaces, so a form that needs another one reports a missing message
vi.mock('@/components/namespaces-intl', async () => {
  const { messages, nest } = await import('@/test/harness').then(async (h) => ({ messages: h.messages, nest: (await import('@/i18n/locale')).nest }));
  const all = nest(messages.uk);
  return {
    NamespacesIntl: ({ namespaces, children }: { namespaces: readonly string[]; children: ReactNode }) => (
      <NextIntlClientProvider
        locale="uk"
        messages={Object.fromEntries(namespaces.map((ns) => [ns, all[ns]]))}
        onError={(error) => nav.missing.push(error.message)}
      >
        {children}
      </NextIntlClientProvider>
    ),
  };
});
vi.mock('next-intl/server', async () => {
  const { messages } = await import('@/test/harness');
  return {
    getLocale: async () => 'uk',
    getMessages: async () => nest(messages.uk),
    getTranslations: async () => (key: string) => messages.uk[key] ?? key,
  };
});

setupApiServer();
beforeEach(() => {
  nav.replace.mockReset();
  nav.hard.mockReset();
  nav.toast.mockReset();
  nav.missing.length = 0;
});

const CLUB = '3f2b8c1e-9a4d-4e7b-8c5f-1a2b3c4d5e6f';
const EVENT = '7a1d9e44-5b2c-4f60-9d11-0c2b3a4d5e6f';
const UPPER = CLUB.toUpperCase();

const session = (role: string) =>
  server.use(
    http.get(`${API}/auth/session-status`, () => HttpResponse.json({ hasSession: true })),
    http.get(`${API}/auth/me`, () => HttpResponse.json(userJson({ id: 'u1', role }))),
    http.get(`${API}/clubs/my`, () => HttpResponse.json([])),
    http.get(`${API}/clubs/${CLUB}`, () => HttpResponse.json(clubJson({ id: CLUB, organizerId: 'u1' }))),
    http.get(`${API}/events/${EVENT}`, () => HttpResponse.json(eventJson({ id: EVENT, clubId: CLUB, organizerId: 'u1', date: '2099-05-01T18:30:00.000Z' }))),
  );

const params = (id: string) => ({ params: Promise.resolve({ id }) });

const pages = [
  { name: '/clubs/create', element: () => CreateClubPage(), heading: 'CREATE_CLUB.title', field: 'club-name-input' },
  { name: '/clubs/:id/edit', element: async () => EditClubPage(params(UPPER)), heading: 'EDIT_CLUB.title', field: 'club-name-input' },
  { name: '/clubs/:id/events/create', element: async () => CreateEventPage(params(UPPER)), heading: 'CREATE_EVENT.heading', field: 'event-title-input' },
  { name: '/events/:id/edit', element: async () => EditEventPage(params(EVENT)), heading: 'EVENTS.editEvent', field: 'event-title-input' },
];

describe('organizer pages: metadata', () => {
  it.each([
    ['/clubs/create', () => createClubMeta(), 'SEO.create_club_title', '/clubs/create'],
    ['/clubs/:id/edit', () => editClubMeta(params(UPPER)), 'SEO.clubs_title', `/clubs/${CLUB}/edit`],
    ['/clubs/:id/events/create', () => createEventMeta(params(UPPER)), 'TITLES.events', `/clubs/${CLUB}/events/create`],
    ['/events/:id/edit', () => editEventMeta(params(EVENT)), 'TITLES.events', `/events/${EVENT}/edit`],
    ['/clubs/:id/manage', () => manageMeta(params(UPPER)), 'SEO.clubs_title', `/clubs/${CLUB}/manage`],
    ['/clubs/:id/randomizer', () => randomizerMeta(params(UPPER)), 'SEO.clubs_title', `/clubs/${CLUB}/randomizer`],
  ])('%s is titled, never indexed and canonical in lower case', async (_name, meta, titleKey, path) => {
    const metadata = await meta();
    expect(metadata.title).toBe(messages.uk[titleKey]);
    expect(metadata.robots).toEqual({ index: false, follow: true });
    expect(String(metadata.alternates?.canonical)).toMatch(new RegExp(`${path}$`));
  });
});

describe.each(pages)('$name page', ({ element, heading, field }) => {
  it('shows the form to an organizer with every message it needs in the shipped namespaces', async () => {
    session('organizer');
    renderWithProviders(
      <StranglerProvider value={NEXT_ROUTES}>{await element()}</StranglerProvider>,
    );
    await screen.findByRole('heading', { level: 1, name: messages.uk[heading] ?? heading });
    await screen.findByTestId(field);
    expect(nav.missing).toEqual([]);
  });

  it('turns a plain reader away with the organizers-only toast', async () => {
    session('user');
    renderWithProviders(<StranglerProvider value={NEXT_ROUTES}>{await element()}</StranglerProvider>);
    await waitFor(() => expect(nav.replace).toHaveBeenCalledWith('/clubs'));
    expect(nav.toast).toHaveBeenCalledWith('error', messages.uk['ERRORS.organizers_only']);
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
    expect(nav.missing).toEqual([]);
  });

  it('sends a guest to /login', async () => {
    server.use(http.get(`${API}/auth/session-status`, () => HttpResponse.json({ hasSession: false })));
    renderWithProviders(await element());
    await waitFor(() => expect(nav.hard).toHaveBeenCalledWith('/login'));
  });
});

describe('organizer pages: id parameter', () => {
  it.each([
    ['/clubs/:id/edit', (id: string) => EditClubPage(params(id))],
    ['/clubs/:id/events/create', (id: string) => CreateEventPage(params(id))],
    ['/events/:id/edit', (id: string) => EditEventPage(params(id))],
    ['/clubs/:id/manage', (id: string) => ManagePage(params(id))],
    ['/clubs/:id/randomizer', (id: string) => RandomizerPage(params(id))],
  ])('%s answers 404 for an id that is not a UUID', async (_name, page) => {
    await expect(page('create')).rejects.toThrow('NEXT_NOT_FOUND');
    await expect(page('../../auth/me')).rejects.toThrow('NEXT_NOT_FOUND');
  });
});

describe.each([
  { name: '/clubs/:id/manage', element: () => ManagePage(params(UPPER)) },
  { name: '/clubs/:id/randomizer', element: () => RandomizerPage(params(UPPER)) },
])('$name page', ({ name, element }) => {
  const reads = () =>
    server.use(
      http.get(`${API}/clubs/${CLUB}/members`, () => HttpResponse.json([{ userId: 'm1', displayName: 'Grace', avatarUrl: null, role: 'member', socials: { telegram: 'g' }, socialsPublic: true }, { userId: 'm2', displayName: 'Alan', avatarUrl: null, role: 'member', socials: null, socialsPublic: false }])),
      http.get(`${API}/clubs/${CLUB}/bans`, () => HttpResponse.json([{ userId: 'm1', clubId: CLUB, bannedAt: '2099-01-01T00:00:00Z', duration: 3, bannedBy: 'u1' }])),
      http.get(`${API}/clubs/${CLUB}/join-requests`, () => HttpResponse.json([{ userId: 'r1', displayName: 'Kat', avatarUrl: null, status: 'pending', source: 'link', createdAt: '2099-01-01T00:00:00Z' }])),
      http.get(`${API}/clubs/${CLUB}/stats`, () => HttpResponse.json({ topActive: [], topWinners: [], recentAttendance: [], totalMembers: 1, totalEvents: 0, totalMessages: 0, memberGrowth: [], eventFrequency: [], bannedUsersCount: 0, upcomingEventsCount: 0 })),
      http.get(`${API}/clubs/${CLUB}/randomizer/history`, () => HttpResponse.json([])),
    );

  it('renders for an organizer with every message it needs in the shipped namespaces', async () => {
    session('organizer');
    reads();
    renderWithProviders(<StranglerProvider value={NEXT_ROUTES}>{await element()}</StranglerProvider>);
    if (name.endsWith('manage')) {
      await screen.findByRole('heading', { level: 1, name: 'Alpha Readers' });
      const user = userEvent.setup();
      for (const tab of ['members', 'requests', 'settings', 'tools']) {
        await user.click(screen.getByRole('tab', { name: new RegExp(messages.uk[`CLUB_MANAGE.tab_${tab}`] ?? tab) }));
        await screen.findByRole('tabpanel');
      }
      await screen.findByText(messages.uk['CLUB_DETAIL.chat_create_title'] ?? '');
    } else {
      await screen.findByRole('heading', { level: 1, name: new RegExp(messages.uk['RANDOMIZER.title'] ?? '') });
      await screen.findByText('Grace');
    }
    expect(nav.missing).toEqual([]);
  });

  it('turns a plain reader away with the organizers-only toast', async () => {
    session('user');
    renderWithProviders(<StranglerProvider value={NEXT_ROUTES}>{await element()}</StranglerProvider>);
    await waitFor(() => expect(nav.replace).toHaveBeenCalledWith('/clubs'));
    expect(nav.toast).toHaveBeenCalledWith('error', messages.uk['ERRORS.organizers_only']);
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
  });

  it('sends a guest to /login', async () => {
    server.use(http.get(`${API}/auth/session-status`, () => HttpResponse.json({ hasSession: false })));
    renderWithProviders(await element());
    await waitFor(() => expect(nav.hard).toHaveBeenCalledWith('/login'));
  });
});
