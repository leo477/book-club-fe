import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RequireRole } from '@/features/auth/require-auth';
import { StranglerProvider } from '@/strangler/context';
import { API, eventJson, messages, renderWithProviders, server, setupApiServer } from '@/test/harness';
import { CreateEvent } from './create-event';
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

async function pickAddress(user: ReturnType<typeof userEvent.setup>) {
  server.use(http.get(`${API}/geocode/autocomplete`, () => HttpResponse.json([kyiv])));
  await user.type(address(), 'Хре');
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
    await user.type(title(), 'Dune night');
    await user.type(screen.getByRole('combobox', { name: t('CREATE_EVENT.book_title_label') }), 'Dun');
    await user.click(await screen.findByRole('option', { name: /Dune/ }, { timeout: 3000 }));
    expect(screen.getByRole('combobox', { name: t('CREATE_EVENT.book_title_label') })).toHaveValue('Dune');
    expect(document.querySelector('img[src="https://books.example/dune.jpg"]')).toBeInTheDocument();
    await user.type(screen.getByLabelText(t('CREATE_EVENT.description_label')), 'Bring snacks');
    await user.type(date(), '2099-05-01T18:30');
    await pickAddress(user);
    await user.type(screen.getByLabelText(t('CREATE_EVENT.duration_label')), '120');
    await user.type(screen.getByLabelText(t('CREATE_EVENT.theme_label')), 'Sci-fi');
    await user.type(screen.getByLabelText(t('CREATE_EVENT.tags_label')), ' a, ,b ');
    await user.click(screen.getByRole('button', { name: t('CREATE_EVENT.after_venue_add') }));
    await user.type(screen.getByLabelText(new RegExp(t('CREATE_EVENT.after_venue_name_label'))), 'Pub');
    await user.type(screen.getByRole('combobox', { name: t('CREATE_EVENT.after_venue_address_label') }), 'Beer st 2');
    await user.type(screen.getByLabelText(t('CREATE_EVENT.after_venue_notes_label')), 'Cosy');
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
  });

  it('requires an address for the after-meeting venue and forgets the venue when it is removed', async () => {
    const bodies = capture('post', `/clubs/${CLUB}/events`, created);
    const user = userEvent.setup();
    setup();
    await user.type(title(), 'Dune night');
    await user.type(date(), '2099-05-01T18:30');
    await pickAddress(user);
    await user.click(screen.getByRole('button', { name: t('CREATE_EVENT.after_venue_add') }));
    await user.type(screen.getByLabelText(new RegExp(t('CREATE_EVENT.after_venue_name_label'))), 'Pub');
    await user.click(submit());
    expect(await screen.findByText(t('CLUB_MANAGE.venue_address_required'))).toBeInTheDocument();
    expect(bodies).toEqual([]);
    await user.click(screen.getByRole('button', { name: t('CREATE_EVENT.after_venue_remove') }));
    expect(screen.queryByText(t('CLUB_MANAGE.venue_address_required'))).not.toBeInTheDocument();
    await user.click(submit());
    await waitFor(() => expect(bodies).toHaveLength(1));
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

describe('CreateEvent behind RequireRole', () => {
  const gated = () => (
    <StranglerProvider value={NEXT_ROUTES}>
      <RequireRole role="organizer">
        <CreateEvent clubId={CLUB} />
      </RequireRole>
    </StranglerProvider>
  );

  it('turns a plain reader away with the organizers-only toast', async () => {
    mockSession({ role: 'user' });
    renderWithProviders(gated());
    await waitFor(() => expect(nav.replace).toHaveBeenCalledWith('/clubs'));
    expect(nav.toast).toHaveBeenCalledWith('error', t('ERRORS.organizers_only'));
    expect(screen.queryByTestId('event-title-input')).not.toBeInTheDocument();
  });

  it('sends a guest to /login', async () => {
    mockSession(null);
    renderWithProviders(gated());
    await waitFor(() => expect(nav.replaceHard).toHaveBeenCalledWith('/login'));
    expect(screen.queryByTestId('event-title-input')).not.toBeInTheDocument();
  });

  it('admits an organizer', async () => {
    mockSession({ role: 'organizer' });
    renderWithProviders(gated());
    expect(await screen.findByTestId('event-title-input')).toBeInTheDocument();
  });
});
