import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RequireAuth } from '@/features/auth/require-auth';
import { StranglerProvider } from '@/strangler/context';
import { API, clubJson, eventJson, messages, renderWithProviders, server, setupApiServer } from '@/test/harness';
import { CreateEvent } from './create-event';
import { LazyCreateEvent } from './lazy';
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
const EVENT = '7a1d9e44-5b2c-4f60-9d11-0c2b3a4d5e6f';
const t = (key: string) => (messages.uk[key] ?? key).replace(/''/g, "'");

const kyiv = { label: 'вул. Хрещатик, 1, Київ', city: 'Київ', country: 'Україна', lat: 50.45, lng: 30.52 };
const dune = { id: 'g1', title: 'Dune', authors: ['Frank Herbert'], thumbnail: 'https://books.example/dune.jpg' };

function setup() {
  mockSession({ id: 'u1', role: 'organizer' });
  return renderWithProviders(
    <StranglerProvider value={NEXT_ROUTES}>
      <CreateEvent clubId={CLUB} />
    </StranglerProvider>,
  );
}

const title = () => screen.getByTestId('event-title-input');
const date = () => screen.getByTestId('date-input');
const address = () => screen.getByTestId('address-input');
const submit = () => screen.getByTestId('event-submit');
const created = () => HttpResponse.json(eventJson({ id: EVENT, clubId: CLUB }), { status: 201 });

// one paste event instead of a keystroke each: the long forms below blew the test timeout when typed under load
async function fill(user: ReturnType<typeof userEvent.setup>, field: HTMLElement, text: string) {
  await user.click(field);
  await user.paste(text);
}

async function pickAddress(user: ReturnType<typeof userEvent.setup>) {
  server.use(http.get(`${API}/geocode/autocomplete`, () => HttpResponse.json([kyiv])));
  await fill(user, address(), 'Хре');
  await user.click(await screen.findByRole('option', { name: kyiv.label }, { timeout: 3000 }));
}

describe('CreateEvent', () => {
  it('renders the form with a way back to the club and no winner switch', () => {
    setup();
    expect(screen.getByRole('heading', { level: 1, name: t('CREATE_EVENT.heading') })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: t('CREATE_EVENT.back_to_club') })).toHaveAttribute('href', `/clubs/${CLUB}`);
    expect(screen.getByRole('link', { name: t('CREATE_EVENT.cancel') })).toHaveAttribute('href', `/clubs/${CLUB}`);
    expect(screen.queryByLabelText(t('EVENT.has_winner_label'))).not.toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: t('CREATE_EVENT.location_label') })).toBe(address());
  });

  it('blocks an empty submit with the three required messages and sends nothing', async () => {
    const bodies = capture('post', `/clubs/${CLUB}/events`, created);
    const user = userEvent.setup();
    setup();
    await user.click(submit());
    expect(await screen.findByText(t('CREATE_EVENT.title_required'))).toBeInTheDocument();
    expect(screen.getByText(t('CREATE_EVENT.date_required'))).toBeInTheDocument();
    expect(screen.getByText(t('CREATE_EVENT.location_required'))).toBeInTheDocument();
    expect(title()).toHaveAttribute('aria-invalid', 'true');
    expect(address()).toHaveAttribute('aria-invalid', 'true');
    expect(bodies).toEqual([]);
  });

  it('reports a too-short and a too-long title, and an out-of-range duration', async () => {
    const user = userEvent.setup();
    setup();
    await user.type(title(), 'ab');
    await user.tab();
    expect(await screen.findByText('Мінімум 3 символів.')).toBeInTheDocument();
    await user.clear(title());
    await user.click(title());
    await user.paste('x'.repeat(121));
    await user.tab();
    expect(await screen.findByText(t('FORM_ERRORS.invalid'))).toBeInTheDocument();
    await user.type(screen.getByLabelText(t('CREATE_EVENT.duration_label')), '10');
    await user.tab();
    expect(await screen.findAllByText(t('FORM_ERRORS.invalid'))).toHaveLength(2);
  });

  it('a typed address without a picked suggestion is not a location', async () => {
    const bodies = capture('post', `/clubs/${CLUB}/events`, created);
    server.use(http.get(`${API}/geocode/autocomplete`, () => HttpResponse.json([])));
    const user = userEvent.setup();
    setup();
    await user.type(title(), 'Dune night');
    await user.type(date(), '2099-05-01T18:30');
    await user.type(address(), 'somewhere');
    await user.click(submit());
    expect(await screen.findByText(t('CREATE_EVENT.location_required'))).toBeInTheDocument();
    expect(bodies).toEqual([]);
  });

  it('creates an event with only the required fields, as the Angular form did', async () => {
    const bodies = capture('post', `/clubs/${CLUB}/events`, created);
    const user = userEvent.setup();
    setup();
    await user.type(title(), 'Dune night');
    await user.type(date(), '2099-05-01T18:30');
    await pickAddress(user);
    await user.click(submit());
    await waitFor(() => expect(nav.push).toHaveBeenCalledWith(`/events/${EVENT}`));
    expect(bodies).toEqual([
      {
        title: 'Dune night',
        date: new Date('2099-05-01T18:30').toISOString(),
        city: 'Київ',
        address: kyiv.label,
        lat: 50.45,
        lng: 30.52,
        tags: [],
        coverUrl: null,
        bookTitle: null,
        googleBookId: null,
      },
    ]);
  });

  it('sends every optional field, takes the cover and book id from a picked book and caches the new event', async () => {
    const bodies = capture('post', `/clubs/${CLUB}/events`, created);
    server.use(http.get(`${API}/books/search`, () => HttpResponse.json([dune])));
    const user = userEvent.setup();
    const { queryClient } = setup();
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
    await fill(user, title(), 'Dune night');
    await fill(user, screen.getByRole('combobox', { name: t('CREATE_EVENT.book_title_label') }), 'Dun');
    await user.click(await screen.findByRole('option', { name: /Dune/ }, { timeout: 3000 }));
    expect(screen.getByRole('combobox', { name: t('CREATE_EVENT.book_title_label') })).toHaveValue('Dune');
    expect(document.querySelector('img[src="https://books.example/dune.jpg"]')).toBeInTheDocument();
    await fill(user, screen.getByLabelText(t('CREATE_EVENT.description_label')), 'Bring snacks');
    await fill(user, date(), '2099-05-01T18:30');
    await pickAddress(user);
    await fill(user, screen.getByLabelText(t('CREATE_EVENT.duration_label')), '120');
    await fill(user, screen.getByLabelText(t('CREATE_EVENT.theme_label')), 'Sci-fi');
    await fill(user, screen.getByLabelText(t('CREATE_EVENT.tags_label')), ' a, ,b ');
    await user.click(screen.getByRole('button', { name: t('CREATE_EVENT.after_venue_add') }));
    await fill(user, screen.getByLabelText(new RegExp(t('CREATE_EVENT.after_venue_name_label'))), 'Pub');
    await fill(user, screen.getByRole('combobox', { name: t('CREATE_EVENT.after_venue_address_label') }), 'Beer st 2');
    await fill(user, screen.getByLabelText(t('CREATE_EVENT.after_venue_notes_label')), 'Cosy');
    await user.click(submit());
    await waitFor(() => expect(nav.push).toHaveBeenCalledWith(`/events/${EVENT}`));
    expect(bodies).toEqual([
      {
        title: 'Dune night',
        description: 'Bring snacks',
        date: new Date('2099-05-01T18:30').toISOString(),
        city: 'Київ',
        address: kyiv.label,
        lat: 50.45,
        lng: 30.52,
        theme: 'Sci-fi',
        tags: ['a', 'b'],
        durationMinutes: 120,
        afterMeetingVenue: { name: 'Pub', address: 'Beer st 2', description: 'Cosy' },
        coverUrl: 'https://books.example/dune.jpg',
        bookTitle: 'Dune',
        googleBookId: 'g1',
      },
    ]);
    expect(queryClient.getQueryData(['events', 'detail', EVENT])).toMatchObject({ id: EVENT });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['events'] });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['club', CLUB] });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['clubs'] });
  }, 20_000);

  it('requires an address for the after-meeting venue and forgets the venue when it is removed', async () => {
    const bodies = capture('post', `/clubs/${CLUB}/events`, created);
    const user = userEvent.setup();
    setup();
    await fill(user, title(), 'Dune night');
    await fill(user, date(), '2099-05-01T18:30');
    await pickAddress(user);
    await user.click(screen.getByRole('button', { name: t('CREATE_EVENT.after_venue_add') }));
    await fill(user, screen.getByLabelText(new RegExp(t('CREATE_EVENT.after_venue_name_label'))), 'Pub');
    await user.click(submit());
    expect(await screen.findByText(t('CLUB_MANAGE.venue_address_required'))).toBeInTheDocument();
    expect(bodies).toEqual([]);
    await user.click(screen.getByRole('button', { name: t('CREATE_EVENT.after_venue_remove') }));
    expect(screen.queryByText(t('CLUB_MANAGE.venue_address_required'))).not.toBeInTheDocument();
    await user.click(submit());
    await waitFor(() => expect(bodies).toHaveLength(1), { timeout: 3000 });
    expect(bodies[0]).not.toHaveProperty('afterMeetingVenue');
  });

  it('shows the generic save error for a refused event and allows another try', async () => {
    let calls = 0;
    capture('post', `/clubs/${CLUB}/events`, () => (++calls === 1 ? HttpResponse.json({ detail: 'Date is in the past' }, { status: 422 }) : created()));
    const user = userEvent.setup();
    setup();
    await user.type(title(), 'Dune night');
    await user.type(date(), '2000-05-01T18:30');
    await pickAddress(user);
    await user.click(submit());
    expect(await screen.findByRole('alert')).toHaveTextContent(t('CREATE_EVENT.save_error'));
    expect(submit()).toBeEnabled();
    expect(nav.push).not.toHaveBeenCalled();
    await user.click(submit());
    await waitFor(() => expect(nav.push).toHaveBeenCalledWith(`/events/${EVENT}`));
    expect(screen.queryByText(t('CREATE_EVENT.save_error'))).not.toBeInTheDocument();
  });

  it('shows the save error and the client toast for a server failure', async () => {
    capture('post', `/clubs/${CLUB}/events`, () => new HttpResponse(null, { status: 500 }));
    const user = userEvent.setup();
    setup();
    await user.type(title(), 'Dune night');
    await user.type(date(), '2099-05-01T18:30');
    await pickAddress(user);
    await user.click(submit());
    expect(await screen.findByText(t('CREATE_EVENT.save_error'))).toBeInTheDocument();
    expect(nav.toast).toHaveBeenCalledWith('error', 'ERRORS.serverError');
  });

  it('disables the button and shows the submitting label while saving', async () => {
    let release!: () => void;
    const gate = new Promise<void>((resolve) => (release = resolve));
    server.use(
      http.post(`${API}/clubs/${CLUB}/events`, async () => {
        await gate;
        return created();
      }),
    );
    const user = userEvent.setup();
    setup();
    await user.type(title(), 'Dune night');
    await user.type(date(), '2099-05-01T18:30');
    await pickAddress(user);
    await user.click(submit());
    await waitFor(() => expect(submit()).toBeDisabled());
    expect(submit()).toHaveTextContent(t('CREATE_EVENT.submitting'));
    release();
    await waitFor(() => expect(nav.push).toHaveBeenCalled());
  });
});

describe('CreateEvent: double submit and error wiring', () => {
  it('sends one request when Enter is pressed in the address field while the save is pending', async () => {
    let release!: () => void;
    const gate = new Promise<void>((resolve) => (release = resolve));
    let posts = 0;
    server.use(
      http.post(`${API}/clubs/${CLUB}/events`, async () => {
        posts += 1;
        await gate;
        return created();
      }),
    );
    const user = userEvent.setup();
    setup();
    await user.type(title(), 'Dune night');
    await user.type(date(), '2099-05-01T18:30');
    await pickAddress(user);
    await user.click(submit());
    await waitFor(() => expect(submit()).toBeDisabled());
    await user.click(address());
    await user.keyboard('{Enter}{Enter}');
    release();
    await waitFor(() => expect(nav.push).toHaveBeenCalledWith(`/events/${EVENT}`));
    expect(posts).toBe(1);
  });

  it('links the location error to the address field and names the cover URL input', async () => {
    const user = userEvent.setup();
    setup();
    await user.click(submit());
    const message = await screen.findByText(t('CREATE_EVENT.location_required'));
    expect(message.id).not.toBe('');
    expect(address().getAttribute('aria-describedby')).toBe(message.id);
    await user.click(screen.getByRole('button', { name: t('COVER_UPLOAD.enter_url') }));
    expect(screen.getByLabelText(t('CREATE_EVENT.cover_label'))).toBe(screen.getByTestId('cover-url-input'));
  });

  it('links the after-venue address error to its field', async () => {
    const user = userEvent.setup();
    setup();
    await user.type(title(), 'Dune night');
    await user.type(date(), '2099-05-01T18:30');
    await pickAddress(user);
    await user.click(screen.getByRole('button', { name: t('CREATE_EVENT.after_venue_add') }));
    await user.type(screen.getByLabelText(new RegExp(t('CREATE_EVENT.after_venue_name_label'))), 'Pub');
    await user.click(submit());
    const message = await screen.findByText(t('CLUB_MANAGE.venue_address_required'));
    expect(screen.getByRole('combobox', { name: t('CREATE_EVENT.after_venue_address_label') }).getAttribute('aria-describedby')).toBe(message.id);
  });
});

describe('CreateEvent: picked places and cover', () => {
  it('forgets the picked place when the address text is edited afterwards', async () => {
    const bodies = capture('post', `/clubs/${CLUB}/events`, created);
    const user = userEvent.setup();
    setup();
    await user.type(title(), 'Dune night');
    await user.type(date(), '2099-05-01T18:30');
    await pickAddress(user);
    await user.type(address(), 'x');
    await user.click(submit());
    expect(await screen.findByText(t('CREATE_EVENT.location_required'))).toBeInTheDocument();
    expect(bodies).toEqual([]);
  });

  it('drops the coordinates of the after-meeting venue when its address text is edited', async () => {
    const bodies = capture('post', `/clubs/${CLUB}/events`, created);
    const user = userEvent.setup();
    setup();
    await user.type(title(), 'Dune night');
    await user.type(date(), '2099-05-01T18:30');
    await pickAddress(user);
    await user.click(screen.getByRole('button', { name: t('CREATE_EVENT.after_venue_add') }));
    await user.type(screen.getByLabelText(new RegExp(t('CREATE_EVENT.after_venue_name_label'))), 'Pub');
    const venue = screen.getByRole('combobox', { name: t('CREATE_EVENT.after_venue_address_label') });
    await user.type(venue, 'Хре');
    await user.click(await screen.findByRole('option', { name: kyiv.label }, { timeout: 3000 }));
    await user.type(venue, ' 2');
    await user.click(submit());
    await waitFor(() => expect(bodies).toHaveLength(1));
    expect((bodies[0] as { afterMeetingVenue: object }).afterMeetingVenue).toEqual({ name: 'Pub', address: `${kyiv.label} 2` });
  });

  it('rejects a cover URL that is not http(s), with a visible linked message', async () => {
    const bodies = capture('post', `/clubs/${CLUB}/events`, created);
    const user = userEvent.setup();
    setup();
    await user.type(title(), 'Dune night');
    await user.type(date(), '2099-05-01T18:30');
    await pickAddress(user);
    await user.click(screen.getByRole('button', { name: t('COVER_UPLOAD.enter_url') }));
    const url = screen.getByLabelText(t('CREATE_EVENT.cover_label'));
    await user.type(url, 'javascript:alert(1)');
    await user.click(submit());
    const message = await screen.findByText(t('CREATE_CLUB.cover_url_invalid'));
    expect(url.getAttribute('aria-describedby')).toBe(message.id);
    expect(bodies).toEqual([]);
  });

  it('sends one request when the form is submitted twice before it re-renders', async () => {
    let posts = 0;
    server.use(
      http.post(`${API}/clubs/${CLUB}/events`, async () => {
        posts += 1;
        await new Promise((r) => setTimeout(r, 100));
        return created();
      }),
    );
    const user = userEvent.setup();
    setup();
    await user.type(title(), 'Dune night');
    await user.type(date(), '2099-05-01T18:30');
    await pickAddress(user);
    const form = submit().closest('form') as HTMLFormElement;
    await act(async () => {
      fireEvent.submit(form);
      fireEvent.submit(form);
    });
    await waitFor(() => expect(nav.push).toHaveBeenCalledWith(`/events/${EVENT}`));
    expect(posts).toBe(1);
  });
});

describe('CreateEvent behind the per-club gate', () => {
  const asViewer = (user: Record<string, unknown> | null, membership: Record<string, unknown> = {}) => {
    mockSession(user);
    server.use(
      http.get(`${API}/clubs/${CLUB}`, () => HttpResponse.json(clubJson({ id: CLUB, organizerId: 'o1' }))),
      http.get(`${API}/clubs/${CLUB}/my-membership`, () => HttpResponse.json({ isMember: true, role: 'member', joinRequestStatus: 'none', ...membership })),
    );
    renderWithProviders(
      <StranglerProvider value={NEXT_ROUTES}>
        <RequireAuth>
          <LazyCreateEvent clubId={CLUB} />
        </RequireAuth>
      </StranglerProvider>,
    );
  };

  it('admits a co-organizer of this club whose global role is user', async () => {
    asViewer({ id: 'co', role: 'user' }, { role: 'organizer' });
    expect(await screen.findByTestId('event-title-input')).toBeInTheDocument();
  });

  it('turns a plain member away', async () => {
    asViewer({ id: 'co', role: 'user' });
    expect(await screen.findByRole('alert')).toHaveTextContent(t('ERRORS.organizers_only'));
    expect(screen.queryByTestId('event-title-input')).not.toBeInTheDocument();
  });

  it('sends a guest to /login', async () => {
    asViewer(null);
    await waitFor(() => expect(nav.replaceHard).toHaveBeenCalledWith('/login'));
    expect(screen.queryByTestId('event-title-input')).not.toBeInTheDocument();
  });
});
