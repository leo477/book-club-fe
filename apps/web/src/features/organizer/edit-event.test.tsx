import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RequireRole } from '@/features/auth/require-auth';
import { StranglerProvider } from '@/strangler/context';
import { API, eventJson, messages, renderWithProviders, server, setupApiServer } from '@/test/harness';
import { EditEvent } from './edit-event';
import { NEXT_ROUTES, capture, mockSession } from './test-support';

const nav = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn(), hard: vi.fn(), replaceHard: vi.fn(), toast: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: nav.push, replace: nav.replace }) }));
vi.mock('@/lib/navigate', () => ({ hardNavigate: nav.hard, replaceNavigate: nav.replaceHard }));
vi.mock('@/lib/toast', () => ({ showToast: nav.toast }));

setupApiServer();
beforeEach(() => {
  Object.values(nav).forEach((fn) => fn.mockReset());
});

const CLUB = '3f2b8c1e-9a4d-4e7b-8c5f-1a2b3c4d5e6f';
const ID = '7a1d9e44-5b2c-4f60-9d11-0c2b3a4d5e6f';
const t = (key: string) => (messages.uk[key] ?? key).replace(/''/g, "'");

const stored = (overrides: Record<string, unknown> = {}) =>
  eventJson({
    id: ID,
    clubId: CLUB,
    organizerId: 'u1',
    title: 'Dune night',
    description: 'Bring snacks',
    date: '2099-05-01T18:30:00.000Z',
    city: 'Київ',
    address: 'вул. Хрещатик, 1',
    lat: 50.45,
    lng: 30.52,
    theme: 'Sci-fi',
    tags: ['a', 'b'],
    durationMinutes: 120,
    afterMeetingVenue: { name: 'Pub', address: 'Beer st 2', description: 'Cosy', lat: 1.5, lng: 2.5 },
    coverUrl: 'https://example.com/c.jpg',
    bookTitle: 'Dune',
    googleBookId: 'g1',
    hasWinner: false,
    ...overrides,
  });

const localDate = (iso: string) => {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};

/** `membership` is the viewer's /my-membership answer for the event's club; a number answers with that status. */
function setup(event: Record<string, unknown> | number = stored(), user: Record<string, unknown> = { id: 'u1', role: 'organizer' }, membership: Record<string, unknown> | number = { isMember: true, role: 'organizer' }) {
  mockSession(user);
  server.use(
    http.get(`${API}/events/${ID}`, () => (typeof event === 'number' ? HttpResponse.json({ detail: 'x' }, { status: event }) : HttpResponse.json(event))),
    http.get(`${API}/clubs/${CLUB}/my-membership`, () => (typeof membership === 'number' ? HttpResponse.json({ detail: 'x' }, { status: membership }) : HttpResponse.json({ joinRequestStatus: 'none', ...membership }))),
  );
  return renderWithProviders(
    <StranglerProvider value={NEXT_ROUTES}>
      <EditEvent id={ID} />
    </StranglerProvider>,
  );
}

const title = () => screen.findByTestId('event-title-input');
const submit = () => screen.getByTestId('event-submit');
const patched = () => HttpResponse.json(stored({ title: 'Renamed' }));

describe('EditEvent', () => {
  it('shows a busy placeholder while the event loads', () => {
    setup();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('prefills every field from the event, in local time', async () => {
    setup();
    expect(await title()).toHaveValue('Dune night');
    expect(screen.getByRole('heading', { level: 1, name: t('EVENTS.editEvent') })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: t('EVENTS.back_to_events') })).toHaveAttribute('href', `/events/${ID}`);
    expect(screen.getByRole('combobox', { name: t('CREATE_EVENT.book_title_label') })).toHaveValue('Dune');
    expect(screen.getByLabelText(t('CREATE_EVENT.description_label'))).toHaveValue('Bring snacks');
    expect(screen.getByTestId('date-input')).toHaveValue(localDate('2099-05-01T18:30:00.000Z'));
    expect(screen.getByTestId('address-input')).toHaveValue('вул. Хрещатик, 1');
    expect(screen.getByLabelText(t('CREATE_EVENT.duration_label'))).toHaveValue(120);
    expect(screen.getByLabelText(t('CREATE_EVENT.theme_label'))).toHaveValue('Sci-fi');
    expect(screen.getByLabelText(t('CREATE_EVENT.tags_label'))).toHaveValue('a, b');
    expect(screen.getByLabelText(new RegExp(t('CREATE_EVENT.after_venue_name_label')))).toHaveValue('Pub');
    expect(screen.getByRole('combobox', { name: t('CREATE_EVENT.after_venue_address_label') })).toHaveValue('Beer st 2');
    expect(screen.getByLabelText(t('CREATE_EVENT.after_venue_notes_label'))).toHaveValue('Cosy');
    expect(screen.getByLabelText(t('EVENT.has_winner_label'))).not.toBeChecked();
    expect(document.querySelector('img')).toHaveAttribute('src', 'https://example.com/c.jpg');
    expect(submit()).toHaveTextContent(t('EVENTS.saveChanges'));
  });

  it('keeps the venue section closed for an event without one', async () => {
    setup(stored({ afterMeetingVenue: null }));
    await title();
    expect(screen.queryByLabelText(new RegExp(t('CREATE_EVENT.after_venue_name_label')))).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: t('CREATE_EVENT.after_venue_add') })).toBeInTheDocument();
  });

  it('offers a retry when the event cannot be loaded', async () => {
    setup(404);
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(screen.queryByTestId('event-title-input')).not.toBeInTheDocument();
  });

  it('lets an organizer of the event’s club edit an event someone else created', async () => {
    setup(stored({ organizerId: 'other' }));
    expect(await title()).toHaveValue('Dune night');
    expect(nav.replace).not.toHaveBeenCalled();
  });

  it('sends a plain member of the club back to the feed without showing the form', async () => {
    setup(stored({ organizerId: 'other' }), undefined, { isMember: true, role: 'member' });
    await waitFor(() => expect(nav.replace).toHaveBeenCalledWith('/events'));
    expect(nav.push).not.toHaveBeenCalled();
    expect(nav.toast).not.toHaveBeenCalled();
    expect(screen.queryByTestId('event-title-input')).not.toBeInTheDocument();
  });

  it('sends the creator back to the feed once they no longer organize the club, as the backend refuses them', async () => {
    setup(stored(), undefined, { isMember: true, role: 'member' });
    await waitFor(() => expect(nav.replace).toHaveBeenCalledWith('/events'));
    expect(nav.toast).not.toHaveBeenCalled();
    expect(screen.queryByTestId('event-title-input')).not.toBeInTheDocument();
  });

  it('sends a creator who left the club back to the feed', async () => {
    setup(stored(), undefined, { isMember: false });
    await waitFor(() => expect(nav.replace).toHaveBeenCalledWith('/events'));
    expect(screen.queryByTestId('event-title-input')).not.toBeInTheDocument();
  });

  /** Renders with a cached organizer role and holds the fresh /my-membership answer until `release(role)`. */
  function withCachedOrganizer() {
    const eventLoaded = vi.fn();
    let release: (role: string) => void = () => undefined;
    const held = new Promise<string>((resolve) => {
      release = resolve;
    });
    mockSession({ id: 'u1', role: 'organizer' });
    server.use(
      http.get(`${API}/events/${ID}`, () => {
        eventLoaded();
        return HttpResponse.json(stored());
      }),
      http.get(`${API}/clubs/${CLUB}/my-membership`, async () => HttpResponse.json({ isMember: true, role: await held, joinRequestStatus: 'none' })),
    );
    renderWithProviders(
      <StranglerProvider value={NEXT_ROUTES}>
        <EditEvent id={ID} />
      </StranglerProvider>,
      'uk',
      // cached just before this visit mounted (1 ms back, so it can never share the mount timestamp)
      (qc) => qc.setQueryData(['club', CLUB, 'membership'], { isMember: true, role: 'organizer', joinRequestStatus: 'none' }, { updatedAt: Date.now() - 1 }),
    );
    return { eventLoaded, release: (role: string) => release(role) };
  }

  it('does not trust a cached organizer role: a fresh member answer redirects and the form never appears', async () => {
    const appeared = vi.fn();
    const observer = new MutationObserver(() => {
      if (screen.queryByTestId('event-title-input')) appeared();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    const { eventLoaded, release } = withCachedOrganizer();
    await waitFor(() => expect(eventLoaded).toHaveBeenCalled());
    // the event is in, the role answer is held: the cached organizer role alone must not open the form
    await expect(screen.findByTestId('event-title-input', {}, { timeout: 300 })).rejects.toThrow();
    expect(screen.getByRole('status')).toBeInTheDocument();
    release('member');
    await waitFor(() => expect(nav.replace).toHaveBeenCalledWith('/events'));
    observer.disconnect();
    expect(appeared).not.toHaveBeenCalled();
    expect(screen.queryByTestId('event-title-input')).not.toBeInTheDocument();
  });

  it('shows the form for a cached organizer only after the fresh answer confirms the role', async () => {
    const { eventLoaded, release } = withCachedOrganizer();
    await waitFor(() => expect(eventLoaded).toHaveBeenCalled());
    await expect(screen.findByTestId('event-title-input', {}, { timeout: 300 })).rejects.toThrow();
    release('organizer');
    expect(await title()).toHaveValue('Dune night');
    expect(nav.replace).not.toHaveBeenCalled();
  });

  it('offers a retry when the club role cannot be checked', async () => {
    setup(stored(), undefined, 500);
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(screen.queryByTestId('event-title-input')).not.toBeInTheDocument();
    expect(nav.replace).not.toHaveBeenCalled();
  });

  it('blocks a save with an empty title or date and sends nothing', async () => {
    const bodies = capture('patch', `/events/${ID}`, patched);
    const user = userEvent.setup();
    setup();
    await user.clear(await title());
    await user.clear(screen.getByTestId('date-input'));
    await user.click(submit());
    expect(await screen.findByText(t('CREATE_EVENT.title_required'))).toBeInTheDocument();
    expect(screen.getByText(t('CREATE_EVENT.date_required'))).toBeInTheDocument();
    expect(bodies).toEqual([]);
  });

  it('saves an untouched form with the Angular snake_case payload', async () => {
    const bodies = capture('patch', `/events/${ID}`, patched);
    const user = userEvent.setup();
    const { queryClient } = setup();
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
    await title();
    // the backend answers the follow-up refetch with what it saved
    server.use(http.get(`${API}/events/${ID}`, () => HttpResponse.json(stored({ title: 'Renamed' }))));
    await user.click(submit());
    await waitFor(() => expect(nav.push).toHaveBeenCalledWith(`/events/${ID}`));
    expect(bodies).toEqual([
      {
        title: 'Dune night',
        description: 'Bring snacks',
        date: new Date(localDate('2099-05-01T18:30:00.000Z')).toISOString(),
        city: 'Київ',
        address: 'вул. Хрещатик, 1',
        lat: 50.45,
        lng: 30.52,
        theme: 'Sci-fi',
        tags: ['a', 'b'],
        duration_minutes: 120,
        after_meeting_venue: { name: 'Pub', address: 'Beer st 2', description: 'Cosy', lat: 1.5, lng: 2.5 },
        cover_url: 'https://example.com/c.jpg',
        google_book_id: 'g1',
        has_winner: false,
      },
    ]);
    expect(queryClient.getQueryData(['events', 'detail', ID])).toMatchObject({ title: 'Renamed' });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['events'] });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['club', CLUB] });
  });

  it('sends cleared fields as null, drops a removed venue and carries the winner switch', async () => {
    const bodies = capture('patch', `/events/${ID}`, patched);
    const user = userEvent.setup();
    setup();
    await title();
    await user.clear(screen.getByLabelText(t('CREATE_EVENT.description_label')));
    await user.clear(screen.getByLabelText(t('CREATE_EVENT.theme_label')));
    await user.clear(screen.getByLabelText(t('CREATE_EVENT.duration_label')));
    await user.clear(screen.getByLabelText(t('CREATE_EVENT.tags_label')));
    await user.click(screen.getByRole('button', { name: t('COVER_UPLOAD.remove') }));
    await user.click(screen.getByRole('button', { name: t('CREATE_EVENT.after_venue_remove') }));
    await user.click(screen.getByLabelText(t('EVENT.has_winner_label')));
    await user.click(submit());
    await waitFor(() => expect(bodies).toHaveLength(1));
    expect(bodies[0]).toMatchObject({
      description: null,
      theme: null,
      duration_minutes: null,
      tags: [],
      cover_url: null,
      after_meeting_venue: null,
      has_winner: true,
    });
  });

  it('shows the generic save error, keeps the form and recovers on a second try', async () => {
    let calls = 0;
    capture('patch', `/events/${ID}`, () => (++calls === 1 ? HttpResponse.json({ detail: 'Not allowed' }, { status: 422 }) : patched()));
    const user = userEvent.setup();
    setup();
    await title();
    await user.click(submit());
    expect(await screen.findByRole('alert')).toHaveTextContent(t('CREATE_EVENT.save_error'));
    expect(screen.getByTestId('event-title-input')).toHaveValue('Dune night');
    expect(nav.push).not.toHaveBeenCalled();
    await user.click(submit());
    await waitFor(() => expect(nav.push).toHaveBeenCalledWith(`/events/${ID}`));
  });

  it('maps a server failure to the save error plus the client toast', async () => {
    capture('patch', `/events/${ID}`, () => new HttpResponse(null, { status: 500 }));
    const user = userEvent.setup();
    setup();
    await title();
    await user.click(submit());
    expect(await screen.findByText(t('CREATE_EVENT.save_error'))).toBeInTheDocument();
    expect(nav.toast).toHaveBeenCalledWith('error', 'ERRORS.serverError');
  });
});

describe('EditEvent behind RequireRole', () => {
  const gated = () => (
    <StranglerProvider value={NEXT_ROUTES}>
      <RequireRole role="organizer">
        <EditEvent id={ID} />
      </RequireRole>
    </StranglerProvider>
  );

  it('turns a plain reader away before the event is requested', async () => {
    const requested = vi.fn();
    mockSession({ id: 'u1', role: 'user' });
    server.use(
      http.get(`${API}/events/${ID}`, () => {
        requested();
        return HttpResponse.json(stored());
      }),
    );
    renderWithProviders(gated());
    await waitFor(() => expect(nav.replace).toHaveBeenCalledWith('/clubs'));
    expect(nav.toast).toHaveBeenCalledWith('error', t('ERRORS.organizers_only'));
    expect(requested).not.toHaveBeenCalled();
    expect(screen.queryByTestId('event-title-input')).not.toBeInTheDocument();
  });

  it('sends a guest to /login', async () => {
    mockSession(null);
    renderWithProviders(gated());
    await waitFor(() => expect(nav.replaceHard).toHaveBeenCalledWith('/login'));
  });
});
