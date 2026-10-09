import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemberList } from '@/features/club-detail/member-list';
import { API, memberJson, renderWithProviders, server, setupApiServer } from '@/test/harness';
import { capture } from '@/features/organizer/test-support';
import { gate, ID, t } from './test-support';

const toast = vi.hoisted(() => vi.fn());
vi.mock('@/lib/toast', () => ({ showToast: toast }));

setupApiServer();
beforeEach(() => toast.mockReset());

const roster = () => [
  memberJson({ userId: 'owner', displayName: 'Olga Owner', role: 'organizer' }),
  memberJson({ userId: 'me', displayName: 'Me Self', role: 'organizer' }),
  memberJson({ userId: 'co', displayName: 'Co Organizer', role: 'organizer' }),
  memberJson({ userId: 'm1', displayName: 'Grace Hopper' }),
  memberJson({ userId: 'm2', displayName: 'Alan Turing' }),
];

function serve(members = roster()) {
  let list = members;
  server.use(http.get(`${API}/clubs/${ID}/members`, () => HttpResponse.json(list)));
  return {
    set: (next: typeof list) => {
      list = next;
    },
    drop: (userId: string) => {
      list = list.filter((m) => m.userId !== userId);
    },
    role: (userId: string, role: string) => {
      list = list.map((m) => (m.userId === userId ? { ...m, role } : m));
    },
  };
}

const view = () => renderWithProviders(<MemberList clubId={ID} isOwner roleControls={{ ownerId: 'owner', currentUserId: 'me' }} />);
const row = (name: string) => screen.getByText(name).closest('li') as HTMLElement;

describe('MemberList with role controls', () => {
  it('offers promote on members, demote only on other organizers than the owner and the viewer, kick and ban only on members', async () => {
    serve();
    view();
    await screen.findByText('Olga Owner');
    expect(within(row('Grace Hopper')).getByRole('button', { name: t('CLUB_MANAGE.promote') })).toBeInTheDocument();
    expect(within(row('Grace Hopper')).getByRole('button', { name: new RegExp(t('MEMBERS.kick')) })).toBeInTheDocument();
    expect(within(row('Co Organizer')).getByRole('button', { name: t('CLUB_MANAGE.demote') })).toBeInTheDocument();
    expect(within(row('Olga Owner')).queryByRole('button')).not.toBeInTheDocument();
    expect(within(row('Me Self')).queryByRole('button')).not.toBeInTheDocument();
    expect(within(row('Co Organizer')).queryByRole('button', { name: new RegExp(t('MEMBERS.kick')) })).not.toBeInTheDocument();
  });

  it('shows no role controls without roleControls, and no moderation to a non-owner', async () => {
    serve();
    renderWithProviders(<MemberList clubId={ID} isOwner={false} />);
    await screen.findByText('Olga Owner');
    expect(screen.queryByRole('button', { name: t('CLUB_MANAGE.promote') })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: new RegExp(t('MEMBERS.kick')) })).not.toBeInTheDocument();
  });

  it('promotes a member and demotes an organizer through PATCH role', async () => {
    const backend = serve();
    const bodies = capture('patch', `/clubs/${ID}/members/m1/role`, () => {
      backend.role('m1', 'organizer');
      return HttpResponse.json(memberJson({ userId: 'm1', role: 'organizer' }));
    });
    const demoted = capture('patch', `/clubs/${ID}/members/co/role`, () => {
      backend.role('co', 'member');
      return HttpResponse.json(memberJson({ userId: 'co' }));
    });
    const user = userEvent.setup();
    view();
    await screen.findByText('Grace Hopper');
    await user.click(within(row('Grace Hopper')).getByRole('button', { name: t('CLUB_MANAGE.promote') }));
    await waitFor(() => expect(within(row('Grace Hopper')).getByRole('button', { name: t('CLUB_MANAGE.demote') })).toBeInTheDocument());
    expect(bodies).toEqual([{ role: 'organizer' }]);
    await user.click(within(row('Co Organizer')).getByRole('button', { name: t('CLUB_MANAGE.demote') }));
    await waitFor(() => expect(within(row('Co Organizer')).getByRole('button', { name: t('CLUB_MANAGE.promote') })).toBeInTheDocument());
    expect(demoted).toEqual([{ role: 'member' }]);
  });

  it('puts the old role back and toasts the backend detail when a role change fails', async () => {
    serve();
    server.use(http.patch(`${API}/clubs/${ID}/members/m1/role`, () => HttpResponse.json({ detail: 'Only the owner may do this' }, { status: 400 })));
    const user = userEvent.setup();
    view();
    await screen.findByText('Grace Hopper');
    await user.click(within(row('Grace Hopper')).getByRole('button', { name: t('CLUB_MANAGE.promote') }));
    await waitFor(() => expect(toast).toHaveBeenCalledWith('error', 'Only the owner may do this'));
    expect(within(row('Grace Hopper')).getByRole('button', { name: t('CLUB_MANAGE.promote') })).toBeEnabled();
  });

  it('kicks at once without a confirmation step', async () => {
    const backend = serve();
    const kicked = vi.fn();
    server.use(
      http.delete(`${API}/clubs/${ID}/members/m1`, () => {
        kicked();
        backend.drop('m1');
        return new HttpResponse(null, { status: 204 });
      }),
    );
    const user = userEvent.setup();
    view();
    await screen.findByText('Grace Hopper');
    await user.click(within(row('Grace Hopper')).getByRole('button', { name: new RegExp(t('MEMBERS.kick')) }));
    await waitFor(() => expect(screen.queryByText('Grace Hopper')).not.toBeInTheDocument());
    expect(kicked).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['MEMBERS.ban_1', 1],
    ['MEMBERS.ban_3', 3],
    ['MEMBERS.ban_5', 5],
    ['MEMBERS.ban_permanent', 'permanent'],
  ])('bans for the chosen duration (%s)', async (label, duration) => {
    const backend = serve();
    const bodies = capture('post', `/clubs/${ID}/members/m2/ban`, () => {
      backend.drop('m2');
      return HttpResponse.json({ userId: 'm2', clubId: ID, bannedAt: '2099-01-01T00:00:00Z', duration, bannedBy: 'me' });
    });
    const user = userEvent.setup();
    view();
    await screen.findByText('Alan Turing');
    await user.click(within(row('Alan Turing')).getByRole('button', { name: new RegExp(t('MEMBERS.ban')) }));
    await user.click(screen.getByRole('button', { name: t(label) }));
    await waitFor(() => expect(screen.queryByText('Alan Turing')).not.toBeInTheDocument());
    expect(bodies).toEqual([{ duration }]);
  });

  it('opening the ban menu alone changes nothing', async () => {
    serve();
    const banned = vi.fn();
    server.use(http.post(`${API}/clubs/${ID}/members/m2/ban`, () => (banned(), HttpResponse.json({}))));
    const user = userEvent.setup();
    view();
    await screen.findByText('Alan Turing');
    await user.click(within(row('Alan Turing')).getByRole('button', { name: new RegExp(t('MEMBERS.ban')) }));
    expect(screen.getByRole('button', { name: t('MEMBERS.ban_permanent') })).toBeInTheDocument();
    expect(banned).not.toHaveBeenCalled();
    expect(screen.getByText('Alan Turing')).toBeInTheDocument();
  });

  it('restores a member whose kick failed at the same position', async () => {
    serve();
    server.use(http.delete(`${API}/clubs/${ID}/members/m1`, () => HttpResponse.json({ detail: 'nope' }, { status: 403 })));
    const user = userEvent.setup();
    view();
    await screen.findByText('Grace Hopper');
    await user.click(within(row('Grace Hopper')).getByRole('button', { name: new RegExp(t('MEMBERS.kick')) }));
    await waitFor(() => expect(toast).toHaveBeenCalledWith('error', 'nope'));
    const names = screen.getAllByRole('listitem').map((li) => li.querySelector('p')?.textContent);
    expect(names).toEqual(['Olga Owner', 'Me Self', 'Co Organizer', 'Grace Hopper', 'Alan Turing']);
  });

  it('does not bring back an earlier kick when a later one fails', async () => {
    const backend = serve();
    const first = gate();
    server.use(
      http.delete(`${API}/clubs/${ID}/members/m1`, async () => {
        backend.drop('m1');
        await first.open;
        return new HttpResponse(null, { status: 204 });
      }),
      http.delete(`${API}/clubs/${ID}/members/m2`, () => HttpResponse.json({ detail: 'nope' }, { status: 403 })),
    );
    const user = userEvent.setup();
    view();
    await screen.findByText('Grace Hopper');
    await user.click(within(row('Grace Hopper')).getByRole('button', { name: new RegExp(t('MEMBERS.kick')) }));
    await user.click(within(row('Alan Turing')).getByRole('button', { name: new RegExp(t('MEMBERS.kick')) }));
    await waitFor(() => expect(toast).toHaveBeenCalledWith('error', 'nope'));
    expect(screen.getByText('Alan Turing')).toBeInTheDocument();
    expect(screen.queryByText('Grace Hopper')).not.toBeInTheDocument();
    first.release();
    await waitFor(() => expect(screen.queryByText('Grace Hopper')).not.toBeInTheDocument());
  });

  it('sends one kick for two clicks before the button re-renders', async () => {
    const backend = serve();
    const { open, release } = gate();
    let calls = 0;
    server.use(
      http.delete(`${API}/clubs/${ID}/members/m1`, async () => {
        calls += 1;
        await open;
        backend.drop('m1');
        return new HttpResponse(null, { status: 204 });
      }),
    );
    view();
    await screen.findByText('Grace Hopper');
    const kick = within(row('Grace Hopper')).getByRole('button', { name: new RegExp(t('MEMBERS.kick')) });
    await act(async () => {
      fireEvent.click(kick);
      fireEvent.click(kick);
    });
    release();
    await waitFor(() => expect(screen.queryByText('Grace Hopper')).not.toBeInTheDocument());
    expect(calls).toBe(1);
  });
});
