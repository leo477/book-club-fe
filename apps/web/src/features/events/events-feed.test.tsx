import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { clubsKey } from '@/features/clubs/use-clubs';
import { API, eventJson, messages, parsedClub, renderWithProviders, server, setupApiServer, userJson } from '@/test/harness';
import { EventsFeed } from './events-feed';

const toast = vi.hoisted(() => vi.fn());
vi.mock('@/lib/toast', () => ({ showToast: toast }));
vi.mock('@/lib/navigate', () => ({ hardNavigate: vi.fn(), replaceNavigate: vi.fn() }));

setupApiServer();
beforeEach(() => toast.mockReset());

const t = (key: string) => messages.uk[key] ?? key;

interface Mock {
  all?: Record<string, unknown>[];
  mine?: Record<string, unknown>[];
  user?: Record<string, unknown>;
  allStatus?: number;
}

function mockApi({ all = [], mine = [], user = {}, allStatus = 200 }: Mock = {}) {
  const calls: string[] = [];
  server.use(
    http.get(`${API}/auth/session-status`, () => HttpResponse.json({ hasSession: true })),
    http.get(`${API}/auth/me`, () => HttpResponse.json(userJson(user))),
    http.get(`${API}/events/my`, () => HttpResponse.json(mine)),
    http.get(`${API}/events`, ({ request }) => {
      calls.push(new URL(request.url).search);
      return allStatus === 200 ? HttpResponse.json(all) : new HttpResponse(null, { status: allStatus });
    }),
  );
  return calls;
}

const inDays = (days: number) => new Date(Date.now() + days * 86_400_000 + 3_600_000).toISOString();

describe('EventsFeed', () => {
  it('loads the first 50 events and groups them by date, oldest first', async () => {
    const calls = mockApi({
      all: [
        eventJson({ id: 'e2', title: 'Later', date: '2099-06-02T10:00:00Z' }),
        eventJson({ id: 'e1', title: 'Sooner', date: '2099-06-01T10:00:00Z' }),
        eventJson({ id: 'e3', title: 'Same day', date: '2099-06-01T19:00:00Z' }),
      ],
    });
    renderWithProviders(<EventsFeed />);
    const headings = await screen.findAllByRole('heading', { level: 2 });
    expect(headings).toHaveLength(2);
    expect(headings[0]).toHaveTextContent(/1 червня 2099/);
    expect(within(headings[0]!.closest('section')!).getAllByTestId('event-card')).toHaveLength(2);
    expect(calls).toEqual(['?skip=0&limit=50']);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(t('NAV.events'));
  });

  it('shows a spinner, then the empty state', async () => {
    mockApi();
    renderWithProviders(<EventsFeed />);
    expect(screen.getAllByRole('status').length).toBeGreaterThan(0);
    expect(await screen.findByText(t('EVENTS.no_upcoming'))).toBeInTheDocument();
  });

  it('reports a load failure in an alert', async () => {
    mockApi({ allStatus: 500 });
    renderWithProviders(<EventsFeed />);
    expect(await screen.findByRole('alert')).toHaveTextContent(t('EVENTS.load_error'));
  });

  it('filters by city, merging transliterations, and hides the filter without cities', async () => {
    mockApi({ all: [eventJson({ id: 'e1', title: 'In Kyiv', city: 'Київ' }), eventJson({ id: 'e2', title: 'In Lviv', city: 'Lviv' }), eventJson({ id: 'e3', title: 'Odd', city: 'Poltava' })] });
    renderWithProviders(<EventsFeed />);
    const select = await screen.findByRole('combobox', { name: t('EVENTS.filter_by_city') });
    expect(within(select).getAllByRole('option').map((o) => o.textContent)).toEqual([t('events.filter.cities.all'), t('events.cities.kyiv'), t('events.cities.lviv'), 'Poltava']);
    await userEvent.selectOptions(select, 'Kyiv');
    expect(screen.getByText('In Kyiv')).toBeInTheDocument();
    expect(screen.queryByText('In Lviv')).not.toBeInTheDocument();
    await userEvent.selectOptions(select, '');
    expect(screen.getByText('In Lviv')).toBeInTheDocument();
  });

  it('has no city filter when no event has a city', async () => {
    mockApi({ all: [eventJson({ city: '' })] });
    renderWithProviders(<EventsFeed />);
    await screen.findByText('Dune night');
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('switches to My events with a count badge and an empty state', async () => {
    mockApi({ all: [eventJson()], mine: [eventJson({ id: 'm1', title: 'Mine', isAttending: true })] });
    renderWithProviders(<EventsFeed />);
    await screen.findByText('Dune night');
    const tab = screen.getByRole('tab', { name: new RegExp(t('EVENTS.tab_my')) });
    await waitFor(() => expect(tab).toHaveTextContent('1'));
    await userEvent.click(tab);
    expect(screen.getByText('Mine')).toBeInTheDocument();
    expect(screen.queryByText('Dune night')).not.toBeInTheDocument();
    expect(tab).toHaveAttribute('aria-selected', 'true');
  });

  it('shows the My events empty state', async () => {
    mockApi({ all: [eventJson()] });
    renderWithProviders(<EventsFeed />);
    await screen.findByText('Dune night');
    await userEvent.click(screen.getByRole('tab', { name: new RegExp(t('EVENTS.tab_my')) }));
    expect(await screen.findByText(t('EVENTS.no_my_events'))).toBeInTheDocument();
  });

  it('shows the organizer badge on own events and no RSVP for cancelled or held ones', async () => {
    mockApi({
      user: { id: 'o1' },
      all: [eventJson({ id: 'e1', title: 'Own', organizerId: 'o1' }), eventJson({ id: 'e2', title: 'Cancelled', status: 'cancelled', organizerId: 'x' }), eventJson({ id: 'e3', title: 'Held', status: 'held', organizerId: 'x' }), eventJson({ id: 'e4', title: 'Open', organizerId: 'x' })],
    });
    renderWithProviders(<EventsFeed />);
    await screen.findByText('Open');
    expect(screen.getByText(t('EVENTS.organizer_badge'))).toBeInTheDocument();
    expect(screen.getAllByTestId('event-rsvp-button')).toHaveLength(1);
    expect(screen.getByText(t('EVENTS.status_cancelled'))).toBeInTheDocument();
  });

  it('counts down events starting within three days only, and closes RSVP for started ones', async () => {
    mockApi({
      all: [
        eventJson({ id: 'e1', title: 'Soon', date: inDays(1) }),
        eventJson({ id: 'e2', title: 'Far', date: inDays(10) }),
        eventJson({ id: 'e3', title: 'Started', date: new Date(Date.now() - 3_600_000).toISOString() }),
      ],
    });
    renderWithProviders(<EventsFeed />);
    await screen.findByText('Soon');
    expect(screen.getAllByText(/^\d+d \d+h \d+m \d+s$/)).toHaveLength(1);
    const started = screen.getByText('Started').closest('article')!;
    expect(within(started).getByTestId('event-rsvp-button')).toBeDisabled();
    expect(within(started).getByTestId('event-rsvp-button')).toHaveTextContent(t('EVENTS.registration_closed'));
  });

  it('points the organizer call to action at the single club the /clubs page has loaded, else at /clubs', async () => {
    mockApi({ user: { id: 'o1', role: 'organizer' }, all: [eventJson()] });
    const first = renderWithProviders(<EventsFeed />);
    expect(await screen.findByRole('link', { name: t('EVENTS.choose_club_cta') })).toHaveAttribute('href', '/clubs');
    first.unmount();

    mockApi({ user: { id: 'o1', role: 'organizer' }, all: [eventJson()] });
    const second = renderWithProviders(<EventsFeed />, 'uk');
    second.queryClient.setQueryData(clubsKey, [parsedClub({ id: 'c9', organizerId: 'o1' }), parsedClub({ id: 'c8', organizerId: 'x' })]);
    expect(await screen.findByRole('link', { name: t('EVENTS.create_event_cta') })).toHaveAttribute('href', '/clubs/c9/events/create');
  });

  it('does not show the create call to action to non-organizers', async () => {
    mockApi({ all: [eventJson()] });
    renderWithProviders(<EventsFeed />);
    await screen.findByText('Dune night');
    expect(screen.queryByRole('link', { name: t('EVENTS.choose_club_cta') })).not.toBeInTheDocument();
  });
});

describe('EventsFeed RSVP', () => {
  const rsvp = () => screen.getByTestId('event-rsvp-button');

  it('flips optimistically before the server answers, then settles on a refetch', async () => {
    let release: () => void = () => undefined;
    const gate = new Promise<void>((r) => (release = r));
    let attending = false;
    mockApi();
    server.use(
      http.get(`${API}/events`, () => HttpResponse.json([eventJson({ attendeeCount: attending ? 3 : 2, isAttending: attending })])),
      http.post(`${API}/events/e1/attend`, async () => {
        await gate;
        attending = true;
        return HttpResponse.json({ attendeeCount: 3, joinRequestStatus: 'member' });
      }),
    );
    renderWithProviders(<EventsFeed />);
    await screen.findByText('Dune night');
    expect(rsvp()).toHaveTextContent(t('events.rsvp.join'));
    await userEvent.click(rsvp());
    expect(screen.getByText(`3 ${t('EVENTS.attending')}`)).toBeInTheDocument();
    expect(rsvp()).toBeDisabled();
    release();
    await waitFor(() => expect(rsvp()).toHaveTextContent(t('events.rsvp.attending')));
    expect(rsvp()).toBeEnabled();
    expect(toast).not.toHaveBeenCalled();
  });

  it('rolls back and shows the registration-closed toast on a 400', async () => {
    mockApi({ all: [eventJson()] });
    server.use(http.post(`${API}/events/e1/attend`, () => HttpResponse.json({ detail: 'closed' }, { status: 400 })));
    renderWithProviders(<EventsFeed />);
    await screen.findByText('Dune night');
    await userEvent.click(rsvp());
    await waitFor(() => expect(toast).toHaveBeenCalledWith('error', t('EVENTS.registration_closed')));
    await waitFor(() => expect(rsvp()).toHaveTextContent(t('events.rsvp.join')));
    expect(screen.getByText(`2 ${t('EVENTS.attending')}`)).toBeInTheDocument();
  });

  it('rolls back and toasts the backend detail on other errors', async () => {
    mockApi({ all: [eventJson()] });
    server.use(http.post(`${API}/events/e1/attend`, () => HttpResponse.json({ detail: 'Event is full' }, { status: 409 })));
    renderWithProviders(<EventsFeed />);
    await screen.findByText('Dune night');
    await userEvent.click(rsvp());
    await waitFor(() => expect(toast).toHaveBeenCalledWith('error', 'Event is full'));
    expect(screen.getByText(`2 ${t('EVENTS.attending')}`)).toBeInTheDocument();
  });

  it('announces a pending join request', async () => {
    mockApi({ all: [eventJson()] });
    server.use(http.post(`${API}/events/e1/attend`, () => HttpResponse.json({ attendeeCount: 3, joinRequestStatus: 'pending' })));
    renderWithProviders(<EventsFeed />);
    await screen.findByText('Dune night');
    await userEvent.click(rsvp());
    await waitFor(() => expect(toast).toHaveBeenCalledWith('success', t('EVENTS.join_request_sent')));
  });

  it('cancels attendance optimistically and restores it when the call fails', async () => {
    mockApi({ all: [eventJson({ isAttending: true })] });
    server.use(http.delete(`${API}/events/e1/attend`, () => new HttpResponse(null, { status: 409 })));
    renderWithProviders(<EventsFeed />);
    await screen.findByText('Dune night');
    expect(rsvp()).toHaveTextContent(t('events.rsvp.attending'));
    await userEvent.click(rsvp());
    await waitFor(() => expect(rsvp()).toHaveTextContent(t('events.rsvp.attending')));
    expect(screen.getByText(`2 ${t('EVENTS.attending')}`)).toBeInTheDocument();
  });

  it('rolls back only the failed row while a concurrent RSVP stays optimistic', async () => {
    let releaseOk: () => void = () => undefined;
    const gateOk = new Promise<void>((r) => (releaseOk = r));
    mockApi({
      all: [eventJson({ id: 'e1', title: 'First', date: '2099-05-01T18:00:00Z' }), eventJson({ id: 'e2', title: 'Second', date: '2099-05-02T18:00:00Z' })],
    });
    server.use(
      http.post(`${API}/events/e1/attend`, () => HttpResponse.json({ detail: 'Event is full' }, { status: 409 })),
      http.post(`${API}/events/e2/attend`, async () => {
        await gateOk;
        return HttpResponse.json({ attendeeCount: 3, joinRequestStatus: 'member' });
      }),
    );
    renderWithProviders(<EventsFeed />);
    await screen.findByText('First');
    const card = (title: string) => screen.getByText(title).closest('[data-testid="event-card"]') as HTMLElement;
    await userEvent.click(within(card('Second')).getByTestId('event-rsvp-button'));
    await userEvent.click(within(card('First')).getByTestId('event-rsvp-button'));
    await waitFor(() => expect(toast).toHaveBeenCalledWith('error', 'Event is full'));
    await waitFor(() => expect(within(card('First')).getByTestId('event-rsvp-button')).toHaveTextContent(t('events.rsvp.join')));
    expect(within(card('First')).getByText(`2 ${t('EVENTS.attending')}`)).toBeInTheDocument();
    expect(within(card('Second')).getByText(`3 ${t('EVENTS.attending')}`)).toBeInTheDocument();
    expect(within(card('Second')).getByTestId('event-rsvp-button')).toBeDisabled();
    releaseOk();
    await waitFor(() => expect(within(card('Second')).getByTestId('event-rsvp-button')).toBeEnabled());
  });

  it('does not leave the attending state after a pending join request', async () => {
    let release: () => void = () => undefined;
    let loads = 0;
    const gate = new Promise<void>((r) => (release = r));
    mockApi({ all: [eventJson()] });
    server.use(
      http.post(`${API}/events/e1/attend`, () => HttpResponse.json({ attendeeCount: 3, joinRequestStatus: 'pending' })),
      http.get(`${API}/events`, async () => {
        if (++loads > 1) await gate;
        return HttpResponse.json([eventJson()]);
      }),
    );
    renderWithProviders(<EventsFeed />);
    await screen.findByText('Dune night');
    await userEvent.click(rsvp());
    await waitFor(() => expect(toast).toHaveBeenCalledWith('success', t('EVENTS.join_request_sent')));
    expect(screen.getByText(`2 ${t('EVENTS.attending')}`)).toBeInTheDocument();
    release();
    await waitFor(() => expect(rsvp()).toHaveTextContent(t('events.rsvp.join')));
  });

  it('refetches once after two concurrent RSVPs on different events settle, and marks club event lists stale', async () => {
    const server_ = { e1: false, e2: false };
    let listCalls = 0;
    mockApi({
      all: [eventJson({ id: 'e1', title: 'First', date: '2099-05-01T18:00:00Z' }), eventJson({ id: 'e2', title: 'Second', date: '2099-05-02T18:00:00Z' })],
    });
    const row = (id: 'e1' | 'e2', title: string, date: string) => eventJson({ id, title, date, isAttending: server_[id], attendeeCount: server_[id] ? 3 : 2 });
    server.use(
      http.get(`${API}/events`, () => {
        listCalls++;
        return HttpResponse.json([row('e1', 'First', '2099-05-01T18:00:00Z'), row('e2', 'Second', '2099-05-02T18:00:00Z')]);
      }),
      http.post(`${API}/events/e1/attend`, async () => {
        await new Promise((r) => setTimeout(r, 30));
        server_.e1 = true;
        return HttpResponse.json({ attendeeCount: 3, joinRequestStatus: 'member' });
      }),
      http.post(`${API}/events/e2/attend`, async () => {
        await new Promise((r) => setTimeout(r, 90));
        server_.e2 = true;
        return HttpResponse.json({ attendeeCount: 3, joinRequestStatus: 'member' });
      }),
    );
    const { queryClient } = renderWithProviders(<EventsFeed />);
    await screen.findByText('First');
    expect(listCalls).toBe(1);
    queryClient.setQueryData(['club', 'c1', 'events', 'authed'], []);
    const card = (title: string) => screen.getByText(title).closest('[data-testid="event-card"]') as HTMLElement;
    await userEvent.click(within(card('First')).getByTestId('event-rsvp-button'));
    await userEvent.click(within(card('Second')).getByTestId('event-rsvp-button'));
    await waitFor(() => expect(listCalls).toBe(2));
    await waitFor(() => expect(within(card('Second')).getByTestId('event-rsvp-button')).toHaveTextContent(t('events.rsvp.attending')));
    expect(within(card('First')).getByTestId('event-rsvp-button')).toHaveTextContent(t('events.rsvp.attending'));
    expect(within(card('First')).getByText(`3 ${t('EVENTS.attending')}`)).toBeInTheDocument();
    expect(within(card('Second')).getByText(`3 ${t('EVENTS.attending')}`)).toBeInTheDocument();
    await new Promise((r) => setTimeout(r, 100));
    expect(listCalls).toBe(2);
    expect(queryClient.getQueryState(['club', 'c1', 'events', 'authed'])?.isInvalidated).toBe(true);
  });
});
