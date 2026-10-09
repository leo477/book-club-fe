import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { API, renderWithProviders, server, setupApiServer } from '@/test/harness';
import { Requests } from './requests';
import { gate, ID, mockManageReads, requestJson, t } from './test-support';

const toast = vi.hoisted(() => vi.fn());
vi.mock('@/lib/toast', () => ({ showToast: toast }));

setupApiServer();
beforeEach(() => toast.mockReset());

/** The list a backend would return: a resolved request is gone from the next fetch. */
function backend(requests: ReturnType<typeof two>) {
  let list = requests;
  server.use(http.get(`${API}/clubs/${ID}/join-requests`, () => HttpResponse.json(list)));
  return (userId: string) => {
    list = list.filter((r) => r.userId !== userId);
  };
}

const two = () => [requestJson(), requestJson({ userId: 'r2', displayName: 'Mary Jackson', avatarUrl: 'https://example.com/a.png' })];

describe('Requests', () => {
  it('lists pending requests with their source, and an avatar only for an http(s) URL', async () => {
    mockManageReads({ requests: [...two(), requestJson({ userId: 'r3', displayName: 'Evil', avatarUrl: 'javascript:alert(1)' })] });
    renderWithProviders(<Requests clubId={ID} />);
    expect(await screen.findByText('Katherine Johnson')).toBeInTheDocument();
    expect(screen.getAllByText('link')).toHaveLength(3);
    expect(screen.getByText('Mary Jackson').closest('li')!.querySelector('img')).toHaveAttribute('src', 'https://example.com/a.png');
    expect(screen.getByText('Evil').closest('li')!.querySelector('img')).toBeNull();
    expect(document.querySelector('[src^="javascript"]')).toBeNull();
  });

  it('renders the normalized URL, never the raw text, as the avatar source', async () => {
    mockManageReads({ requests: [requestJson({ avatarUrl: 'HTTPS://Example.com/a b.png' }), requestJson({ userId: 'r9', displayName: 'Data', avatarUrl: 'data:image/svg+xml,<svg onload=alert(1)>' })] });
    renderWithProviders(<Requests clubId={ID} />);
    expect((await screen.findByText('Katherine Johnson')).closest('li')!.querySelector('img')).toHaveAttribute('src', 'https://example.com/a%20b.png');
    expect(screen.getByText('Data').closest('li')!.querySelector('img')).toBeNull();
  });

  it('asks for the largest page and warns when a full page may hide more requests', async () => {
    const urls: string[] = [];
    mockManageReads();
    server.use(
      http.get(`${API}/clubs/${ID}/join-requests`, ({ request }) => {
        urls.push(new URL(request.url).search);
        return HttpResponse.json(Array.from({ length: 200 }, (_, i) => requestJson({ userId: `r${i}`, displayName: `Reader ${i}` })));
      }),
    );
    renderWithProviders(<Requests clubId={ID} />);
    expect(await screen.findByText(t('CLUB_MANAGE.list_truncated'))).toBeInTheDocument();
    expect(urls).toEqual(['?limit=200']);
  });

  it('shows an error, not "no pending requests", when the list is refused', async () => {
    mockManageReads();
    server.use(http.get(`${API}/clubs/${ID}/join-requests`, () => HttpResponse.json({ detail: 'Not authorized' }, { status: 403 })));
    renderWithProviders(<Requests clubId={ID} />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Not authorized');
    expect(screen.queryByText(t('CLUBS.no_join_requests'))).not.toBeInTheDocument();
  });

  it('shows the empty state', async () => {
    mockManageReads();
    renderWithProviders(<Requests clubId={ID} />);
    expect(await screen.findByText(t('CLUBS.no_join_requests'))).toBeInTheDocument();
  });

  it('approves a request, drops it from the list and refreshes club lists and everything under the club', async () => {
    mockManageReads();
    const resolve = backend(two());
    const approved = vi.fn();
    server.use(
      http.post(`${API}/clubs/${ID}/join-requests/r1/approve`, () => {
        approved();
        resolve('r1');
        return HttpResponse.json({ memberCount: 4 });
      }),
    );
    const { queryClient } = renderWithProviders(<Requests clubId={ID} />);
    const spy = vi.spyOn(queryClient, 'invalidateQueries');
    const user = userEvent.setup();
    await screen.findByText('Katherine Johnson');
    await user.click(screen.getAllByRole('button', { name: t('CLUBS.approve') })[0]!);
    await waitFor(() => expect(screen.queryByText('Katherine Johnson')).not.toBeInTheDocument());
    expect(approved).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Mary Jackson')).toBeInTheDocument();
    const keys = spy.mock.calls.map((c) => JSON.stringify(c[0]?.queryKey));
    expect(keys).toEqual(expect.arrayContaining([JSON.stringify(['clubs']), JSON.stringify(['club', ID])]));
  });

  it('rejects a request', async () => {
    mockManageReads();
    const resolve = backend(two());
    const rejected = vi.fn();
    server.use(
      http.post(`${API}/clubs/${ID}/join-requests/r2/reject`, () => {
        rejected();
        resolve('r2');
        return new HttpResponse(null, { status: 204 });
      }),
    );
    const user = userEvent.setup();
    renderWithProviders(<Requests clubId={ID} />);
    await screen.findByText('Mary Jackson');
    await user.click(screen.getAllByRole('button', { name: t('CLUBS.reject') })[1]!);
    await waitFor(() => expect(screen.queryByText('Mary Jackson')).not.toBeInTheDocument());
    expect(rejected).toHaveBeenCalledTimes(1);
  });

  it('keeps the request and toasts the backend detail when approving fails', async () => {
    mockManageReads({ requests: two() });
    server.use(http.post(`${API}/clubs/${ID}/join-requests/r1/approve`, () => HttpResponse.json({ detail: 'Club is full' }, { status: 409 })));
    const user = userEvent.setup();
    renderWithProviders(<Requests clubId={ID} />);
    await screen.findByText('Katherine Johnson');
    await user.click(screen.getAllByRole('button', { name: t('CLUBS.approve') })[0]!);
    await waitFor(() => expect(toast).toHaveBeenCalledWith('error', 'Club is full'));
    expect(screen.getByText('Katherine Johnson')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: t('CLUBS.approve') })[0]).toBeEnabled();
  });

  it('sends one request for two clicks on the same row, and disables the row while it is in flight', async () => {
    mockManageReads();
    const resolve = backend(two());
    const { open, release } = gate();
    let posts = 0;
    server.use(
      http.post(`${API}/clubs/${ID}/join-requests/r1/approve`, async () => {
        posts += 1;
        await open;
        resolve('r1');
        return HttpResponse.json({ memberCount: 4 });
      }),
    );
    renderWithProviders(<Requests clubId={ID} />);
    await screen.findByText('Katherine Johnson');
    const approve = screen.getAllByRole('button', { name: t('CLUBS.approve') })[0]!;
    await act(async () => {
      fireEvent.click(approve);
      fireEvent.click(approve);
    });
    await waitFor(() => expect(approve).toBeDisabled());
    expect(screen.getAllByRole('button', { name: t('CLUBS.reject') })[0]).toBeDisabled();
    expect(screen.getAllByRole('button', { name: t('CLUBS.approve') })[1]).toBeEnabled();
    release();
    await waitFor(() => expect(screen.queryByText('Katherine Johnson')).not.toBeInTheDocument());
    expect(posts).toBe(1);
  });
});
