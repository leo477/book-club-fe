import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RequireRole } from '@/features/auth/require-auth';
import { StranglerProvider } from '@/strangler/context';
import { API, clubJson, messages, renderWithProviders, server, setupApiServer } from '@/test/harness';
import { EditClub } from './edit-club';
import { NEXT_ROUTES, capture, mockSession } from './test-support';

const nav = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn(), hard: vi.fn(), replaceHard: vi.fn(), toast: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: nav.push, replace: nav.replace }) }));
vi.mock('@/lib/navigate', () => ({ hardNavigate: nav.hard, replaceNavigate: nav.replaceHard }));
vi.mock('@/lib/toast', () => ({ showToast: nav.toast }));

setupApiServer();
beforeEach(() => {
  Object.values(nav).forEach((fn) => fn.mockReset());
});

const ID = '3f2b8c1e-9a4d-4e7b-8c5f-1a2b3c4d5e6f';
const t = (key: string) => (messages.uk[key] ?? key).replace(/''/g, "'");

const existing = (overrides: Record<string, unknown> = {}) =>
  clubJson({
    id: ID,
    organizerId: 'u1',
    description: 'Reads classics',
    coverUrl: 'https://example.com/old.jpg',
    tags: ['classics', 'drama'],
    meetingDurationMinutes: 90,
    afterMeetingVenue: { name: 'Pub', address: 'Beer st 2', description: 'Cosy' },
    ...overrides,
  });

function setup(club: Record<string, unknown> | number = existing()) {
  mockSession({ id: 'u1', role: 'organizer' });
  server.use(http.get(`${API}/clubs/${ID}`, () => (typeof club === 'number' ? HttpResponse.json({ detail: 'x' }, { status: club }) : HttpResponse.json(club))));
  return renderWithProviders(
    <StranglerProvider value={NEXT_ROUTES}>
      <EditClub id={ID} />
    </StranglerProvider>,
  );
}

const field = (key: string) => screen.getByLabelText(t(key));
const save = () => screen.getByTestId('save-button');
const loaded = () => screen.findByTestId('club-name-input');

describe('EditClub', () => {
  it('shows a spinner while the club loads, then the form prefilled from it', async () => {
    setup();
    expect(screen.getByRole('status')).toBeInTheDocument();
    const name = await loaded();
    expect(name).toHaveValue('Alpha Readers');
    expect(screen.getAllByLabelText(t('EDIT_CLUB.description_label'))[0]).toHaveValue('Reads classics');
    expect(field('EDIT_CLUB.city_label')).toHaveValue('Kyiv');
    expect(field('CLUB_MANAGE.tags_label')).toHaveValue('classics, drama');
    expect(field('CLUB_MANAGE.duration_label')).toHaveValue(90);
    expect(field('CLUB_MANAGE.venue_name')).toHaveValue('Pub');
    expect(field('CLUB_MANAGE.venue_address')).toHaveValue('Beer st 2');
    expect(screen.getAllByLabelText(t('CLUB_MANAGE.venue_description'))[1]).toHaveValue('Cosy');
    expect(screen.getByRole('switch', { name: t('EDIT_CLUB.public_label') })).toBeChecked();
    expect(document.querySelector('img')).toHaveAttribute('src', 'https://example.com/old.jpg');
  });

  it('reports a club that cannot be loaded', async () => {
    setup(404);
    expect(await screen.findByRole('alert')).toHaveTextContent(t('EDIT_CLUB.not_found'));
    expect(screen.queryByTestId('club-name-input')).not.toBeInTheDocument();
  });

  it('treats the stub of a private club as missing', async () => {
    setup({ id: ID, name: 'Hidden', isPublic: false, memberCount: 4 });
    expect(await screen.findByRole('alert')).toHaveTextContent(t('EDIT_CLUB.not_found'));
  });

  it.each([
    ['name', '', 'EDIT_CLUB.name_required'],
    ['name', 'ab', 'EDIT_CLUB.name_min'],
    ['name', 'x'.repeat(101), 'EDIT_CLUB.name_max'],
    ['description', 'x'.repeat(501), 'EDIT_CLUB.description_max'],
    ['duration', '0', 'CLUB_MANAGE.duration_invalid'],
    ['duration', '481', 'CLUB_MANAGE.duration_invalid'],
  ] as const)('blocks a save with %s=%j and shows %s', async (which, value, key) => {
    const bodies = capture('patch', `/clubs/${ID}`, () => HttpResponse.json(existing()));
    const user = userEvent.setup();
    setup();
    const name = await loaded();
    const input = which === 'name' ? name : which === 'description' ? screen.getAllByLabelText(t('EDIT_CLUB.description_label'))[0] : field('CLUB_MANAGE.duration_label');
    if (!input) throw new Error('field missing');
    await user.clear(input);
    if (value) {
      await user.click(input);
      await user.paste(value);
    }
    await user.click(save());
    expect(await screen.findByText(t(key))).toBeInTheDocument();
    expect(bodies).toEqual([]);
  });

  it('asks for the venue address once a venue name is set', async () => {
    const bodies = capture('patch', `/clubs/${ID}`, () => HttpResponse.json(existing()));
    const user = userEvent.setup();
    setup(existing({ afterMeetingVenue: null }));
    await loaded();
    await user.type(field('CLUB_MANAGE.venue_name'), 'Cafe');
    await user.click(save());
    expect(await screen.findByText(t('CLUB_MANAGE.venue_address_required'))).toBeInTheDocument();
    expect(field('CLUB_MANAGE.venue_address')).toHaveAttribute('aria-invalid', 'true');
    expect(bodies).toEqual([]);
  });

  it('rejects a malformed cover URL with a visible message', async () => {
    const user = userEvent.setup();
    setup();
    await loaded();
    await user.click(screen.getByRole('button', { name: t('COVER_UPLOAD.enter_url') }));
    const url = screen.getByTestId('cover-url-input');
    await user.clear(url);
    await user.type(url, 'nope');
    await user.click(save());
    expect(await screen.findByText(t('CREATE_CLUB.cover_url_invalid'))).toBeInTheDocument();
  });

  it('saves with the Angular payload, invalidates the club caches, toasts and opens the club', async () => {
    const bodies = capture('patch', `/clubs/${ID}`, () => HttpResponse.json(existing()));
    const user = userEvent.setup();
    const { queryClient } = setup();
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
    const name = await loaded();
    await user.clear(name);
    await user.type(name, 'Beta Readers');
    await user.clear(field('CLUB_MANAGE.tags_label'));
    await user.type(field('CLUB_MANAGE.tags_label'), ' sci-fi, ,fantasy ,');
    await user.clear(field('CLUB_MANAGE.duration_label'));
    await user.type(field('CLUB_MANAGE.duration_label'), '120');
    await user.click(screen.getByRole('switch', { name: t('EDIT_CLUB.public_label') }));
    await user.click(save());
    await waitFor(() => expect(nav.push).toHaveBeenCalledWith(`/clubs/${ID}`));
    expect(bodies).toEqual([
      {
        name: 'Beta Readers',
        description: 'Reads classics',
        isPublic: false,
        city: 'Kyiv',
        coverUrl: 'https://example.com/old.jpg',
        tags: ['sci-fi', 'fantasy'],
        meetingDurationMinutes: 120,
        afterMeetingVenue: { name: 'Pub', address: 'Beer st 2', description: 'Cosy' },
      },
    ]);
    expect(nav.toast).toHaveBeenCalledWith('success', t('EDIT_CLUB.success'));
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['clubs'] });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['club', ID] });
  });

  it('clears the duration, the venue and the cover with null, and drops an empty city', async () => {
    const bodies = capture('patch', `/clubs/${ID}`, () => HttpResponse.json(existing()));
    const user = userEvent.setup();
    setup();
    await loaded();
    await user.clear(field('CLUB_MANAGE.duration_label'));
    await user.clear(field('CLUB_MANAGE.venue_name'));
    await user.clear(field('EDIT_CLUB.city_label'));
    await user.click(screen.getByRole('button', { name: t('COVER_UPLOAD.remove') }));
    await user.click(save());
    await waitFor(() => expect(bodies).toHaveLength(1));
    expect(bodies[0]).toEqual({ name: 'Alpha Readers', description: 'Reads classics', isPublic: true, coverUrl: null, tags: ['classics', 'drama'], meetingDurationMinutes: null, afterMeetingVenue: null });
  });

  it('shows the backend detail, stays on the form and re-enables the button', async () => {
    capture('patch', `/clubs/${ID}`, () => HttpResponse.json({ detail: 'Club name already taken' }, { status: 409 }));
    const user = userEvent.setup();
    setup();
    await loaded();
    await user.click(save());
    expect(await screen.findByText('Club name already taken')).toBeInTheDocument();
    expect(save()).toBeEnabled();
    expect(nav.push).not.toHaveBeenCalled();
    expect(nav.toast).not.toHaveBeenCalled();
  });

  it('maps a server error to the localized message', async () => {
    capture('patch', `/clubs/${ID}`, () => new HttpResponse(null, { status: 500 }));
    const user = userEvent.setup();
    setup();
    await loaded();
    await user.click(save());
    await waitFor(() => expect(screen.getAllByRole('alert').some((a) => a.textContent?.includes(t('ERRORS.serverError')))).toBe(true));
  });

  it('sends a forbidden save to the list through the client handler', async () => {
    capture('patch', `/clubs/${ID}`, () => HttpResponse.json({ detail: 'Not your club' }, { status: 403 }));
    const user = userEvent.setup();
    setup();
    await loaded();
    await user.click(save());
    await waitFor(() => expect(nav.hard).toHaveBeenCalledWith('/clubs'));
  });

  it('cancels back to the club', async () => {
    const user = userEvent.setup();
    setup();
    await loaded();
    await user.click(screen.getByRole('button', { name: t('EDIT_CLUB.cancel') }));
    expect(nav.push).toHaveBeenCalledWith(`/clubs/${ID}`);
  });
});

describe('EditClub: cover URL wiring', () => {
  it('names the cover URL input and links its error', async () => {
    const user = userEvent.setup();
    setup();
    await loaded();
    await user.click(screen.getByRole('button', { name: t('COVER_UPLOAD.enter_url') }));
    const url = screen.getByLabelText(t('EDIT_CLUB.cover_url_label'));
    expect(url).toBe(screen.getByTestId('cover-url-input'));
    await user.clear(url);
    await user.type(url, 'nope');
    await user.click(save());
    const message = await screen.findByText(t('CREATE_CLUB.cover_url_invalid'));
    expect(url.getAttribute('aria-describedby')).toBe(message.id);
    expect(url).toHaveAttribute('aria-invalid', 'true');
  });

  it('sends one request when saved twice quickly', async () => {
    let release!: () => void;
    const gate = new Promise<void>((resolve) => (release = resolve));
    let patches = 0;
    server.use(
      http.patch(`${API}/clubs/${ID}`, async () => {
        patches += 1;
        await gate;
        return HttpResponse.json(existing());
      }),
    );
    const user = userEvent.setup();
    setup();
    const name = await loaded();
    await user.click(save());
    await waitFor(() => expect(save()).toBeDisabled());
    await user.type(name, '{Enter}');
    release();
    await waitFor(() => expect(nav.push).toHaveBeenCalledWith(`/clubs/${ID}`));
    expect(patches).toBe(1);
  });
});

describe('EditClub behind RequireRole', () => {
  it('turns a plain reader away before the club is even requested', async () => {
    const requested = vi.fn();
    mockSession({ role: 'user' });
    server.use(
      http.get(`${API}/clubs/${ID}`, () => {
        requested();
        return HttpResponse.json(existing());
      }),
    );
    renderWithProviders(
      <StranglerProvider value={NEXT_ROUTES}>
        <RequireRole role="organizer">
          <EditClub id={ID} />
        </RequireRole>
      </StranglerProvider>,
    );
    await waitFor(() => expect(nav.replace).toHaveBeenCalledWith('/clubs'));
    expect(nav.toast).toHaveBeenCalledWith('error', t('ERRORS.organizers_only'));
    expect(requested).not.toHaveBeenCalled();
    expect(screen.queryByTestId('club-name-input')).not.toBeInTheDocument();
  });
});
