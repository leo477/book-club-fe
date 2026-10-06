import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { API, eventJson, messages, renderWithProviders, server, setupApiServer, userJson } from '@/test/harness';
import { EventDetail } from './event-detail';

const toast = vi.hoisted(() => vi.fn());
vi.mock('@/lib/toast', () => ({ showToast: toast }));
vi.mock('@/lib/navigate', () => ({ hardNavigate: vi.fn(), replaceNavigate: vi.fn() }));
vi.mock('./event-map', () => ({
  default: (props: { lat: number; lng: number }) => <div data-testid="map">{`${props.lat},${props.lng}`}</div>,
}));

setupApiServer();
beforeEach(() => toast.mockReset());

const t = (key: string) => messages.uk[key] ?? key;

function mockApi(event: Record<string, unknown> | number, user: Record<string, unknown> = {}) {
  let current = typeof event === 'number' ? null : event;
  const gets: string[] = [];
  server.use(
    http.get(`${API}/auth/session-status`, () => HttpResponse.json({ hasSession: true })),
    http.get(`${API}/auth/me`, () => HttpResponse.json(userJson(user))),
    http.get(`${API}/events/e1`, () => {
      gets.push('get');
      return typeof event === 'number' ? new HttpResponse(null, { status: event }) : HttpResponse.json(current);
    }),
    http.get(`${API}/books/stores`, () => HttpResponse.json([])),
  );
  return { gets, set: (next: Record<string, unknown>) => (current = next) };
}

describe('EventDetail', () => {
  it('shows a busy skeleton while loading', () => {
    mockApi(eventJson());
    const { container } = renderWithProviders(<EventDetail id="e1" />);
    expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument();
  });

  it('renders the event with its facts, club link and sections', async () => {
    mockApi(
      eventJson({
        description: 'Bring snacks',
        address: 'Main st 1',
        durationMinutes: 90,
        theme: 'Sci-fi',
        tags: ['a', 'b'],
        afterMeetingVenue: { name: 'Pub', address: 'Beer st 2', description: 'Cosy' },
        bookTitle: 'Dune',
      }),
    );
    renderWithProviders(<EventDetail id="e1" />);
    expect(await screen.findByRole('heading', { level: 1, name: 'Dune night' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Alpha Readers/ })).toHaveAttribute('href', '/clubs/c1');
    expect(screen.getByRole('link', { name: t('EVENTS.back_to_events') })).toHaveAttribute('href', '/events');
    expect(screen.getByText(/Main st 1/)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`90 ${t('EVENTS.minutes_abbr')}`))).toBeInTheDocument();
    expect(screen.getByText('Bring snacks')).toBeInTheDocument();
    expect(screen.getByText('Sci-fi')).toBeInTheDocument();
    expect(screen.getByText('Pub')).toBeInTheDocument();
    expect(screen.getByText('Cosy')).toBeInTheDocument();
    expect(await screen.findByText(t('BOOK_STORES.title'))).toBeInTheDocument();
  });

  it('shows the load error with a way back for a missing event', async () => {
    mockApi(404);
    renderWithProviders(<EventDetail id="e1" />);
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(t('EVENTS.load_error'));
    expect(screen.getByRole('link', { name: t('EVENTS.back_to_events') })).toHaveAttribute('href', '/events');
  });

  it('mounts the map only for events with coordinates', async () => {
    mockApi(eventJson({ lat: 50.45, lng: 30.52 }));
    const withCoords = renderWithProviders(<EventDetail id="e1" />);
    expect(await screen.findByTestId('map')).toHaveTextContent('50.45,30.52');
    withCoords.unmount();

    mockApi(eventJson());
    renderWithProviders(<EventDetail id="e1" />);
    await screen.findByText('Dune night');
    expect(screen.queryByTestId('map')).not.toBeInTheDocument();
  });

  it('toggles the book details and loads them only once opened', async () => {
    const book = vi.fn(() => HttpResponse.json({ id: 'g1', title: 'Dune (full)', authors: ['Frank Herbert'], description: 'Spice', publishedDate: '1965-08-01', publisher: 'Chilton', thumbnail: null }));
    mockApi(eventJson({ bookTitle: 'Dune', googleBookId: 'g1' }));
    server.use(http.get(`${API}/books/details/g1`, book));
    renderWithProviders(<EventDetail id="e1" />);
    const toggle = await screen.findByRole('button', { name: t('EVENTS.book_details_btn') });
    expect(book).not.toHaveBeenCalled();
    await userEvent.click(toggle);
    expect(await screen.findByText('Dune (full)')).toBeInTheDocument();
    expect(screen.getByText(/1965/)).toBeInTheDocument();
    expect(screen.getByText('Chilton')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: t('EVENTS.book_details_hide') })).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(screen.getByRole('button', { name: t('EVENTS.book_details_hide') }));
    expect(screen.queryByText('Dune (full)')).not.toBeInTheDocument();
    expect(book).toHaveBeenCalledTimes(1);
  });

  describe('RSVP', () => {
    it('joins optimistically, with the cancel affordance once attending, and refetches', async () => {
      const api = mockApi(eventJson());
      server.use(
        http.post(`${API}/events/e1/attend`, () => {
          api.set(eventJson({ isAttending: true, attendeeCount: 3 }));
          return HttpResponse.json({ attendeeCount: 3, joinRequestStatus: 'member' });
        }),
      );
      renderWithProviders(<EventDetail id="e1" />);
      const button = await screen.findByTestId('event-rsvp-button');
      expect(button).toHaveTextContent(t('events.rsvp.join'));
      await userEvent.click(button);
      await waitFor(() => expect(screen.getByTestId('event-rsvp-button')).toHaveTextContent(`${t('events.rsvp.attending')} · ${t('events.rsvp.cancel')}`));
      await waitFor(() => expect(api.gets).toHaveLength(2));
      expect(toast).not.toHaveBeenCalled();
    });

    it('announces a pending join request', async () => {
      mockApi(eventJson());
      server.use(http.post(`${API}/events/e1/attend`, () => HttpResponse.json({ attendeeCount: 3, joinRequestStatus: 'pending' })));
      renderWithProviders(<EventDetail id="e1" />);
      await userEvent.click(await screen.findByTestId('event-rsvp-button'));
      await waitFor(() => expect(toast).toHaveBeenCalledWith('success', t('EVENTS.join_request_sent')));
    });

    it('rolls back and shows the closed-registration toast on a 400', async () => {
      mockApi(eventJson({ attendeeCount: 2 }));
      server.use(http.post(`${API}/events/e1/attend`, () => HttpResponse.json({ detail: 'x' }, { status: 400 })));
      renderWithProviders(<EventDetail id="e1" />);
      await userEvent.click(await screen.findByTestId('event-rsvp-button'));
      await waitFor(() => expect(toast).toHaveBeenCalledWith('error', t('EVENTS.registration_closed')));
      await waitFor(() => expect(screen.getByTestId('event-rsvp-button')).toHaveTextContent(t('events.rsvp.join')));
      expect(screen.getByText(new RegExp(`2 ${t('EVENTS.attending')}`))).toBeInTheDocument();
    });

    it('patches the list caches with the detail RSVP and restores them on failure', async () => {
      let release: () => void = () => undefined;
      const gate = new Promise<void>((r) => (release = r));
      mockApi(eventJson());
      server.use(
        http.post(`${API}/events/e1/attend`, async () => {
          await gate;
          return HttpResponse.json({ detail: 'Event is full' }, { status: 409 });
        }),
      );
      const { queryClient } = renderWithProviders(<EventDetail id="e1" />);
      queryClient.setQueryData(['events', 'all'], [eventJson()]);
      queryClient.setQueryData(['events', 'mine'], [eventJson()]);
      const attendance = (key: string) => (queryClient.getQueryData<{ isAttending: boolean; attendeeCount: number }[]>(['events', key]) ?? [])[0];
      await userEvent.click(await screen.findByTestId('event-rsvp-button'));
      expect(attendance('all')).toMatchObject({ isAttending: true, attendeeCount: 3 });
      expect(attendance('mine')).toMatchObject({ isAttending: true, attendeeCount: 3 });
      release();
      await waitFor(() => expect(toast).toHaveBeenCalledWith('error', 'Event is full'));
      expect(attendance('all')).toMatchObject({ isAttending: false, attendeeCount: 2 });
      expect(attendance('mine')).toMatchObject({ isAttending: false, attendeeCount: 2 });
    });

    it('flips and rolls back the visible cache entry when the URL id is uppercase', async () => {
      let release: () => void = () => undefined;
      const gate = new Promise<void>((r) => (release = r));
      mockApi(eventJson({ attendeeCount: 2 }));
      server.use(
        http.post(`${API}/events/e1/attend`, async () => {
          await gate;
          return HttpResponse.json({ detail: 'Event is full' }, { status: 409 });
        }),
      );
      const { queryClient } = renderWithProviders(<EventDetail id="E1" />);
      const button = await screen.findByTestId('event-rsvp-button');
      expect(queryClient.getQueryData(['events', 'detail', 'e1'])).toBeDefined();
      expect(queryClient.getQueryData(['events', 'detail', 'E1'])).toBeUndefined();
      await userEvent.click(button);
      expect(screen.getByText(new RegExp(`3 ${t('EVENTS.attending')}`))).toBeInTheDocument();
      release();
      await waitFor(() => expect(toast).toHaveBeenCalledWith('error', 'Event is full'));
      await waitFor(() => expect(screen.getByText(new RegExp(`2 ${t('EVENTS.attending')}`))).toBeInTheDocument());
    });

    it('cancels attendance', async () => {
      const api = mockApi(eventJson({ isAttending: true, attendeeCount: 3 }));
      const del = vi.fn(() => {
        api.set(eventJson({ isAttending: false, attendeeCount: 2 }));
        return new HttpResponse(null, { status: 204 });
      });
      server.use(http.delete(`${API}/events/e1/attend`, del));
      renderWithProviders(<EventDetail id="e1" />);
      await userEvent.click(await screen.findByTestId('event-rsvp-button'));
      await waitFor(() => expect(screen.getByTestId('event-rsvp-button')).toHaveTextContent(t('events.rsvp.join')));
      expect(del).toHaveBeenCalledTimes(1);
    });

    it('offers no RSVP on a cancelled event', async () => {
      mockApi(eventJson({ status: 'cancelled' }));
      renderWithProviders(<EventDetail id="e1" />);
      await screen.findByText('Dune night');
      expect(screen.queryByTestId('event-rsvp-button')).not.toBeInTheDocument();
    });
  });

  it('offers no RSVP to a guest', async () => {
    mockApi(eventJson());
    server.use(http.get(`${API}/auth/session-status`, () => HttpResponse.json({ hasSession: false })));
    renderWithProviders(<EventDetail id="e1" />);
    await screen.findByText('Dune night');
    expect(screen.queryByTestId('event-rsvp-button')).not.toBeInTheDocument();
  });

  it.each(['active', 'cancelled'])('shows a translated %s status badge, none for a scheduled event', async (status) => {
    mockApi(eventJson({ status }));
    renderWithProviders(<EventDetail id="e1" />);
    await screen.findByText('Dune night');
    expect(screen.getByText(t(`EVENTS.status_${status}`))).toBeInTheDocument();
    expect(screen.queryByText(status)).not.toBeInTheDocument();
  });

  it('falls back to the raw status when it has no translation', async () => {
    mockApi(eventJson({ status: 'held' }));
    renderWithProviders(<EventDetail id="e1" />);
    expect(await screen.findByText('held')).toBeInTheDocument();
  });

  it('renders the book cover as decorative since the title sits next to it', async () => {
    mockApi(eventJson({ coverUrl: 'https://img.example/c.jpg', bookTitle: 'Dune' }));
    const { container } = renderWithProviders(<EventDetail id="e1" />);
    await screen.findByText('Dune night');
    expect(container.querySelector('img')).toHaveAttribute('alt', '');
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  describe('organizer', () => {
    it('hides the controls from other users', async () => {
      mockApi(eventJson());
      renderWithProviders(<EventDetail id="e1" />);
      await screen.findByText('Dune night');
      expect(screen.queryByText(t('EVENTS.organizer_controls'))).not.toBeInTheDocument();
    });

    it('links to the legacy edit page and cancels the event after a confirmation', async () => {
      const api = mockApi(eventJson(), { id: 'o1' });
      const cancel = vi.fn(() => {
        api.set(eventJson({ status: 'cancelled' }));
        return HttpResponse.json(eventJson({ status: 'cancelled' }));
      });
      server.use(http.patch(`${API}/events/e1/cancel`, cancel));
      renderWithProviders(<EventDetail id="e1" />);
      expect(await screen.findByRole('link', { name: t('EVENTS.editEvent') })).toHaveAttribute('href', '/events/e1/edit');
      await userEvent.click(screen.getByRole('button', { name: t('EVENTS.cancel_event') }));
      expect(screen.getByText(t('EVENTS.cancel_confirm'))).toBeInTheDocument();
      expect(cancel).not.toHaveBeenCalled();
      const [, confirm] = screen.getAllByRole('button', { name: t('EVENTS.cancel_event') });
      await userEvent.click(confirm!);
      await waitFor(() => expect(cancel).toHaveBeenCalledTimes(1));
      await waitFor(() => expect(screen.queryByText(t('EVENTS.organizer_controls'))).not.toBeInTheDocument());
    });

    it('dismisses the confirmation without cancelling, moving focus into it and back out', async () => {
      mockApi(eventJson(), { id: 'o1' });
      renderWithProviders(<EventDetail id="e1" />);
      const trigger = await screen.findByRole('button', { name: t('EVENTS.cancel_event') });
      await userEvent.click(trigger);
      const [, confirm] = screen.getAllByRole('button', { name: t('EVENTS.cancel_event') });
      expect(confirm).toHaveFocus();
      await userEvent.click(screen.getByRole('button', { name: t('CREATE_EVENT.cancel') }));
      expect(screen.queryByText(t('EVENTS.cancel_confirm'))).not.toBeInTheDocument();
      expect(trigger).toHaveFocus();
    });
  });
});
