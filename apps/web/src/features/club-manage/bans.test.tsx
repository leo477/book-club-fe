import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { API, pageOf, renderWithProviders, server, setupApiServer } from '@/test/harness';
import { Bans } from './bans';
import { editItems, type PagedData } from '@/features/club-shared/paged-list';
import { bansKey } from './use-club-manage';
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

const releases: (() => void)[] = [];
const openGate = () => {
  const g = gate();
  releases.push(g.release);
  return g;
};

describe('Bans', () => {
  afterEach(() => {
    releases.splice(0).forEach((r) => r());
  });

  it('shows the empty state with a zero count', async () => {
    mockManageReads();
    renderWithProviders(<Bans clubId={ID} />);
    expect(await screen.findByText(t('CLUB_MANAGE.no_bans'))).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: new RegExp(`${t('CLUB_MANAGE.bans_title')} \\(0\\)`) })).toBeInTheDocument();
  });

  it('labels a banned user by a short id, since the ban carries no name and the user left the members', async () => {
    mockManageReads();
    backend([banJson({ userId: '3f2b8c1e-9a4d-4e7b-8c5f-1a2b3c4d5e6f' })]);
    renderWithProviders(<Bans clubId={ID} />);
    expect(await screen.findByText(`${t('CLUB_MANAGE.banned_user')} 3f2b8c1e`)).toBeInTheDocument();
    expect(screen.queryByText(/3f2b8c1e-9a4d/)).not.toBeInTheDocument();
  });

  it('uses the display name the ban carries', async () => {
    mockManageReads();
    backend([banJson({ displayName: 'Grace Hopper' }), banJson({ userId: 'ghost-user-id-1234' })]);
    renderWithProviders(<Bans clubId={ID} />);
    expect(await screen.findByText('Grace Hopper')).toBeInTheDocument();
    expect(screen.getByText(`${t('CLUB_MANAGE.banned_user')} ghost-us`)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /\(2\)/ })).toBeInTheDocument();
  });

  it('loads the bans a page at a time and shows the full count', async () => {
    mockManageReads();
    const urls: string[] = [];
    const all = Array.from({ length: 230 }, (_, i) => banJson({ userId: `user-${i}-xxxxxxxx` }));
    server.use(
      http.get(`${API}/clubs/${ID}/bans`, ({ request }) => {
        urls.push(new URL(request.url).search);
        return pageOf(all, request);
      }),
    );
    const user = userEvent.setup();
    renderWithProviders(<Bans clubId={ID} />);
    await screen.findByText(`${t('CLUB_MANAGE.banned_user')} user-0-x`);
    expect(urls).toEqual(['?skip=0&limit=100']);
    expect(screen.getByRole('heading', { name: new RegExp(`\\(230\\)`) })).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(100);
    await user.click(screen.getByRole('button', { name: t('PAGINATION.load_more') }));
    await waitFor(() => expect(screen.getAllByRole('listitem')).toHaveLength(200));
    await user.click(screen.getByRole('button', { name: t('PAGINATION.load_more') }));
    await waitFor(() => expect(screen.getAllByRole('listitem')).toHaveLength(230));
    expect(urls).toEqual(['?skip=0&limit=100', '?skip=100&limit=100', '?skip=200&limit=100']);
    expect(screen.queryByRole('button', { name: t('PAGINATION.load_more') })).not.toBeInTheDocument();
  });

  it('offers no load more once every ban is shown', async () => {
    mockManageReads();
    backend([banJson()]);
    renderWithProviders(<Bans clubId={ID} />);
    await screen.findByText(/b1/);
    expect(screen.queryByRole('button', { name: t('PAGINATION.load_more') })).not.toBeInTheDocument();
  });

  it('shows an error, not the empty state, when the list is refused', async () => {
    mockManageReads();
    server.use(http.get(`${API}/clubs/${ID}/bans`, () => HttpResponse.json({ detail: 'Not authorized' }, { status: 403 })));
    renderWithProviders(<Bans clubId={ID} />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Not authorized');
    expect(screen.queryByText(t('CLUB_MANAGE.no_bans'))).not.toBeInTheDocument();
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
    await screen.findByText(/b1/);
    await user.click(screen.getAllByRole('button', { name: t('CLUB_MANAGE.unban') })[0]!);
    await waitFor(() => expect(toast).toHaveBeenCalledWith('error', 'Not allowed'));
    const rows = await screen.findAllByRole('listitem');
    expect(rows[0]).toHaveTextContent(/b1/);
    expect(rows[1]).toHaveTextContent(/b2/);
  });

  it('restores the ban at the position of the list as it is when the unban starts, not as it was rendered', async () => {
    mockManageReads();
    backend([banJson(), banJson({ userId: 'b2' }), banJson({ userId: 'b3' })]);
    server.use(http.delete(`${API}/clubs/${ID}/bans/b2`, () => HttpResponse.json({ detail: 'Not allowed' }, { status: 403 })));
    const { queryClient } = renderWithProviders(<Bans clubId={ID} />);
    await screen.findByText(/b3/);
    const { open } = openGate();
    server.use(http.get(`${API}/clubs/${ID}/bans`, async () => {
      await open;
      return HttpResponse.json([]);
    }));
    await act(async () => {
      fireEvent.click(screen.getAllByRole('button', { name: t('CLUB_MANAGE.unban') })[1]!);
      queryClient.setQueryData(bansKey(ID), (data: PagedData<ReturnType<typeof banJson>>) => editItems(data, (list) => list.filter((b) => b.userId !== 'b1')));
    });
    await waitFor(() => expect(toast).toHaveBeenCalledWith('error', 'Not allowed'));
    const rows = await screen.findAllByRole('listitem');
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveTextContent(/b2/);
    expect(rows[1]).toHaveTextContent(/b3/);
  });

  it('appends the ban when it was already missing from the list at the moment the unban started', async () => {
    mockManageReads();
    backend([banJson(), banJson({ userId: 'b2' }), banJson({ userId: 'b3' })]);
    server.use(http.delete(`${API}/clubs/${ID}/bans/b2`, () => HttpResponse.json({ detail: 'Not allowed' }, { status: 403 })));
    const { queryClient } = renderWithProviders(<Bans clubId={ID} />);
    await screen.findByText(/b3/);
    const { open } = openGate();
    server.use(http.get(`${API}/clubs/${ID}/bans`, async () => {
      await open;
      return HttpResponse.json([]);
    }));
    await act(async () => {
      fireEvent.click(screen.getAllByRole('button', { name: t('CLUB_MANAGE.unban') })[1]!);
      queryClient.setQueryData(bansKey(ID), (data: PagedData<ReturnType<typeof banJson>>) => editItems(data, (list) => list.filter((b) => b.userId !== 'b2')));
    });
    await waitFor(() => expect(toast).toHaveBeenCalledWith('error', 'Not allowed'));
    expect(queryClient.getQueryData<PagedData<ReturnType<typeof banJson>>>(bansKey(ID))?.pages.flatMap((page) => page.items).map((b) => b.userId)).toEqual(['b1', 'b3', 'b2']);
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
