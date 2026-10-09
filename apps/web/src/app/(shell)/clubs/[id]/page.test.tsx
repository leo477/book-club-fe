import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { screen, waitFor, within } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { renderToString } from 'react-dom/server';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { clubOrStub, clubEvent, club as clubSchema } from '@book-club/contracts';
import { nest } from '@/i18n/locale';
import { API, clubJson, eventJson, memberJson, messages, renderWithProviders, roundJson, server, setupApiServer, userJson } from '@/test/harness';
import ClubDetailPage, { generateMetadata } from './page';

const ID = '3f2b8c1e-9a4d-4e7b-8c5f-1a2b3c4d5e6f';
const params = Promise.resolve({ id: ID });

const getClub = vi.hoisted(() => vi.fn());
const getEvents = vi.hoisted(() => vi.fn());
const serverApi = vi.hoisted(() => vi.fn());
const state = vi.hoisted(() => ({ locale: 'uk' as 'uk' | 'en' }));
const toast = vi.hoisted(() => vi.fn());
vi.mock('@/lib/server-api', () => ({ serverApi }));
vi.mock('@/lib/toast', () => ({ showToast: toast }));
const hardNavigate = vi.hoisted(() => vi.fn());
vi.mock('@/lib/navigate', () => ({ hardNavigate }));
vi.mock('qrcode', () => ({ default: { toCanvas: vi.fn().mockResolvedValue(undefined) } }));
vi.mock('next-intl/server', async () => {
  const { messages } = await import('@/test/harness');
  const { nest } = await import('@/i18n/locale');
  return {
    getLocale: async () => state.locale,
    getMessages: async () => nest(messages[state.locale]),
    getTranslations: async (ns?: string) => (key: string, values?: Record<string, string>) =>
      (messages[state.locale][ns ? `${ns}.${key}` : key] ?? key).replace(/\{(\w+)\}/g, (_, name: string) => values?.[name] ?? ''),
  };
});

setupApiServer();

const STUB = { id: ID, name: 'Secret Readers', isPublic: false, memberCount: 7 };
const t = (key: string) => messages.uk[key] ?? key;
const parsedClub = (overrides: Record<string, unknown> = {}) => clubSchema.parse(clubJson({ id: ID, organizerId: 'o1', ...overrides }));
const parsedEvent = (overrides: Record<string, unknown> = {}) => clubEvent.parse(eventJson({ clubId: ID, ...overrides }));

beforeEach(() => {
  state.locale = 'uk';
  toast.mockReset();
  hardNavigate.mockReset();
  getClub.mockReset().mockResolvedValue(parsedClub());
  getEvents.mockReset().mockResolvedValue([parsedEvent()]);
  serverApi.mockReset().mockReturnValue({ clubs: { get: getClub, events: getEvents } });
});

interface Scenario {
  user?: Record<string, unknown> | null;
  mine?: string[];
  membership?: Record<string, unknown>;
  members?: Record<string, unknown>[];
  events?: Record<string, unknown>[];
  round?: Record<string, unknown> | null;
  /** the viewer's own answer to GET /clubs/:id (the browser refetch of a private club) */
  club?: { status?: number; body: Record<string, unknown> };
  membersStatus?: number;
}

/** Client-side API of the signed-in (or guest) viewer; every request is recorded as "METHOD /path". */
function mockApi({ user = null, mine = [], membership = {}, members = [], events, round = null, club, membersStatus = 200 }: Scenario = {}) {
  const calls: string[] = [];
  const log = (method: string, path: string) => calls.push(`${method} ${path}`);
  server.use(
    http.get(`${API}/auth/session-status`, () => HttpResponse.json({ hasSession: user !== null })),
    http.get(`${API}/auth/me`, () => HttpResponse.json(user ?? {}, { status: user ? 200 : 401 })),
    http.get(`${API}/clubs/my`, () => {
      log('GET', '/clubs/my');
      return HttpResponse.json(mine.map((id) => clubJson({ id })));
    }),
    http.get(`${API}/clubs/${ID}/my-membership`, () => {
      log('GET', 'my-membership');
      return HttpResponse.json({ isMember: mine.includes(ID), role: null, joinRequestStatus: 'none', ...membership });
    }),
    http.get(`${API}/clubs/${ID}/members`, () => {
      log('GET', 'members');
      return membersStatus === 200 ? HttpResponse.json(members) : HttpResponse.json({ detail: 'Forbidden' }, { status: membersStatus });
    }),
    http.get(`${API}/clubs/${ID}`, () => {
      log('GET', 'club');
      return HttpResponse.json(club?.body ?? STUB, { status: club?.status ?? 200 });
    }),
    http.get(`${API}/clubs/${ID}/events`, ({ request }) => {
      const past = new URL(request.url).searchParams.get('include_past') === 'true';
      log('GET', past ? 'events?include_past' : 'events');
      return HttpResponse.json(events ?? [eventJson({ clubId: ID, isAttending: true })]);
    }),
    http.get(`${API}/clubs/${ID}/book-vote/round`, () => {
      log('GET', 'round');
      return HttpResponse.json(round);
    }),
    http.get(`${API}/books/stores`, () => HttpResponse.json([{ name: 'Yakaboo', url: 'https://yakaboo.ua/x', found: true }])),
  );
  return calls;
}

const render = async () => renderWithProviders(await ClubDetailPage({ params }));

describe('server render', () => {
  it('fetches anonymously with 10-minute ISR tagged per club and puts the club into the HTML', async () => {
    mockApi();
    getClub.mockResolvedValue(parsedClub({ description: 'Reads classics', currentBook: 'Dune' }));
    await render();
    expect(serverApi).toHaveBeenCalledWith({ revalidate: 600, tags: [`club:${ID}`] }, { timeoutMs: 9000 });
    expect(getClub).toHaveBeenCalledWith(ID);
    expect(getEvents).toHaveBeenCalledWith(ID);
    expect(screen.getByRole('heading', { level: 1, name: 'Alpha Readers' })).toBeInTheDocument();
    expect(screen.getByText('Reads classics')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Dune night' })).toHaveAttribute('href', '/events/e1');
    expect(screen.getByRole('link', { name: t('CLUB_DETAIL.back') })).toHaveAttribute('href', '/clubs');
    expect(screen.getByText('Dune', { selector: 'p' })).toBeInTheDocument();
  });

  it('emits Organization + upcoming Event JSON-LD that cannot close the script element', async () => {
    mockApi();
    getClub.mockResolvedValue(parsedClub({ name: 'A </script><script>alert(1)</script>', tags: ['x'] }));
    getEvents.mockResolvedValue([parsedEvent(), parsedEvent({ id: 'e2', status: 'held' }), parsedEvent({ id: 'e3', status: 'cancelled' })]);
    const { container } = await render();
    const script = container.querySelector('script[type="application/ld+json"]')!;
    expect(script.innerHTML).not.toContain('</script>');
    expect(script.innerHTML).not.toContain('<');
    const graph = JSON.parse(script.textContent ?? '')['@graph'] as { '@type': string; name: string; url: string }[];
    expect(graph.map((n) => n['@type'])).toEqual(['Organization', 'Event']);
    expect(graph[0]).toMatchObject({ name: 'A </script><script>alert(1)</script>', url: `https://book-club-planer.vercel.app/clubs/${ID}`, keywords: 'x' });
    expect(graph[1]).toMatchObject({ name: 'Dune night', startDate: '2099-05-01T18:00:00Z', url: 'https://book-club-planer.vercel.app/events/e1' });
  });

  it('treats a full private record from an old backend as a stub: no structured data, nothing of the club rendered or in metadata', async () => {
    mockApi();
    getClub.mockResolvedValue(parsedClub({ isPublic: false, name: 'Secret Readers', description: 'hidden plans', city: 'Kyiv' }));
    const { container } = await render();
    expect(container.querySelector('script[type="application/ld+json"]')).toBeNull();
    expect(screen.getByTestId('private-stub')).toBeInTheDocument();
    expect(screen.queryByText('hidden plans')).toBeNull();
    const meta = await generateMetadata({ params });
    expect(JSON.stringify(meta)).not.toMatch(/Secret Readers|hidden plans|Kyiv/);
    expect(meta.robots).toMatchObject({ index: false });
  });

  it('normalizes an upper-case id: lower-case fetch, tag and canonical', async () => {
    mockApi();
    const upper = Promise.resolve({ id: ID.toUpperCase() });
    await renderWithProviders(await ClubDetailPage({ params: upper }));
    expect(serverApi).toHaveBeenCalledWith({ revalidate: 600, tags: [`club:${ID}`] }, { timeoutMs: 9000 });
    expect(getClub).toHaveBeenCalledWith(ID);
    expect(getEvents).toHaveBeenCalledWith(ID);
    const meta = await generateMetadata({ params: upper });
    expect(meta.alternates?.canonical).toBe(`https://book-club-planer.vercel.app/clubs/${ID}`);
  });

  it('mirrors Angular for a missing club: 404 and invalid ids render the not-found path', async () => {
    getClub.mockRejectedValue(Object.assign(new Error('nope'), { status: 404 }));
    await expect(ClubDetailPage({ params })).rejects.toMatchObject({ digest: expect.stringContaining('404') });
    await expect(generateMetadata({ params })).rejects.toMatchObject({ digest: expect.stringContaining('404') });
    getClub.mockClear();
    await expect(ClubDetailPage({ params: Promise.resolve({ id: 'create' }) })).rejects.toMatchObject({ digest: expect.stringContaining('404') });
    expect(getClub).not.toHaveBeenCalled();
  });

  it('does not turn a transient backend failure into a cacheable not-found', async () => {
    getClub.mockRejectedValue(Object.assign(new Error('down'), { status: 503 }));
    await expect(ClubDetailPage({ params })).rejects.toThrow('down');
  });

  it('rethrows a timeout of the club fetch instead of reporting the club missing', async () => {
    getClub.mockRejectedValue(new DOMException('timed out', 'TimeoutError'));
    const failure = await ClubDetailPage({ params }).catch((e: unknown) => e);
    expect(failure).toBeInstanceOf(DOMException);
    expect((failure as { digest?: string }).digest).toBeUndefined();
  });

  it('renders without events when only the events fetch fails', async () => {
    mockApi();
    getEvents.mockRejectedValue(new Error('down'));
    const { container } = await render();
    expect(screen.getByText(t('CLUB_DETAIL.events_empty'))).toBeInTheDocument();
    expect(JSON.parse(container.querySelector('script[type="application/ld+json"]')!.textContent ?? '')['@graph']).toHaveLength(1);
  });

  it('shows the after-meeting venue and champion from the server data', async () => {
    mockApi();
    getClub.mockResolvedValue(
      parsedClub({
        afterMeetingVenue: { name: 'Cafe Lit', address: 'Main 1', description: 'cozy' },
        currentChampion: { userId: 'x', displayName: 'Ada', wins: 2, eventTitle: 'Dune night' },
      }),
    );
    await render();
    expect(screen.getByText('Cafe Lit')).toBeInTheDocument();
    expect(screen.getByText('Ada')).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`${t('EVENT.winner_of')} Dune night`))).toBeInTheDocument();
  });
});

describe('server HTML (no JavaScript)', () => {
  it('contains the club, its upcoming events and the guest view, but no interactive tab bar or viewer-specific control', async () => {
    getClub.mockResolvedValue(parsedClub({ description: 'Reads classics' }));
    getEvents.mockResolvedValue([parsedEvent({ title: 'Late one', date: '2099-06-01T18:00:00Z' }), parsedEvent({ id: 'e2', title: 'Early one', date: '2099-02-01T18:00:00Z' }), parsedEvent({ id: 'e3', title: 'Past one', status: 'held' })]);
    const html = renderToString(
      <QueryClientProvider client={new QueryClient()}>
        <NextIntlClientProvider locale="uk" messages={nest(messages.uk)}>
          {await ClubDetailPage({ params })}
        </NextIntlClientProvider>
      </QueryClientProvider>,
    );
    expect(html).toContain('Alpha Readers');
    expect(html).toContain('Reads classics');
    expect(html.indexOf('>Early one<')).toBeGreaterThan(-1);
    expect(html.indexOf('>Early one<')).toBeLessThan(html.indexOf('>Late one<'));
    expect(html).not.toContain('Past one');
    expect(html).toContain(t('CLUB_DETAIL.guest_members_hidden').replace('{count}', '3'));
    expect(html).not.toContain('role="tablist"');
    expect(html).not.toContain('data-testid="guest-cta"');
    expect(html).not.toContain('data-testid="join-button"');
    expect(html).not.toContain('event-rsvp-button');
    expect(html).toContain('application/ld+json');
  });
});

describe('generateMetadata', () => {
  it('uses the club name, description, cover and a canonical on the pinned site url', async () => {
    getClub.mockResolvedValue(parsedClub({ description: 'd'.repeat(200), coverUrl: 'https://img.example/c.jpg' }));
    const meta = await generateMetadata({ params });
    expect(meta.title).toBe('Alpha Readers | Book Club');
    expect(meta.description).toBe('d'.repeat(160));
    expect(meta.alternates?.canonical).toBe(`https://book-club-planer.vercel.app/clubs/${ID}`);
    expect(meta.robots).toEqual({ index: true, follow: true });
    expect(meta.openGraph).toMatchObject({ title: 'Alpha Readers', description: 'd'.repeat(160), images: ['https://img.example/c.jpg'] });
    expect(meta.twitter).toMatchObject({ title: 'Alpha Readers', description: 'd'.repeat(160), images: ['https://img.example/c.jpg'] });
  });

  it('falls back to the localized description and the default image, and ignores non-http covers', async () => {
    getClub.mockResolvedValue(parsedClub({ description: null, coverUrl: 'javascript:alert(1)' }));
    const meta = await generateMetadata({ params });
    expect(meta.description).toBe(t('SEO.club_detail_description').replace('{name}', 'Alpha Readers').replace('{city}', 'Kyiv'));
    expect(meta.openGraph).toMatchObject({ images: ['https://book-club-planer.vercel.app/og-image.png'] });
  });

  it('marks a private club noindex and localizes to en', async () => {
    state.locale = 'en';
    getClub.mockResolvedValue(parsedClub({ isPublic: false }));
    const meta = await generateMetadata({ params });
    expect(meta.robots).toEqual({ index: false, follow: true });
    expect(meta.title).toBe(messages.en['SEO.clubs_title']);
    expect(JSON.stringify(meta)).not.toContain('Alpha Readers');
  });
});

describe('guest', () => {
  it('sees the login CTA and a hidden member list, and makes no authenticated request', async () => {
    const calls = mockApi();
    await render();
    const cta = await screen.findByTestId('guest-cta');
    expect(within(cta).getByTestId('guest-cta-login')).toHaveAttribute('href', '/login');
    expect(screen.getByTestId('guest-members-hidden')).toHaveTextContent('3');
    expect(screen.queryByTestId('join-button')).toBeNull();
    expect(screen.queryByTestId('leave-button')).toBeNull();
    expect(screen.queryByTestId('event-rsvp-button')).toBeNull();
    expect(screen.queryByRole('link', { name: new RegExp(t('CLUB_MANAGE.manage_button')) })).toBeNull();
    expect(screen.queryByText(t('BOOK_VOTE.section_title'), { exact: false })).toBeNull();
    await new Promise((r) => setTimeout(r, 30));
    expect(calls).toEqual([]);
  });

  it('never shows a guest CTA to a signed-in viewer while the session resolves', async () => {
    mockApi({ user: userJson({ id: 'u9' }) });
    let release = () => {};
    const gate = new Promise<void>((resolve) => (release = resolve));
    server.use(
      http.get(`${API}/auth/session-status`, async () => {
        await gate;
        return HttpResponse.json({ hasSession: true });
      }),
    );
    await render();
    expect(screen.queryByTestId('guest-cta')).toBeNull();
    expect(screen.getByTestId('guest-members-hidden')).toBeInTheDocument();
    release();
    expect(await screen.findByTestId('join-button')).toBeEnabled();
    expect(screen.queryByTestId('guest-cta')).toBeNull();
  });
});

describe('signed-in non-member (also an admin, who has no special club-detail controls)', () => {
  it.each([['user'], ['admin']])('as %s: can join, is not offered manage/leave/vote', async (role) => {
    const calls = mockApi({ user: userJson({ id: 'u1', role }) });
    await render();
    expect(await screen.findByTestId('join-button')).toBeEnabled();
    expect(screen.getByText(t('CLUB_DETAIL.join_cta_title'))).toBeInTheDocument();
    expect(screen.queryByTestId('guest-cta')).toBeNull();
    expect(screen.queryByTestId('leave-button')).toBeNull();
    expect(screen.queryByRole('link', { name: new RegExp(t('CLUB_MANAGE.manage_button')) })).toBeNull();
    expect(screen.queryByRole('link', { name: t('CHAT.open') })).toBeNull();
    await waitFor(() => expect(calls).toContain('GET my-membership'));
    expect(calls).not.toContain('GET round');
  });

  it('a join request is sent, the CTA turns pending and the same toast as Angular appears', async () => {
    mockApi({ user: userJson({ id: 'u1' }) });
    const joins: unknown[] = [];
    server.use(
      http.post(`${API}/clubs/${ID}/join`, async ({ request }) => {
        joins.push(await request.json());
        return HttpResponse.json({ status: 'pending' });
      }),
    );
    const u = userEvent.setup();
    await render();
    await u.click(await screen.findByTestId('join-button'));
    expect(await screen.findByTestId('join-pending')).toBeDisabled();
    expect(screen.getByTestId('join-pending')).toHaveTextContent(t('CLUBS.join_pending'));
    expect(toast).toHaveBeenCalledWith('success', t('CLUBS.join_request_sent'));
    expect(joins).toEqual([{}]);
  });

  it('already_requested is treated as pending', async () => {
    mockApi({ user: userJson({ id: 'u1' }) });
    server.use(http.post(`${API}/clubs/${ID}/join`, () => HttpResponse.json({ status: 'already_requested' })));
    const u = userEvent.setup();
    await render();
    await u.click(await screen.findByTestId('join-button'));
    expect(await screen.findByTestId('join-pending')).toBeInTheDocument();
    expect(toast).toHaveBeenCalledWith('success', t('CLUBS.join_request_sent'));
  });

  it('an immediate join announces the club chat and reloads membership', async () => {
    const calls = mockApi({ user: userJson({ id: 'u1' }) });
    server.use(http.post(`${API}/clubs/${ID}/join`, () => HttpResponse.json({ status: 'member' })));
    const u = userEvent.setup();
    await render();
    await u.click(await screen.findByTestId('join-button'));
    await waitFor(() => expect(toast).toHaveBeenCalledWith('success', t('CHAT.club_chat_ready_toast')));
    await waitFor(() => expect(calls.filter((c) => c === 'GET /clubs/my').length).toBeGreaterThan(1));
  });

  it('shows the backend detail in a dismissible alert, disables join while it shows, and auto-dismisses it', async () => {
    mockApi({ user: userJson({ id: 'u1' }) });
    server.use(http.post(`${API}/clubs/${ID}/join`, () => HttpResponse.json({ detail: 'Club is full' }, { status: 409 })));
    const u = userEvent.setup();
    await render();
    await u.click(await screen.findByTestId('join-button'));
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Club is full');
    expect(screen.getByTestId('join-button')).toBeDisabled();
    await u.click(within(alert).getByRole('button', { name: t('ERRORS.dismiss') }));
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.getByTestId('join-button')).toBeEnabled();
  });
});

describe('pending join request', () => {
  it('shows the disabled pending button from my-membership', async () => {
    mockApi({ user: userJson({ id: 'u1' }), membership: { joinRequestStatus: 'pending' } });
    await render();
    expect(await screen.findByTestId('join-pending')).toBeDisabled();
    expect(screen.queryByTestId('join-button')).toBeNull();
  });

  it('a rejected request can be retried', async () => {
    mockApi({ user: userJson({ id: 'u1' }), membership: { joinRequestStatus: 'rejected' } });
    await render();
    expect(await screen.findByTestId('join-button')).toBeEnabled();
  });
});

describe('member', () => {
  const member = (extra: Scenario = {}) => ({ user: userJson({ id: 'u1' }), mine: [ID], ...extra });

  it('sees leave, chat, the vote section and the member list; no join CTA; own RSVP state from the authed events fetch', async () => {
    const calls = mockApi(member({ members: [memberJson({ userId: 'o1', displayName: 'Org Anizer', role: 'organizer' }), memberJson()], round: roundJson() }));
    await render();
    expect(await screen.findByTestId('leave-button')).toBeEnabled();
    expect(screen.getByRole('link', { name: t('CHAT.open') })).toHaveAttribute('href', '/chats');
    expect(await screen.findByText(t('BOOK_VOTE.section_title'), { exact: false })).toBeInTheDocument();
    expect(await screen.findByText('Grace Hopper')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: `${t('MEMBERS.title')} (2)` })).toBeInTheDocument();
    expect(screen.queryByTestId('join-button')).toBeNull();
    expect(screen.queryByTestId('guest-cta')).toBeNull();
    expect(screen.queryByRole('link', { name: new RegExp(t('CLUB_MANAGE.manage_button')) })).toBeNull();
    expect(screen.queryByTestId('guest-members-hidden')).toBeNull();
    expect(screen.queryByRole('button', { name: new RegExp(t('MEMBERS.kick')) })).toBeNull();
    const rsvp = await screen.findByTestId('event-rsvp-button');
    await waitFor(() => expect(rsvp).toHaveTextContent(`${t('events.rsvp.attending')} · ${t('events.rsvp.cancel')}`));
    expect(calls.filter((c) => c === 'GET events')).toHaveLength(1);
    expect(calls).toContain('GET my-membership');
    expect(screen.getByRole('heading', { level: 3, name: t('CLUB_DETAIL.organizer_title') })).toBeInTheDocument();
    expect(screen.getAllByText('Org Anizer')).toHaveLength(2);
  });

  it('leaving removes the club from my clubs and offers to join again; errors show in the alert', async () => {
    mockApi(member());
    let fail = true;
    server.use(
      http.delete(`${API}/clubs/${ID}/leave`, () =>
        fail ? HttpResponse.json({ detail: 'Organizer cannot leave' }, { status: 403 }) : new HttpResponse(null, { status: 204 }),
      ),
    );
    const u = userEvent.setup();
    await render();
    await u.click(await screen.findByTestId('leave-button'));
    expect(await screen.findByRole('alert')).toHaveTextContent('Organizer cannot leave');
    expect(screen.getByTestId('leave-button')).toBeInTheDocument();
    fail = false;
    await u.click(screen.getByTestId('leave-button'));
    expect(await screen.findByTestId('join-button')).toBeInTheDocument();
    expect(screen.queryByTestId('leave-button')).toBeNull();
  });

  it('RSVP is optimistic and rolls back with a toast when the request fails', async () => {
    mockApi(member({ events: [eventJson({ clubId: ID, attendeeCount: 2, isAttending: false })] }));
    let resolve: (r: Response) => void = () => {};
    server.use(http.post(`${API}/events/e1/attend`, () => new Promise<Response>((r) => (resolve = r))));
    const u = userEvent.setup();
    await render();
    const button = await screen.findByTestId('event-rsvp-button');
    await waitFor(() => expect(button).toHaveTextContent(t('events.rsvp.join')));
    expect(screen.getByText(/2 учасників/)).toBeInTheDocument();
    await u.click(button);
    expect(await screen.findByText(/3 учасників/)).toBeInTheDocument();
    expect(screen.getByTestId('event-rsvp-button')).toBeDisabled();
    resolve(HttpResponse.json({ detail: 'Event is full' }, { status: 409 }));
    expect(await screen.findByText(/2 учасників/)).toBeInTheDocument();
    expect(toast).toHaveBeenCalledWith('error', 'Event is full');
    expect(screen.getByTestId('event-rsvp-button')).toHaveTextContent(t('events.rsvp.join'));
  });

  it('cancelling attendance decrements the count', async () => {
    const events = [eventJson({ clubId: ID, attendeeCount: 2, isAttending: true })];
    mockApi(member({ events }));
    const deleted: string[] = [];
    server.use(
      http.delete(`${API}/events/e1/attend`, () => {
        deleted.push('e1');
        events[0] = eventJson({ clubId: ID, attendeeCount: 1, isAttending: false });
        return new HttpResponse(null, { status: 204 });
      }),
    );
    const u = userEvent.setup();
    await render();
    const button = await screen.findByTestId('event-rsvp-button');
    await waitFor(() => expect(button).toHaveTextContent(t('events.rsvp.cancel')));
    await u.click(button);
    expect(await screen.findByText(/1 учасників/)).toBeInTheDocument();
    expect(deleted).toEqual(['e1']);
  });

  it('shows the organizer badge instead of RSVP on own events', async () => {
    mockApi(member({ events: [eventJson({ clubId: ID, organizerId: 'u1' })] }));
    await render();
    expect(await screen.findByText(t('EVENTS.organizer_badge'), { selector: 'span' })).toBeInTheDocument();
    expect(screen.queryByTestId('event-rsvp-button')).toBeNull();
  });

  it('keeps showing the server events when the authed refetch fails', async () => {
    mockApi(member());
    server.use(http.get(`${API}/clubs/${ID}/events`, () => HttpResponse.json({}, { status: 500 })));
    await render();
    expect(await screen.findByTestId('leave-button')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Dune night' })).toBeInTheDocument();
  });

  it('hides socials unless public, without breaking when the member list is refused', async () => {
    mockApi(member({ members: [memberJson({ socials: { telegram: 'grace' }, socialsPublic: false })] }));
    await render();
    expect(await screen.findByText(t('MEMBERS.socials_hidden'))).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Telegram/ })).toBeNull();
  });

  it('a refused member list (403) leaves the page usable and does not navigate away', async () => {
    mockApi(member());
    server.use(http.get(`${API}/clubs/${ID}/members`, () => HttpResponse.json({ detail: 'no' }, { status: 403 })));
    await render();
    expect(await screen.findByText(t('MEMBERS.empty'))).toBeInTheDocument();
    const { hardNavigate } = await import('@/lib/navigate');
    expect(hardNavigate).not.toHaveBeenCalled();
  });
});

describe('organizer', () => {
  const owner = (extra: Scenario = {}) => ({ user: userJson({ id: 'o1', role: 'organizer' }), mine: [ID], ...extra });

  it('gets manage and create-event links to the legacy routes, and no leave or join', async () => {
    mockApi(owner());
    await render();
    expect(await screen.findByRole('link', { name: new RegExp(t('CLUB_MANAGE.manage_button')) })).toHaveAttribute('href', `/clubs/${ID}/manage`);
    expect(screen.getByRole('link', { name: t('CLUB_DETAIL.create_event') })).toHaveAttribute('href', `/clubs/${ID}/events/create`);
    expect(screen.queryByTestId('leave-button')).toBeNull();
    expect(screen.queryByTestId('join-button')).toBeNull();
  });

  it('shows the manage link to a co-organizer of this club, who is not the owner and has the global role user', async () => {
    mockApi({ user: userJson({ id: 'co' }), mine: [ID], membership: { role: 'organizer' } });
    await render();
    expect(await screen.findByRole('link', { name: new RegExp(t('CLUB_MANAGE.manage_button')) })).toHaveAttribute('href', `/clubs/${ID}/manage`);
  });

  it('can start a voting round when there is none', async () => {
    mockApi(owner({ round: null }));
    let rounds = 0;
    server.use(
      http.post(`${API}/clubs/${ID}/book-vote/rounds`, () => {
        rounds += 1;
        return HttpResponse.json(roundJson());
      }),
    );
    const u = userEvent.setup();
    await render();
    await u.click(await screen.findByRole('button', { name: t('BOOK_VOTE.start_round') }));
    await waitFor(() => expect(rounds).toBe(1));
  });

  it('kicks a member optimistically and restores them with a toast on failure', async () => {
    mockApi(owner({ members: [memberJson({ userId: 'o1', displayName: 'Owner', role: 'organizer' }), memberJson()] }));
    server.use(http.delete(`${API}/clubs/${ID}/members/m1`, () => HttpResponse.json({ detail: 'Cannot remove' }, { status: 400 })));
    const u = userEvent.setup();
    await render();
    await u.click(await screen.findByRole('button', { name: `${t('MEMBERS.kick')} Grace Hopper` }));
    await waitFor(() => expect(toast).toHaveBeenCalledWith('error', 'Cannot remove'));
    expect(await screen.findByText('Grace Hopper')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: new RegExp(`${t('MEMBERS.kick')} Owner`) })).toBeNull();
  });

  it('refetches the members after a failed kick, and keeps a concurrent kick removed when the other one fails', async () => {
    const members = [memberJson({ userId: 'o1', displayName: 'Owner', role: 'organizer' }), memberJson(), memberJson({ userId: 'm2', displayName: 'Alan Turing' })];
    const calls = mockApi(owner({ members }));
    let failFirst: (r: Response) => void = () => {};
    server.use(
      http.delete(`${API}/clubs/${ID}/members/m1`, () => new Promise<Response>((r) => (failFirst = r))),
      http.delete(`${API}/clubs/${ID}/members/m2`, () => {
        members.splice(2, 1);
        return new HttpResponse(null, { status: 204 });
      }),
    );
    const u = userEvent.setup();
    await render();
    await u.click(await screen.findByRole('button', { name: `${t('MEMBERS.kick')} Grace Hopper` }));
    await u.click(screen.getByRole('button', { name: `${t('MEMBERS.kick')} Alan Turing` }));
    await waitFor(() => expect(screen.queryByText('Alan Turing')).toBeNull());
    const before = calls.filter((c) => c === 'GET members').length;
    failFirst(HttpResponse.json({ detail: 'Cannot remove' }, { status: 400 }));
    await waitFor(() => expect(toast).toHaveBeenCalledWith('error', 'Cannot remove'));
    expect(await screen.findByText('Grace Hopper')).toBeInTheDocument();
    expect(screen.queryByText('Alan Turing')).toBeNull();
    await waitFor(() => expect(calls.filter((c) => c === 'GET members').length).toBeGreaterThan(before));
  });

  it('closes the ban menu and the QR dialog on an outside click, and returns focus to the trigger on Escape', async () => {
    mockApi(owner({ members: [memberJson({ socials: { telegram: 'grace' }, socialsPublic: true })] }));
    const u = userEvent.setup();
    await render();
    const qr = await screen.findByRole('button', { name: `${t('MEMBERS.show_qr')} Grace Hopper` });
    await u.click(qr);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await u.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(qr).toHaveFocus();

    const ban = screen.getByRole('button', { name: `${t('MEMBERS.ban')} Grace Hopper` });
    await u.click(ban);
    expect(document.querySelector('menu')).not.toBeNull();
    await u.keyboard('{Escape}');
    expect(document.querySelector('menu')).toBeNull();
    expect(ban).toHaveFocus();

    await u.click(ban);
    await u.click(document.body);
    expect(document.querySelector('menu')).toBeNull();
    await u.click(qr);
    await u.click(within(screen.getByRole('dialog')).getByText('Grace Hopper'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await u.click(document.body);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('bans through the duration menu', async () => {
    const members = [memberJson()];
    mockApi(owner({ members }));
    const bans: unknown[] = [];
    server.use(
      http.post(`${API}/clubs/${ID}/members/m1/ban`, async ({ request }) => {
        bans.push(await request.json());
        members.length = 0;
        return HttpResponse.json({ userId: 'm1', clubId: ID, bannedAt: '2026-01-01T00:00:00Z', duration: 3, bannedBy: 'o1' });
      }),
    );
    const u = userEvent.setup();
    await render();
    await u.click(await screen.findByRole('button', { name: `${t('MEMBERS.ban')} Grace Hopper` }));
    await u.click(within(document.querySelector('menu') as HTMLElement).getByRole('button', { name: t('MEMBERS.ban_3') }));
    await waitFor(() => expect(bans).toEqual([{ duration: 3 }]));
    await waitFor(() => expect(screen.queryByText('Grace Hopper')).toBeNull());
  });

  it('sees private socials and opens a QR code', async () => {
    mockApi(owner({ members: [memberJson({ socials: { telegram: 'grace' }, socialsPublic: false })] }));
    const u = userEvent.setup();
    await render();
    expect(await screen.findByRole('link', { name: 'Telegram: @grace' })).toHaveAttribute('href', 'https://t.me/grace');
    const toggle = screen.getByRole('button', { name: `${t('MEMBERS.show_qr')} Grace Hopper` });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await u.click(toggle);
    expect(screen.getByRole('dialog', { name: 'Grace Hopper QR' })).toBeInTheDocument();
    await u.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});

describe('events tabs', () => {
  const member = (extra: Scenario = {}) => ({ user: userJson({ id: 'u1' }), mine: [ID], ...extra });
  const past = [
    eventJson({ id: 'p1', clubId: ID, title: 'Old night', date: '2020-01-01T18:00:00Z', status: 'held', hasWinner: true }),
    eventJson({ id: 'p2', clubId: ID, title: 'Older night', date: '2019-01-01T18:00:00Z', status: 'held', hasWinner: true, winnerId: 'm1', winnerName: 'Grace' }),
  ];

  function tabsApi(extra: Scenario = {}) {
    const calls = mockApi(extra);
    server.use(
      http.get(`${API}/clubs/${ID}/events`, ({ request }) => {
        const includePast = new URL(request.url).searchParams.get('include_past') === 'true';
        calls.push(includePast ? 'GET events?include_past' : 'GET events');
        return HttpResponse.json(includePast ? [eventJson({ clubId: ID }), ...past] : [eventJson({ clubId: ID })]);
      }),
    );
    return calls;
  }

  it('names the tab list and the sort group apart from the heading, and puts the event in the RSVP name', async () => {
    mockApi(member({ events: [eventJson({ clubId: ID }), eventJson({ id: 'e2', clubId: ID, title: 'Second night', date: '2099-06-01T18:00:00Z' })] }));
    await render();
    expect(await screen.findByRole('tablist', { name: t('CLUB_DETAIL.events_title') })).toBeInTheDocument();
    expect(await screen.findByRole('group', { name: t('CLUB_DETAIL.events_sort_aria') })).toBeInTheDocument();
    const buttons = await screen.findAllByTestId('event-rsvp-button');
    expect(buttons[0]).toHaveAccessibleName(new RegExp(`${t('events.rsvp.join')} — Dune night`));
  });

  it('offers no RSVP on past events in the history tab', async () => {
    tabsApi(member());
    server.use(
      http.get(`${API}/clubs/${ID}/events`, ({ request }) =>
        HttpResponse.json(new URL(request.url).searchParams.get('include_past') === 'true' ? [eventJson({ id: 'p9', clubId: ID, title: 'Gone night', date: '2020-01-01T18:00:00Z', status: 'scheduled' })] : [eventJson({ clubId: ID })]),
      ),
    );
    const u = userEvent.setup();
    await render();
    await u.click(await screen.findByRole('tab', { name: t('CLUB_DETAIL.events_tab_history') }));
    expect(await screen.findByText('Gone night')).toBeInTheDocument();
    expect(within(screen.getByRole('tabpanel')).queryByTestId('event-rsvp-button')).toBeNull();
  });

  it('has the upcoming and history tabs with roving keyboard focus, and does not touch the URL', async () => {
    const calls = tabsApi();
    const u = userEvent.setup();
    window.history.replaceState(null, '', `/clubs/${ID}`);
    await render();
    const upcoming = await screen.findByRole('tab', { name: t('CLUB_DETAIL.events_tab_upcoming') });
    const history = await screen.findByRole('tab', { name: t('CLUB_DETAIL.events_tab_history') });
    expect(upcoming).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveAccessibleName(t('CLUB_DETAIL.events_tab_upcoming'));
    upcoming.focus();
    await u.keyboard('{ArrowRight}');
    expect(history).toHaveAttribute('aria-selected', 'true');
    expect(await screen.findByText('Old night')).toBeInTheDocument();
    expect(calls).toContain('GET events?include_past');
    expect(window.location.pathname + window.location.search).toBe(`/clubs/${ID}`);
  });

  it('lists only past events newest first, loads them once, and shows winners', async () => {
    const calls = tabsApi();
    const u = userEvent.setup();
    await render();
    expect(calls).not.toContain('GET events?include_past');
    await u.click(await screen.findByRole('tab', { name: t('CLUB_DETAIL.events_tab_history') }));
    const panel = await screen.findByRole('tabpanel');
    await within(panel).findByText('Old night');
    expect(within(panel).queryByText('Dune night')).toBeNull();
    const titles = within(panel).getAllByRole('link').map((a) => a.textContent);
    expect(titles).toEqual(['Old night', 'Older night']);
    expect(within(panel).getByText(/🏆 Grace/)).toBeInTheDocument();
    await u.click(await screen.findByRole('tab', { name: t('CLUB_DETAIL.events_tab_upcoming') }));
    await u.click(await screen.findByRole('tab', { name: t('CLUB_DETAIL.events_tab_history') }));
    expect(calls.filter((c) => c === 'GET events?include_past')).toHaveLength(1);
  });

  it('shows the empty history message', async () => {
    tabsApi();
    server.use(http.get(`${API}/clubs/${ID}/events`, () => HttpResponse.json([])));
    const u = userEvent.setup();
    await render();
    await u.click(await screen.findByRole('tab', { name: t('CLUB_DETAIL.events_tab_history') }));
    expect(await screen.findByText(t('CLUB_DETAIL.events_history_empty'))).toBeInTheDocument();
  });

  it('lets only the organizer set a winner for a held event without one', async () => {
    tabsApi({ user: userJson({ id: 'o1', role: 'organizer' }), mine: [ID], members: [memberJson()] });
    const winners: unknown[] = [];
    server.use(
      http.patch(`${API}/events/p1/winner`, async ({ request }) => {
        winners.push(await request.json());
        return HttpResponse.json(eventJson({ id: 'p1', clubId: ID, winnerId: 'm1' }));
      }),
    );
    const u = userEvent.setup();
    await render();
    await u.click(await screen.findByRole('tab', { name: t('CLUB_DETAIL.events_tab_history') }));
    await u.click(await screen.findByRole('button', { name: new RegExp(t('EVENT.set_winner')) }));
    await u.selectOptions(screen.getByRole('combobox', { name: t('EVENT.set_winner') }), await screen.findByRole('option', { name: 'Grace Hopper' }));
    expect(await screen.findByText('🏆 Grace Hopper')).toBeInTheDocument();
    await waitFor(() => expect(winners).toEqual([{ winner_id: 'm1' }]));
    expect(screen.queryByRole('combobox')).toBeNull();
  });

  it('does not offer set-winner to a member', async () => {
    tabsApi({ user: userJson({ id: 'u1' }), mine: [ID] });
    const u = userEvent.setup();
    await render();
    await u.click(await screen.findByRole('tab', { name: t('CLUB_DETAIL.events_tab_history') }));
    await screen.findByText('Old night');
    expect(screen.queryByRole('button', { name: new RegExp(t('EVENT.set_winner')) })).toBeNull();
  });

  it('sorts upcoming events by popularity and status on demand', async () => {
    mockApi();
    getEvents.mockResolvedValue([
      parsedEvent({ id: 'a', title: 'A early', date: '2099-01-01T00:00:00Z', attendeeCount: 1, status: 'scheduled' }),
      parsedEvent({ id: 'b', title: 'B late popular', date: '2099-03-01T00:00:00Z', attendeeCount: 9, status: 'scheduled' }),
      parsedEvent({ id: 'c', title: 'C live', date: '2099-02-01T00:00:00Z', attendeeCount: 3, status: 'active' }),
    ]);
    const u = userEvent.setup();
    await render();
    const order = () => within(screen.getByRole('tabpanel')).getAllByRole('link').map((a) => a.textContent);
    expect(order()).toEqual(['A early', 'C live', 'B late popular']);
    await u.click(screen.getByRole('button', { name: t('CLUB_DETAIL.sort_popular') }));
    expect(order()).toEqual(['B late popular', 'C live', 'A early']);
    await u.click(screen.getByRole('button', { name: t('CLUB_DETAIL.sort_status') }));
    expect(order()[0]).toBe('C live');
    expect(screen.getByRole('button', { name: t('CLUB_DETAIL.sort_status') })).toHaveAttribute('aria-pressed', 'true');
  });

  it('shows no sort buttons for a single event and the empty message for none', async () => {
    mockApi();
    expect(await render()).toBeTruthy();
    expect(screen.queryByRole('button', { name: t('CLUB_DETAIL.sort_popular') })).toBeNull();
  });
});

describe('book stores', () => {
  it('looks up stores for the nearest event book in the browser and links only https stores', async () => {
    mockApi();
    getEvents.mockResolvedValue([parsedEvent({ bookTitle: 'Dune' })]);
    await render();
    const link = await screen.findByRole('link', { name: new RegExp('Yakaboo') });
    expect(link).toHaveAttribute('href', 'https://yakaboo.ua/x');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(link).toHaveTextContent(t('BOOK_STORES.found'));
  });

  it('shows the availability error when the lookup fails and nothing without a book', async () => {
    mockApi();
    getEvents.mockResolvedValue([parsedEvent({ bookTitle: 'Dune' })]);
    server.use(http.get(`${API}/books/stores`, () => HttpResponse.json({}, { status: 404 })));
    await render();
    expect(await screen.findByText(t('BOOK_STORES.error'))).toBeInTheDocument();
  });

  it('renders no store section for a club without a current book', async () => {
    mockApi();
    await render();
    expect(screen.queryByText(t('BOOK_STORES.title'))).toBeNull();
  });
});

describe('locales', () => {
  it('renders in English', async () => {
    state.locale = 'en';
    mockApi();
    const { container } = renderWithProviders(await ClubDetailPage({ params }), 'en');
    expect(await screen.findByTestId('guest-cta')).toHaveTextContent(messages.en['CLUB_DETAIL.guest_cta_title']!);
    expect(container.querySelector('h1')).toHaveTextContent('Alpha Readers');
  });
});

describe('private club stub', () => {
  const asStub = () => getClub.mockResolvedValue(clubOrStub.parse(STUB));
  const fullPrivate = (extra: Record<string, unknown> = {}) => clubJson({ id: ID, organizerId: 'o1', isPublic: false, name: 'Secret Readers', description: 'Secret about', ...extra });

  beforeEach(() => {
    getEvents.mockResolvedValue([]);
    asStub();
  });

  it('server HTML is a minimal private view: name, member count, no structured data, no club content', async () => {
    const html = renderToString(
      <QueryClientProvider client={new QueryClient()}>
        <NextIntlClientProvider locale="uk" messages={nest(messages.uk)}>
          {await ClubDetailPage({ params })}
        </NextIntlClientProvider>
      </QueryClientProvider>,
    );
    expect(html).toContain('Secret Readers');
    expect(html).toContain(t('CLUB_DETAIL.private_stub_title'));
    expect(html).toContain(t('CLUB_DETAIL.private_stub_members').replace('{count}', '7'));
    expect(html).not.toContain('application/ld+json');
    expect(html).not.toContain('role="tablist"');
    expect(html).not.toContain(t('CLUB_DETAIL.about'));
  });

  it('metadata is generic and noindex, driven by the stub', async () => {
    const meta = await generateMetadata({ params });
    expect(meta.robots).toEqual({ index: false, follow: true });
    expect(meta.title).toBe(messages.uk['SEO.clubs_title']);
    expect(JSON.stringify(meta)).not.toContain('Secret Readers');
  });

  it('anonymous visitor sees the private note and the login CTA, and makes no request', async () => {
    const calls = mockApi();
    const { container } = await render();
    expect(screen.getByRole('heading', { level: 1, name: 'Secret Readers' })).toBeInTheDocument();
    expect(screen.getByTestId('private-stub')).toHaveTextContent(t('CLUB_DETAIL.private_stub_desc'));
    expect(screen.getByText(new RegExp(t('CLUB_DETAIL.private')))).toBeInTheDocument();
    expect(await screen.findByTestId('guest-cta')).toBeInTheDocument();
    expect(within(screen.getByTestId('guest-cta')).getByTestId('guest-cta-login')).toHaveAttribute('href', '/login');
    expect(container.querySelector('script[type="application/ld+json"]')).toBeNull();
    expect(screen.queryByTestId('guest-members-hidden')).toBeNull();
    await new Promise((r) => setTimeout(r, 30));
    expect(calls).toEqual([]);
  });

  it('signed-in non-member refetches on its own, stays on the stub and can send a join request', async () => {
    const calls = mockApi({ user: userJson({ id: 'u1' }) });
    const joins: unknown[] = [];
    server.use(
      http.post(`${API}/clubs/${ID}/join`, async ({ request }) => {
        joins.push(await request.json());
        return HttpResponse.json({ status: 'pending' });
      }),
    );
    const u = userEvent.setup();
    await render();
    await waitFor(() => expect(calls).toContain('GET club'));
    await u.click(await screen.findByTestId('join-button'));
    expect(await screen.findByTestId('join-pending')).toBeDisabled();
    expect(toast).toHaveBeenCalledWith('success', t('CLUBS.join_request_sent'));
    expect(joins).toEqual([{}]);
    expect(screen.getByTestId('private-stub')).toBeInTheDocument();
    expect(calls).not.toContain('GET members');
  });

  it('a pending request shows the disabled pending button', async () => {
    mockApi({ user: userJson({ id: 'u1' }), membership: { joinRequestStatus: 'pending' } });
    await render();
    expect(await screen.findByTestId('join-pending')).toBeDisabled();
  });

  it('a failing refetch keeps the stub without a toast, a redirect or a retry loop', async () => {
    const calls = mockApi({ user: userJson({ id: 'u1' }), club: { status: 500, body: { detail: 'down' } } });
    await render();
    expect(await screen.findByTestId('join-button')).toBeInTheDocument();
    await new Promise((r) => setTimeout(r, 50));
    expect(calls.filter((c) => c === 'GET club')).toHaveLength(1);
    expect(toast).not.toHaveBeenCalled();
    expect(screen.getByTestId('private-stub')).toBeInTheDocument();
  });

  it('a 403 on the refetch keeps the stub and does not navigate away', async () => {
    mockApi({ user: userJson({ id: 'u1' }), club: { status: 403, body: { detail: 'Forbidden' } } });
    await render();
    expect(await screen.findByTestId('join-button')).toBeInTheDocument();
    await new Promise((r) => setTimeout(r, 30));
    expect(hardNavigate).not.toHaveBeenCalled();
    expect(screen.getByTestId('private-stub')).toBeInTheDocument();
  });

  it('a member upgrades to the full club without a reload', async () => {
    const calls = mockApi({
      user: userJson({ id: 'u1' }),
      mine: [ID],
      club: { body: fullPrivate() },
      members: [memberJson({ userId: 'o1', displayName: 'Org Anizer', role: 'organizer' }), memberJson()],
    });
    await render();
    expect(await screen.findByText('Secret about')).toBeInTheDocument();
    expect(screen.queryByTestId('private-stub')).toBeNull();
    expect(await screen.findByTestId('leave-button')).toBeEnabled();
    expect(await screen.findByText('Grace Hopper')).toBeInTheDocument();
    expect(screen.getByText(new RegExp(t('CLUB_DETAIL.private')))).toBeInTheDocument();
    expect(calls).toContain('GET club');
    expect(document.querySelector('script[type="application/ld+json"]')).toBeNull();
  });

  it('sets the document title to the club name once the stub upgrades', async () => {
    mockApi({ user: userJson({ id: 'u1' }), mine: [ID], club: { body: fullPrivate() }, members: [memberJson()] });
    await render();
    await waitFor(() => expect(document.title).toBe('Secret Readers | Book Club'));
  });

  it('leaving an upgraded private club drops back to the stub view', async () => {
    mockApi({ user: userJson({ id: 'u1' }), mine: [ID], club: { body: fullPrivate() }, members: [memberJson()] });
    let left = false;
    server.use(
      http.delete(`${API}/clubs/${ID}/leave`, () => {
        left = true;
        return new HttpResponse(null, { status: 204 });
      }),
      http.get(`${API}/clubs/${ID}`, () => HttpResponse.json(left ? STUB : fullPrivate())),
    );
    const u = userEvent.setup();
    await render();
    await u.click(await screen.findByTestId('leave-button'));
    await waitFor(() => expect(screen.getByTestId('private-stub')).toBeInTheDocument());
    expect(screen.queryByText('Secret about')).toBeNull();
  });

  it('an immediate join on the stub refetches the club so the gate can upgrade', async () => {
    const calls = mockApi({ user: userJson({ id: 'u1' }) });
    server.use(http.post(`${API}/clubs/${ID}/join`, () => HttpResponse.json({ status: 'member' })));
    const u = userEvent.setup();
    await render();
    await waitFor(() => expect(calls.filter((c) => c === 'GET club')).toHaveLength(1));
    await u.click(await screen.findByTestId('join-button'));
    await waitFor(() => expect(calls.filter((c) => c === 'GET club')).toHaveLength(2));
    expect(toast).not.toHaveBeenCalledWith('error', expect.anything());
    expect(hardNavigate).not.toHaveBeenCalled();
  });

  it('the organizer upgrades and gets the manage link', async () => {
    mockApi({ user: userJson({ id: 'o1' }), mine: [ID], club: { body: fullPrivate() }, members: [memberJson({ userId: 'o1', role: 'organizer' })] });
    await render();
    expect(await screen.findByRole('link', { name: new RegExp(t('CLUB_MANAGE.manage_button')) })).toHaveAttribute('href', `/clubs/${ID}/manage`);
    expect(screen.queryByTestId('private-stub')).toBeNull();
    expect(screen.queryByTestId('leave-button')).toBeNull();
  });

  it('an admin who is not a member upgrades to the full view', async () => {
    mockApi({ user: userJson({ id: 'a1', role: 'admin' }), club: { body: fullPrivate() }, members: [memberJson()] });
    await render();
    expect(await screen.findByText('Secret about')).toBeInTheDocument();
    expect(screen.queryByTestId('private-stub')).toBeNull();
    expect(await screen.findByText('Grace Hopper')).toBeInTheDocument();
  });

  it('a 403 on the member list after the upgrade neither toasts nor redirects and the page stays usable', async () => {
    const calls = mockApi({ user: userJson({ id: 'a1', role: 'admin' }), club: { body: fullPrivate() }, membersStatus: 403 });
    await render();
    expect(await screen.findByText('Secret about')).toBeInTheDocument();
    await waitFor(() => expect(calls).toContain('GET members'));
    await waitFor(() => expect(screen.queryByLabelText(/loading/i)).toBeNull());
    await new Promise((r) => setTimeout(r, 30));
    expect(toast).not.toHaveBeenCalled();
    expect(hardNavigate).not.toHaveBeenCalled();
    expect(screen.getByRole('heading', { level: 1, name: 'Secret Readers' })).toBeInTheDocument();
  });
});
