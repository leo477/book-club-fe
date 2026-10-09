import { screen, waitFor } from '@testing-library/react';
import { HttpResponse, delay, http } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { API, clubJson, messages, renderWithProviders, server, setupApiServer, userJson } from '@/test/harness';
import { ClubEventsInteractive } from './club-events';
import { ManagePanel } from './membership';
import { membershipKey } from './use-club-detail';

vi.mock('@/lib/toast', () => ({ showToast: vi.fn() }));
vi.mock('@/lib/navigate', () => ({ hardNavigate: vi.fn() }));

setupApiServer();

const club = { id: 'c1', organizerId: 'o1' };
const manageLabel = (messages.uk['CLUB_MANAGE.manage_button'] ?? '').trim();
const createLabel = messages.uk['CLUB_DETAIL.create_event'] ?? '';

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
    const hits = mockApi({ role: 'member', wait: 40 });
    const view = renderWithProviders(<ManagePanel club={club} />);
    view.queryClient.setQueryData(membershipKey('c1'), { isMember: true, role: 'organizer', joinRequestStatus: 'none' });
    await waitFor(() => expect(hits.membership).toBe(1));
    await waitFor(() => expect(screen.queryByRole('link', { name: new RegExp(manageLabel) })).toBeNull());
    expect(view.container).toBeEmptyDOMElement();
  });

  it('makes no membership request and shows no placeholder for guests', async () => {
    const guest = mockApi({ user: null, role: null });
    const first = renderWithProviders(<ManagePanel club={club} />);
    await new Promise((r) => setTimeout(r, 40));
    expect(first.container).toBeEmptyDOMElement();
    expect(guest.membership).toBe(0);
  });

  it('makes no membership request and shows no placeholder for the owner', async () => {
    const owner = mockApi({ user: 'o1', role: 'organizer' });
    renderWithProviders(<ManagePanel club={club} />);
    expect(await screen.findByRole('link', { name: new RegExp(manageLabel) })).toBeInTheDocument();
    expect(screen.queryByTestId('manage-placeholder')).toBeNull();
    expect(owner.membership).toBe(0);
  });
});
