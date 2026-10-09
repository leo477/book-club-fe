import { act, screen, waitFor } from '@testing-library/react';
import { HttpResponse, delay, http } from 'msw';
import { useEffect, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { API, clubJson, messages, renderWithProviders, server, setupApiServer, userJson } from '@/test/harness';
import { ClubEventsInteractive } from './club-events';
import { sessionKey } from '@/features/clubs/use-session';
import { JoinCta, ManagePanel } from './membership';
import { membershipKey } from './use-club-detail';

vi.mock('@/lib/toast', () => ({ showToast: vi.fn() }));
vi.mock('@/lib/navigate', () => ({ hardNavigate: vi.fn() }));

setupApiServer();

const club = { id: 'c1', organizerId: 'o1' };
const manageLabel = (messages.uk['CLUB_MANAGE.manage_button'] ?? '').trim();
const createLabel = messages.uk['CLUB_DETAIL.create_event'] ?? '';

function LateIsland({ withJoin = false, expose }: { withJoin?: boolean; expose: (show: () => void) => void }) {
  const [show, setShow] = useState(false);
  useEffect(() => expose(() => setShow(true)), [expose]);
  return (
    <>
      <ManagePanel club={club} />
      {withJoin ? <JoinCta club={club} /> : null}
      {show ? <ClubEventsInteractive club={club} initialEvents={[]} /> : null}
    </>
  );
}

function mockApi({ user = 'u1', role, wait = 0 }: { user?: string | null; role: string | null; wait?: number }) {
  const hits = { membership: 0 };
  server.use(
    http.get(`${API}/auth/session-status`, () => HttpResponse.json({ hasSession: user !== null })),
    http.get(`${API}/auth/me`, () => HttpResponse.json(userJson({ id: user }))),
    http.get(`${API}/clubs/my`, () => HttpResponse.json([clubJson({ id: 'c1' })])),
    http.get(`${API}/clubs/c1/events`, () => HttpResponse.json([])),
    http.get(`${API}/clubs/c1/my-membership`, async () => {
      hits.membership += 1;
      await delay(wait);
      return HttpResponse.json({ isMember: role !== null, role, joinRequestStatus: 'none' });
    }),
  );
  return hits;
}

describe('canManage links', () => {
  it('shows placeholders while the membership loads, then the links for a co-organizer', async () => {
    mockApi({ role: 'organizer', wait: 80 });
    renderWithProviders(
      <>
        <ManagePanel club={club} />
        <ClubEventsInteractive club={club} initialEvents={[]} />
      </>,
    );
    await screen.findByTestId('manage-placeholder');
    expect(screen.getByTestId('create-event-placeholder')).toBeInTheDocument();
    expect(screen.queryByText(createLabel)).toBeNull();
    expect(await screen.findByText(createLabel)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: new RegExp(manageLabel) })).toBeInTheDocument();
    expect(screen.queryByTestId('manage-placeholder')).toBeNull();
    expect(screen.queryByTestId('create-event-placeholder')).toBeNull();
  });

  it('hides the links when a cached organizer role is refetched as member', async () => {
    const hits = mockApi({ role: 'member', wait: 60 });
    const view = renderWithProviders(<ManagePanel club={club} />, 'uk', (qc) =>
      qc.setQueryData(membershipKey('c1'), { isMember: true, role: 'organizer', joinRequestStatus: 'none' }),
    );
    await waitFor(() => expect(view.queryClient.getQueryState(sessionKey)?.status).toBe('success'));
    const link = await screen.findByRole('link', { name: new RegExp(manageLabel) });
    expect(link).toBeInTheDocument();
    await waitFor(() => expect(hits.membership).toBe(1));
    await waitFor(() => expect(screen.queryByRole('link', { name: new RegExp(manageLabel) })).toBeNull());
    expect(view.container).toBeEmptyDOMElement();
    expect(hits.membership).toBe(1);
  });

  it('re-checks a seeded organizer role on mount even when the session is already cached', async () => {
    const hits = mockApi({ role: 'member', wait: 60 });
    const view = renderWithProviders(<ManagePanel club={club} />, 'uk', (qc) => {
      qc.setQueryData(sessionKey, userJson({ id: 'u1' }));
      qc.setQueryData(membershipKey('c1'), { isMember: true, role: 'organizer', joinRequestStatus: 'none' });
    });
    expect(screen.getByRole('link', { name: new RegExp(manageLabel) })).toBeInTheDocument();
    await waitFor(() => expect(hits.membership).toBe(1));
    expect(screen.getByRole('link', { name: new RegExp(manageLabel) })).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByRole('link', { name: new RegExp(manageLabel) })).toBeNull());
    expect(view.container).toBeEmptyDOMElement();
    expect(hits.membership).toBe(1);
  });

  it('makes a single membership request across the panel, the join prompt and the create-event island', async () => {
    const hits = mockApi({ role: 'organizer', wait: 30 });
    renderWithProviders(
      <>
        <ManagePanel club={club} />
        <JoinCta club={club} />
        <ClubEventsInteractive club={club} initialEvents={[]} />
      </>,
    );
    expect(await screen.findByText(createLabel)).toBeInTheDocument();
    expect(await screen.findByRole('link', { name: new RegExp(manageLabel) })).toBeInTheDocument();
    await new Promise((r) => setTimeout(r, 100));
    expect(hits.membership).toBe(1);
  });

  it('makes no membership request and shows no placeholder for guests', async () => {
    const guest = mockApi({ user: null, role: null });
    const view = renderWithProviders(<ManagePanel club={club} />);
    await waitFor(() => expect(view.queryClient.getQueryState(sessionKey)?.status).toBe('success'));
    await waitFor(() => expect(view.container).toBeEmptyDOMElement());
    await waitFor(() => expect(view.queryClient.isFetching()).toBe(0));
    expect(guest.membership).toBe(0);
  });

  it('makes one membership request when the island mounts while the panel request is in flight', async () => {
    const hits = mockApi({ role: 'organizer', wait: 100 });
    let showIsland = () => {};
    const view = renderWithProviders(<LateIsland expose={(show) => (showIsland = show)} />);
    await waitFor(() => expect(hits.membership).toBe(1));
    expect(view.queryClient.isFetching()).toBe(1);
    act(() => showIsland());
    expect(await screen.findByText(createLabel)).toBeInTheDocument();
    await waitFor(() => expect(view.queryClient.isFetching()).toBe(0));
    expect(hits.membership).toBe(1);
  });

  it('makes one membership request when the island mounts after the request settled', async () => {
    const hits = mockApi({ role: 'organizer' });
    let showIsland = () => {};
    const view = renderWithProviders(<LateIsland withJoin expose={(show) => (showIsland = show)} />);
    expect(await screen.findByRole('link', { name: new RegExp(manageLabel) })).toBeInTheDocument();
    await waitFor(() => expect(view.queryClient.isFetching()).toBe(0));
    expect(hits.membership).toBe(1);
    act(() => showIsland());
    expect(await screen.findByText(createLabel)).toBeInTheDocument();
    await waitFor(() => expect(view.queryClient.isFetching()).toBe(0));
    expect(hits.membership).toBe(1);
  });

  it('makes no membership request and shows no placeholder for the owner', async () => {
    const owner = mockApi({ user: 'o1', role: 'organizer' });
    renderWithProviders(<ManagePanel club={club} />);
    expect(await screen.findByRole('link', { name: new RegExp(manageLabel) })).toBeInTheDocument();
    expect(screen.queryByTestId('manage-placeholder')).toBeNull();
    expect(owner.membership).toBe(0);
  });
});
