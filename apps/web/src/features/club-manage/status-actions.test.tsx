import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { clubKey } from '@/features/club-detail/use-club-detail';
import { API, clubJson, renderWithProviders, server, setupApiServer } from '@/test/harness';
import { StatusActions } from './status-actions';
import { gate, ID, t } from './test-support';

const toast = vi.hoisted(() => vi.fn());
vi.mock('@/lib/toast', () => ({ showToast: toast }));

setupApiServer();
beforeEach(() => toast.mockReset());

const club = (overrides: Record<string, unknown> = {}) => clubJson({ id: ID, organizerId: 'u1', ...overrides });
const button = (key: string) => screen.getByRole('button', { name: t(key) });

describe('StatusActions', () => {
  it('pauses the club, stores the answer and refreshes club and event queries', async () => {
    const paused = vi.fn();
    server.use(http.patch(`${API}/clubs/${ID}/pause`, () => (paused(), HttpResponse.json(club({ status: 'paused' })))));
    const { queryClient } = renderWithProviders(<StatusActions clubId={ID} />);
    const spy = vi.spyOn(queryClient, 'invalidateQueries');
    await userEvent.setup().click(button('CLUB_DETAIL.pause'));
    await waitFor(() => expect(queryClient.getQueryData<{ status: string }>(clubKey(ID))?.status).toBe('paused'));
    expect(paused).toHaveBeenCalledTimes(1);
    const keys = spy.mock.calls.map((c) => JSON.stringify(c[0]?.queryKey));
    expect(keys).toEqual(expect.arrayContaining([JSON.stringify(['clubs']), JSON.stringify(['club', ID]), JSON.stringify(['events'])]));
  });

  it('asks before cancelling, and backing out sends nothing', async () => {
    const cancelled = vi.fn();
    server.use(http.patch(`${API}/clubs/${ID}/cancel`, () => (cancelled(), HttpResponse.json(club({ status: 'cancelled' })))));
    const user = userEvent.setup();
    renderWithProviders(<StatusActions clubId={ID} />);
    await user.click(button('CLUB_MANAGE.cancel_club'));
    expect(button('CLUB_DETAIL.delete_club_yes')).toBeInTheDocument();
    expect(cancelled).not.toHaveBeenCalled();
    await user.click(button('CLUB_DETAIL.cancel'));
    expect(button('CLUB_MANAGE.cancel_club')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: t('CLUB_DETAIL.delete_club_yes') })).not.toBeInTheDocument();
    expect(cancelled).not.toHaveBeenCalled();
  });

  it('cancels after confirmation and shows the cancelled club in the cache', async () => {
    server.use(http.patch(`${API}/clubs/${ID}/cancel`, () => HttpResponse.json(club({ status: 'cancelled', cancelledAt: '2099-01-01T00:00:00Z' }))));
    const user = userEvent.setup();
    const { queryClient } = renderWithProviders(<StatusActions clubId={ID} />);
    await user.click(button('CLUB_MANAGE.cancel_club'));
    await user.click(button('CLUB_DETAIL.delete_club_yes'));
    await waitFor(() => expect(queryClient.getQueryData<{ status: string }>(clubKey(ID))?.status).toBe('cancelled'));
    expect(button('CLUB_MANAGE.cancel_club')).toBeInTheDocument();
  });

  it('toasts the backend detail when cancelling fails', async () => {
    server.use(http.patch(`${API}/clubs/${ID}/cancel`, () => HttpResponse.json({ detail: 'Already cancelled' }, { status: 409 })));
    const user = userEvent.setup();
    renderWithProviders(<StatusActions clubId={ID} />);
    await user.click(button('CLUB_MANAGE.cancel_club'));
    await user.click(button('CLUB_DETAIL.delete_club_yes'));
    await waitFor(() => expect(toast).toHaveBeenCalledWith('error', 'Already cancelled'));
  });

  it('sends one cancel for two confirmations in a row', async () => {
    const { open, release } = gate();
    let calls = 0;
    server.use(
      http.patch(`${API}/clubs/${ID}/cancel`, async () => {
        calls += 1;
        await open;
        return HttpResponse.json(club({ status: 'cancelled' }));
      }),
    );
    const user = userEvent.setup();
    renderWithProviders(<StatusActions clubId={ID} />);
    await user.click(button('CLUB_MANAGE.cancel_club'));
    const yes = button('CLUB_DETAIL.delete_club_yes');
    await act(async () => {
      fireEvent.click(yes);
      fireEvent.click(yes);
    });
    release();
    await waitFor(() => expect(button('CLUB_MANAGE.cancel_club')).toBeEnabled());
    expect(calls).toBe(1);
  });

  it('reschedules with an ISO date, then closes and clears the input', async () => {
    const bodies: unknown[] = [];
    server.use(
      http.patch(`${API}/clubs/${ID}/reschedule`, async ({ request }) => {
        bodies.push(await request.json());
        return HttpResponse.json(club({ nextMeetingDate: '2099-06-01T10:30:00.000Z' }));
      }),
    );
    const user = userEvent.setup();
    renderWithProviders(<StatusActions clubId={ID} />);
    await user.click(button('CLUB_DETAIL.reschedule'));
    expect(button('CLUB_DETAIL.reschedule_submit')).toBeDisabled();
    fireEvent.change(screen.getByLabelText(t('CLUB_DETAIL.reschedule'), { selector: 'input' }), { target: { value: '2099-06-01T10:30' } });
    await user.click(button('CLUB_DETAIL.reschedule_submit'));
    await waitFor(() => expect(screen.queryByRole('button', { name: t('CLUB_DETAIL.reschedule_submit') })).not.toBeInTheDocument());
    expect(bodies).toEqual([{ newDate: new Date('2099-06-01T10:30').toISOString() }]);
  });

  it('keeps the date input open when rescheduling fails', async () => {
    server.use(http.patch(`${API}/clubs/${ID}/reschedule`, () => HttpResponse.json({ detail: 'Date is in the past' }, { status: 422 })));
    const user = userEvent.setup();
    renderWithProviders(<StatusActions clubId={ID} />);
    await user.click(button('CLUB_DETAIL.reschedule'));
    fireEvent.change(screen.getByLabelText(t('CLUB_DETAIL.reschedule'), { selector: 'input' }), { target: { value: '2001-01-01T10:00' } });
    await user.click(button('CLUB_DETAIL.reschedule_submit'));
    await waitFor(() => expect(toast).toHaveBeenCalledWith('error', 'Date is in the past'));
    expect(button('CLUB_DETAIL.reschedule_submit')).toBeEnabled();
  });
});
