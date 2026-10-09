import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { StranglerProvider } from '@/strangler/context';
import { API, clubJson, eventJson, messages, renderWithProviders, server, setupApiServer } from '@/test/harness';
import { RequireRole } from '@/features/auth/require-auth';
import { CreateClub } from './create-club';
import { NEXT_ROUTES, capture, mockSession } from './test-support';

const nav = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn(), hard: vi.fn(), replaceHard: vi.fn(), toast: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: nav.push, replace: nav.replace }) }));
vi.mock('@/lib/navigate', () => ({ hardNavigate: nav.hard, replaceNavigate: nav.replaceHard }));
vi.mock('@/lib/toast', () => ({ showToast: nav.toast }));

setupApiServer();
beforeEach(() => {
  Object.values(nav).forEach((fn) => fn.mockReset());
});

const NEW_ID = '3f2b8c1e-9a4d-4e7b-8c5f-1a2b3c4d5e6f';
const t = (key: string) => (messages.uk[key] ?? key).replace(/''/g, "'");

function mockMine(clubs: Record<string, unknown>[] = []) {
  server.use(http.get(`${API}/clubs/my`, () => HttpResponse.json(clubs)));
}

function setup(mine: Record<string, unknown>[] = []) {
  mockSession({ id: 'u1', role: 'organizer' });
  mockMine(mine);
  return renderWithProviders(
    <StranglerProvider value={NEXT_ROUTES}>
      <CreateClub />
    </StranglerProvider>,
  );
}

const name = () => screen.getByTestId('club-name-input');
const submit = () => screen.getByTestId('club-submit');

describe('CreateClub', () => {
  it('renders the form with a public club by default', async () => {
    setup();
    expect(await screen.findByRole('heading', { level: 1, name: t('CREATE_CLUB.title') })).toBeInTheDocument();
    expect(screen.getByLabelText(new RegExp(t('CREATE_CLUB.name_label')))).toBe(name());
    expect(screen.getByRole('switch', { name: t('CREATE_CLUB.public_label') })).toBeChecked();
    expect(submit()).toHaveTextContent(t('CREATE_CLUB.submit'));
  });

  it('blocks an empty submit with the required message and sends nothing', async () => {
    const bodies = capture('post', '/clubs', () => HttpResponse.json(clubJson(), { status: 201 }));
    const user = userEvent.setup();
    setup();
    await user.click(submit());
    expect(await screen.findByText(t('CREATE_CLUB.name_required'))).toBeInTheDocument();
    expect(name()).toHaveAttribute('aria-invalid', 'true');
    expect(bodies).toEqual([]);
  });

  it.each([
    ['name', 'ab', 'CREATE_CLUB.name_min'],
    ['name', 'x'.repeat(101), 'CREATE_CLUB.name_max'],
    ['description', 'x'.repeat(501), 'CREATE_CLUB.description_max'],
    ['cover', 'nope', 'CREATE_CLUB.cover_url_invalid'],
  ] as const)('reports the %s rule (%s) with %s', async (field, value, key) => {
    const user = userEvent.setup();
    setup();
    const input =
      field === 'name' ? name() : field === 'description' ? screen.getByLabelText(t('CREATE_CLUB.description_label')) : screen.getByLabelText(t('CREATE_CLUB.cover_url_label'));
    await user.click(input);
    await user.paste(value);
    await user.tab();
    expect(await screen.findByText(t(key))).toBeInTheDocument();
  });

  it('creates the club with the Angular payload and opens it', async () => {
    const bodies = capture('post', '/clubs', () => HttpResponse.json(clubJson({ id: NEW_ID }), { status: 201 }));
    const user = userEvent.setup();
    const { queryClient } = setup();
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
    await user.type(name(), 'Night Owls');
    await user.type(screen.getByLabelText(t('CREATE_CLUB.description_label')), 'We read late');
    await user.click(submit());
    await waitFor(() => expect(nav.push).toHaveBeenCalledWith(`/clubs/${NEW_ID}`));
    expect(bodies).toEqual([{ name: 'Night Owls', description: 'We read late', isPublic: true, city: '', coverUrl: null }]);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['clubs'] });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['club', NEW_ID] });
  });

  it('sends a private club with its cover URL', async () => {
    const bodies = capture('post', '/clubs', () => HttpResponse.json(clubJson({ id: NEW_ID }), { status: 201 }));
    const user = userEvent.setup();
    setup();
    await user.type(name(), 'Secret Society');
    await user.type(screen.getByLabelText(t('CREATE_CLUB.cover_url_label')), 'https://example.com/c.jpg');
    await user.click(screen.getByRole('switch', { name: t('CREATE_CLUB.public_label') }));
    expect(screen.getByRole('switch', { name: t('CREATE_CLUB.public_label') })).not.toBeChecked();
    await user.click(submit());
    await waitFor(() => expect(bodies).toHaveLength(1));
    expect(bodies[0]).toMatchObject({ isPublic: false, coverUrl: 'https://example.com/c.jpg' });
  });

  it('also creates the first meeting when all three of its fields are filled', async () => {
    capture('post', '/clubs', () => HttpResponse.json(clubJson({ id: NEW_ID }), { status: 201 }));
    const events = capture('post', `/clubs/${NEW_ID}/events`, () => HttpResponse.json(eventJson(), { status: 201 }));
    const user = userEvent.setup();
    setup();
    await user.type(name(), 'Night Owls');
    await user.click(screen.getByRole('button', { name: t('CREATE_CLUB.add_first_meeting') }));
    await user.type(screen.getByLabelText(t('CREATE_CLUB.first_meeting_title_label')), ' Kick-off ');
    await user.type(screen.getByLabelText(t('CREATE_CLUB.first_meeting_date_label')), '2099-05-01T18:30');
    await user.type(screen.getByLabelText(t('CREATE_CLUB.first_meeting_city_label')), ' Kyiv ');
    await user.click(submit());
    await waitFor(() => expect(nav.push).toHaveBeenCalledWith(`/clubs/${NEW_ID}`));
    expect(events).toEqual([{ title: 'Kick-off', date: new Date('2099-05-01T18:30').toISOString(), city: 'Kyiv' }]);
  });

  it('skips the first meeting when a field is missing, and tolerates it failing', async () => {
    capture('post', '/clubs', () => HttpResponse.json(clubJson({ id: NEW_ID }), { status: 201 }));
    const events = capture('post', `/clubs/${NEW_ID}/events`, () => HttpResponse.json({ detail: 'no' }, { status: 422 }));
    const user = userEvent.setup();
    setup();
    await user.type(name(), 'Night Owls');
    await user.click(screen.getByRole('button', { name: t('CREATE_CLUB.add_first_meeting') }));
    await user.type(screen.getByLabelText(t('CREATE_CLUB.first_meeting_title_label')), 'Kick-off');
    await user.click(submit());
    await waitFor(() => expect(nav.push).toHaveBeenCalledWith(`/clubs/${NEW_ID}`));
    expect(events).toEqual([]);

    nav.push.mockReset();
    await user.type(screen.getByLabelText(t('CREATE_CLUB.first_meeting_date_label')), '2099-05-01T18:30');
    await user.type(screen.getByLabelText(t('CREATE_CLUB.first_meeting_city_label')), 'Kyiv');
    await user.click(submit());
    await waitFor(() => expect(events).toHaveLength(1));
    await waitFor(() => expect(nav.push).toHaveBeenCalledWith(`/clubs/${NEW_ID}`));
  });

  it('hides the first-meeting fields again', async () => {
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByRole('button', { name: t('CREATE_CLUB.add_first_meeting') }));
    expect(screen.getByLabelText(t('CREATE_CLUB.first_meeting_title_label'))).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: t('CREATE_CLUB.remove_first_meeting') }));
    expect(screen.queryByLabelText(t('CREATE_CLUB.first_meeting_title_label'))).not.toBeInTheDocument();
  });

  it('shows the backend detail in an alert, stays on the form and lets the user retry', async () => {
    let calls = 0;
    capture('post', '/clubs', () => (++calls === 1 ? HttpResponse.json({ detail: 'You already own a club' }, { status: 409 }) : HttpResponse.json(clubJson({ id: NEW_ID }), { status: 201 })));
    const user = userEvent.setup();
    setup();
    await user.type(name(), 'Night Owls');
    await user.click(submit());
    expect(await screen.findByRole('alert')).toHaveTextContent('You already own a club');
    expect(submit()).toBeEnabled();
    expect(nav.push).not.toHaveBeenCalled();
    await user.click(submit());
    await waitFor(() => expect(nav.push).toHaveBeenCalledWith(`/clubs/${NEW_ID}`));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('maps a server error without detail to the localized message', async () => {
    capture('post', '/clubs', () => new HttpResponse(null, { status: 500 }));
    const user = userEvent.setup();
    setup();
    await user.type(name(), 'Night Owls');
    await user.click(submit());
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(t('ERRORS.serverError')));
    expect(nav.push).not.toHaveBeenCalled();
  });

  it('disables the button and shows the submitting label while the request runs', async () => {
    let release!: () => void;
    const gate = new Promise<void>((resolve) => (release = resolve));
    server.use(
      http.post(`${API}/clubs`, async () => {
        await gate;
        return HttpResponse.json(clubJson({ id: NEW_ID }), { status: 201 });
      }),
    );
    const user = userEvent.setup();
    setup();
    await user.type(name(), 'Night Owls');
    await user.click(submit());
    await waitFor(() => expect(submit()).toBeDisabled());
    expect(submit()).toHaveTextContent(t('CREATE_CLUB.submitting'));
    release();
    await waitFor(() => expect(nav.push).toHaveBeenCalledWith(`/clubs/${NEW_ID}`));
  });

  it('cancels back to the list', async () => {
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByRole('button', { name: t('CREATE_CLUB.cancel') }));
    expect(nav.push).toHaveBeenCalledWith('/clubs');
  });

  it('sends an organizer who already owns a club back to the list', async () => {
    setup([clubJson({ id: 'c1', organizerId: 'u1' })]);
    await waitFor(() => expect(nav.push).toHaveBeenCalledWith('/clubs'));
  });

  it('keeps an organizer who only belongs to someone else’s club on the form', async () => {
    setup([clubJson({ id: 'c1', organizerId: 'someone-else' })]);
    await screen.findByTestId('club-name-input');
    await new Promise((r) => setTimeout(r, 50));
    expect(nav.push).not.toHaveBeenCalled();
  });
});

describe('CreateClub behind RequireRole', () => {
  const gated = () => (
    <StranglerProvider value={NEXT_ROUTES}>
      <RequireRole role="organizer">
        <CreateClub />
      </RequireRole>
    </StranglerProvider>
  );

  it('turns a plain reader away with the organizers-only toast and never shows the form', async () => {
    mockSession({ role: 'user' });
    mockMine();
    renderWithProviders(gated());
    await waitFor(() => expect(nav.replace).toHaveBeenCalledWith('/clubs'));
    expect(nav.toast).toHaveBeenCalledWith('error', t('ERRORS.organizers_only'));
    expect(screen.queryByTestId('club-name-input')).not.toBeInTheDocument();
  });

  it('sends a guest to /login', async () => {
    mockSession(null);
    renderWithProviders(gated());
    await waitFor(() => expect(nav.replaceHard).toHaveBeenCalledWith('/login'));
    expect(screen.queryByTestId('club-name-input')).not.toBeInTheDocument();
  });

  it.each(['organizer', 'admin'])('admits %s', async (role) => {
    mockSession({ role });
    mockMine();
    renderWithProviders(gated());
    expect(await screen.findByTestId('club-name-input')).toBeInTheDocument();
    expect(within(document.body).queryByRole('alert')).not.toBeInTheDocument();
  });
});
