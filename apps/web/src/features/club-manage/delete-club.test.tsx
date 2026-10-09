import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { clubKey } from '@/features/club-detail/use-club-detail';
import { NEXT_ROUTES } from '@/features/organizer/test-support';
import { StranglerProvider } from '@/strangler/context';
import { API, clubJson, renderWithProviders, server, setupApiServer } from '@/test/harness';
import { DeleteClub } from './delete-club';
import { gate, ID, t } from './test-support';

const nav = vi.hoisted(() => ({ push: vi.fn(), hard: vi.fn(), toast: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: nav.push, replace: vi.fn() }) }));
vi.mock('@/lib/navigate', () => ({ hardNavigate: nav.hard, replaceNavigate: vi.fn() }));
vi.mock('@/lib/toast', () => ({ showToast: nav.toast }));

setupApiServer();
beforeEach(() => Object.values(nav).forEach((fn) => fn.mockReset()));

const view = () =>
  renderWithProviders(
    <StranglerProvider value={NEXT_ROUTES}>
      <DeleteClub clubId={ID} />
    </StranglerProvider>,
  );
const open = (name: string) => screen.getByRole('button', { name: new RegExp(t(name)) });

describe('DeleteClub', () => {
  it('asks for confirmation and sends nothing until it is given', async () => {
    const removed = vi.fn();
    server.use(http.delete(`${API}/clubs/${ID}`, () => (removed(), new HttpResponse(null, { status: 204 }))));
    const user = userEvent.setup();
    view();
    await user.click(open('CLUB_DETAIL.delete_club_btn'));
    expect(screen.getByText(t('CLUB_DETAIL.delete_club_confirm'))).toBeInTheDocument();
    await user.click(open('CLUB_DETAIL.cancel'));
    expect(open('CLUB_DETAIL.delete_club_btn')).toBeInTheDocument();
    expect(removed).not.toHaveBeenCalled();
    expect(nav.push).not.toHaveBeenCalled();
  });

  it('deletes, drops the club from the cache, refreshes lists and leaves for /clubs', async () => {
    server.use(http.delete(`${API}/clubs/${ID}`, () => new HttpResponse(null, { status: 204 })));
    const user = userEvent.setup();
    const { queryClient } = view();
    queryClient.setQueryData(clubKey(ID), clubJson({ id: ID }));
    const spy = vi.spyOn(queryClient, 'invalidateQueries');
    await user.click(open('CLUB_DETAIL.delete_club_btn'));
    await user.click(open('CLUB_DETAIL.delete_club_yes'));
    await waitFor(() => expect(nav.push).toHaveBeenCalledWith('/clubs'));
    expect(queryClient.getQueryData(clubKey(ID))).toBeUndefined();
    const keys = spy.mock.calls.map((c) => JSON.stringify(c[0]?.queryKey));
    expect(keys).toEqual(expect.arrayContaining([JSON.stringify(['clubs']), JSON.stringify(['events'])]));
    expect(open('CLUB_DETAIL.delete_club_yes')).toBeDisabled();
  });

  it('stays on the page, toasts the detail and allows another try when deleting fails', async () => {
    server.use(http.delete(`${API}/clubs/${ID}`, () => HttpResponse.json({ detail: 'Club has events' }, { status: 409 })));
    const user = userEvent.setup();
    view();
    await user.click(open('CLUB_DETAIL.delete_club_btn'));
    await user.click(open('CLUB_DETAIL.delete_club_yes'));
    await waitFor(() => expect(nav.toast).toHaveBeenCalledWith('error', 'Club has events'));
    expect(nav.push).not.toHaveBeenCalled();
    expect(open('CLUB_DETAIL.delete_club_yes')).toBeEnabled();
  });

  it('sends one DELETE for two confirmations before the button re-renders', async () => {
    const gateway = gate();
    let calls = 0;
    server.use(
      http.delete(`${API}/clubs/${ID}`, async () => {
        calls += 1;
        await gateway.open;
        return new HttpResponse(null, { status: 204 });
      }),
    );
    const user = userEvent.setup();
    view();
    await user.click(open('CLUB_DETAIL.delete_club_btn'));
    const yes = open('CLUB_DETAIL.delete_club_yes');
    await act(async () => {
      fireEvent.click(yes);
      fireEvent.click(yes);
    });
    gateway.release();
    await waitFor(() => expect(nav.push).toHaveBeenCalledTimes(1));
    expect(calls).toBe(1);
  });

  it('does not navigate or toast when the page was left before the answer arrived', async () => {
    const gateway = gate();
    server.use(
      http.delete(`${API}/clubs/${ID}`, async () => {
        await gateway.open;
        return HttpResponse.json({ detail: 'late failure' }, { status: 500 });
      }),
    );
    const user = userEvent.setup();
    const { unmount } = view();
    await user.click(open('CLUB_DETAIL.delete_club_btn'));
    await user.click(open('CLUB_DETAIL.delete_club_yes'));
    unmount();
    gateway.release();
    await new Promise((r) => setTimeout(r, 50));
    expect(nav.toast).not.toHaveBeenCalledWith('error', 'late failure');
    expect(nav.push).not.toHaveBeenCalled();
  });
});
