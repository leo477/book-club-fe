import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { API, memberJson, renderWithProviders, server, setupApiServer } from '@/test/harness';
import { Bans } from './bans';
import { banJson, gate, ID, mockManageReads, t } from './test-support';

const toast = vi.hoisted(() => vi.fn());
vi.mock('@/lib/toast', () => ({ showToast: toast }));

setupApiServer();
beforeEach(() => toast.mockReset());

function backend(bans: ReturnType<typeof banJson>[]) {
  let list = bans;
  server.use(http.get(`${API}/clubs/${ID}/bans`, () => HttpResponse.json(list)));
  return (userId: string) => {
    list = list.filter((b) => b.userId !== userId);
  };
}

describe('Bans', () => {
  it('shows the empty state with a zero count', async () => {
    mockManageReads();
    renderWithProviders(<Bans clubId={ID} />);
    expect(await screen.findByText(t('CLUB_MANAGE.no_bans'))).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: new RegExp(`${t('CLUB_MANAGE.bans_title')} \\(0\\)`) })).toBeInTheDocument();
  });

  it('names a banned user from the members list and falls back to the id', async () => {
    mockManageReads({ members: [memberJson({ userId: 'b1', displayName: 'Grace Hopper' })] });
    backend([banJson(), banJson({ userId: 'ghost' })]);
    renderWithProviders(<Bans clubId={ID} />);
    expect(await screen.findByText('Grace Hopper')).toBeInTheDocument();
    expect(screen.getByText('ghost')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /\(2\)/ })).toBeInTheDocument();
  });

  it('unbans and removes the row', async () => {
    mockManageReads();
    const resolve = backend([banJson()]);
    const unbanned = vi.fn();
    server.use(
      http.delete(`${API}/clubs/${ID}/bans/b1`, () => {
        unbanned();
        resolve('b1');
        return new HttpResponse(null, { status: 204 });
      }),
    );
    const user = userEvent.setup();
    renderWithProviders(<Bans clubId={ID} />);
    await user.click(await screen.findByRole('button', { name: t('CLUB_MANAGE.unban') }));
    await waitFor(() => expect(screen.getByText(t('CLUB_MANAGE.no_bans'))).toBeInTheDocument());
    expect(unbanned).toHaveBeenCalledTimes(1);
  });

  it('puts the ban back at its place and toasts when unbanning fails', async () => {
    mockManageReads();
    backend([banJson(), banJson({ userId: 'b2' })]);
    server.use(http.delete(`${API}/clubs/${ID}/bans/b1`, () => HttpResponse.json({ detail: 'Not allowed' }, { status: 403 })));
    const user = userEvent.setup();
    renderWithProviders(<Bans clubId={ID} />);
    await screen.findByText('b1');
    await user.click(screen.getAllByRole('button', { name: t('CLUB_MANAGE.unban') })[0]!);
    await waitFor(() => expect(toast).toHaveBeenCalledWith('error', 'Not allowed'));
    const rows = screen.getAllByRole('listitem').map((li) => li.textContent);
    expect(rows[0]).toContain('b1');
    expect(rows[1]).toContain('b2');
  });

  it('sends one request for two clicks while the first is in flight', async () => {
    mockManageReads();
    const resolve = backend([banJson()]);
    const { open, release } = gate();
    let calls = 0;
    server.use(
      http.delete(`${API}/clubs/${ID}/bans/b1`, async () => {
        calls += 1;
        await open;
        resolve('b1');
        return new HttpResponse(null, { status: 204 });
      }),
    );
    renderWithProviders(<Bans clubId={ID} />);
    const button = await screen.findByRole('button', { name: t('CLUB_MANAGE.unban') });
    await act(async () => {
      fireEvent.click(button);
      fireEvent.click(button);
    });
    release();
    await waitFor(() => expect(screen.getByText(t('CLUB_MANAGE.no_bans'))).toBeInTheDocument());
    expect(calls).toBe(1);
  });
});
