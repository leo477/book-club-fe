import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemberList } from '@/features/club-detail/member-list';
import { API, memberJson, pageOf, renderWithProviders, server, setupApiServer } from '@/test/harness';
import { membersKey } from '@/features/club-detail/use-club-detail';
import { capture } from '@/features/organizer/test-support';
import { gate, ID, t } from './test-support';

const toast = vi.hoisted(() => vi.fn());
const hardNavigate = vi.hoisted(() => vi.fn());
vi.mock('@/lib/toast', () => ({ showToast: toast }));
vi.mock('@/lib/navigate', () => ({ hardNavigate, replaceNavigate: vi.fn() }));

setupApiServer();
const backendGone = new Set<string>();
beforeEach(() => {
  toast.mockReset();
  hardNavigate.mockReset();
  backendGone.clear();
});

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

// the viewer 'me' is a non-owner organizer by default; pass 'owner' to view as the club owner
const view = (currentUserId = 'me') => renderWithProviders(<MemberList clubId={ID} isOwner roleControls={{ ownerId: 'owner', currentUserId }} />);
const row = (name: string) => screen.getByText(name).closest('li') as HTMLElement;

describe('MemberList with role controls', () => {
  it('as a non-owner organizer: promote, kick and ban on members only, nothing on any organizer row', async () => {
    serve();
    view();
    await screen.findByText('Olga Owner');
    expect(within(row('Grace Hopper')).getByRole('button', { name: t('CLUB_MANAGE.promote') })).toBeInTheDocument();
    expect(within(row('Grace Hopper')).getByRole('button', { name: new RegExp(t('MEMBERS.kick')) })).toBeInTheDocument();
    expect(within(row('Grace Hopper')).getByRole('button', { name: new RegExp(t('MEMBERS.ban')) })).toBeInTheDocument();
    for (const name of ['Olga Owner', 'Me Self', 'Co Organizer']) expect(within(row(name)).queryByRole('button')).not.toBeInTheDocument();
  });

  it('as the owner: demote, kick and ban on other organizers, nothing on the owner row', async () => {
    serve();
    view('owner');
    await screen.findByText('Olga Owner');
    expect(within(row('Co Organizer')).getByRole('button', { name: t('CLUB_MANAGE.demote') })).toBeInTheDocument();
    expect(within(row('Co Organizer')).getByRole('button', { name: new RegExp(t('MEMBERS.kick')) })).toBeInTheDocument();
    expect(within(row('Co Organizer')).getByRole('button', { name: new RegExp(t('MEMBERS.ban')) })).toBeInTheDocument();
    expect(within(row('Grace Hopper')).getByRole('button', { name: t('CLUB_MANAGE.promote') })).toBeInTheDocument();
    expect(within(row('Olga Owner')).queryByRole('button')).not.toBeInTheDocument();
  });

  it('stays on the page and toasts the owner-only message when the backend answers 403 OWNER_ONLY to a kick', async () => {
    serve();
    server.use(http.delete(`${API}/clubs/${ID}/members/m1`, () => HttpResponse.json({ detail: { error: 'Only the club owner may do this', code: 'OWNER_ONLY' } }, { status: 403 })));
    const user = userEvent.setup();
    view();
    await screen.findByText('Grace Hopper');
    await user.click(within(row('Grace Hopper')).getByRole('button', { name: new RegExp(t('MEMBERS.kick')) }));
    await waitFor(() => expect(toast).toHaveBeenCalledWith('error', t('ERRORS.owner_only_action')));
    await waitFor(() => expect(within(row('Grace Hopper')).getByRole('button', { name: new RegExp(t('MEMBERS.kick')) })).toBeEnabled());
    expect(hardNavigate).not.toHaveBeenCalled();
  });

  it('toasts the owner-only message, without leaving the page, on 403 OWNER_ONLY for a ban and a demote', async () => {
    serve();
    const body = { detail: { error: 'Only the club owner may do this', code: 'OWNER_ONLY' } };
    server.use(
      http.post(`${API}/clubs/${ID}/members/m1/ban`, () => HttpResponse.json(body, { status: 403 })),
      http.patch(`${API}/clubs/${ID}/members/co/role`, () => HttpResponse.json(body, { status: 403 })),
    );
    const user = userEvent.setup();
    view('owner');
    await screen.findByText('Grace Hopper');
    await user.click(within(row('Grace Hopper')).getByRole('button', { name: new RegExp(t('MEMBERS.ban')) }));
    await user.click(screen.getByRole('button', { name: t('MEMBERS.ban_permanent') }));
    await waitFor(() => expect(toast).toHaveBeenCalledTimes(1));
    await user.click(within(row('Co Organizer')).getByRole('button', { name: t('CLUB_MANAGE.demote') }));
    await waitFor(() => expect(toast).toHaveBeenCalledTimes(2));
    expect(toast).toHaveBeenNthCalledWith(1, 'error', t('ERRORS.owner_only_action'));
    expect(toast).toHaveBeenNthCalledWith(2, 'error', t('ERRORS.owner_only_action'));
    expect(hardNavigate).not.toHaveBeenCalled();
    await waitFor(() => expect(within(row('Co Organizer')).getByRole('button', { name: t('CLUB_MANAGE.demote') })).toBeEnabled());
  });

  it('still sends the viewer away on a 403 FORBIDDEN (access lost mid-session)', async () => {
    serve();
    server.use(http.delete(`${API}/clubs/${ID}/members/m1`, () => HttpResponse.json({ detail: { error: 'Forbidden', code: 'FORBIDDEN' } }, { status: 403 })));
    const user = userEvent.setup();
    view();
    await screen.findByText('Grace Hopper');
    await user.click(within(row('Grace Hopper')).getByRole('button', { name: new RegExp(t('MEMBERS.kick')) }));
    await waitFor(() => expect(hardNavigate).toHaveBeenCalledWith('/clubs'));
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
    view('owner');
    await screen.findByText('Grace Hopper');
    await user.click(within(row('Grace Hopper')).getByRole('button', { name: t('CLUB_MANAGE.promote') }));
    await waitFor(() => expect(within(row('Grace Hopper')).getByRole('button', { name: t('CLUB_MANAGE.demote') })).toBeInTheDocument());
    expect(bodies).toEqual([{ role: 'organizer' }]);
    await user.click(within(row('Co Organizer')).getByRole('button', { name: t('CLUB_MANAGE.demote') }));
    await waitFor(() => expect(within(row('Co Organizer')).getByRole('button', { name: t('CLUB_MANAGE.promote') })).toBeInTheDocument());
    expect(demoted).toEqual([{ role: 'member' }]);
  });

  it('shows the new role at once, then puts the old one back and toasts the detail when the change fails', async () => {
    serve();
    const { open, release } = gate();
    server.use(
      http.patch(`${API}/clubs/${ID}/members/m1/role`, async () => {
        await open;
        return HttpResponse.json({ detail: 'Only the owner may do this' }, { status: 400 });
      }),
    );
    const user = userEvent.setup();
    view('owner');
    await screen.findByText('Grace Hopper');
    await user.click(within(row('Grace Hopper')).getByRole('button', { name: t('CLUB_MANAGE.promote') }));
    expect(await within(row('Grace Hopper')).findByRole('button', { name: t('CLUB_MANAGE.demote') })).toBeInTheDocument();
    release();
    await waitFor(() => expect(toast).toHaveBeenCalledWith('error', 'Only the owner may do this'));
    await waitFor(() => expect(within(row('Grace Hopper')).getByRole('button', { name: t('CLUB_MANAGE.promote') })).toBeEnabled());
    expect(within(row('Grace Hopper')).queryByRole('button', { name: t('CLUB_MANAGE.demote') })).not.toBeInTheDocument();
  });

  it('loads the members a page at a time and shows the full count', async () => {
    const urls: string[] = [];
    const all = Array.from({ length: 230 }, (_, i) => memberJson({ userId: `m${i}`, displayName: `Member ${i}` }));
    server.use(
      http.get(`${API}/clubs/${ID}/members`, ({ request }) => {
        urls.push(new URL(request.url).search);
        return pageOf(all, request);
      }),
    );
    const user = userEvent.setup();
    view();
    await screen.findByText('Member 0');
    expect(urls).toEqual(['?skip=0&limit=100']);
    expect(screen.getByRole('heading', { name: /\(230\)/ })).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(100);
    await user.click(screen.getByRole('button', { name: t('PAGINATION.load_more') }));
    await screen.findByText('Member 150');
    await user.click(screen.getByRole('button', { name: t('PAGINATION.load_more') }));
    await screen.findByText('Member 229');
    expect(urls).toEqual(['?skip=0&limit=100', '?skip=100&limit=100', '?skip=200&limit=100']);
    expect(screen.queryByRole('button', { name: t('PAGINATION.load_more') })).not.toBeInTheDocument();
  });

  it('keeps the rows of a later page after a kick and the refetch that follows it', async () => {
    let all = Array.from({ length: 130 }, (_, i) => memberJson({ userId: `m${i}`, displayName: `Member ${i}` }));
    const urls: string[] = [];
    server.use(
      http.get(`${API}/clubs/${ID}/members`, ({ request }) => {
        urls.push(new URL(request.url).search);
        return pageOf(all, request);
      }),
      http.delete(`${API}/clubs/${ID}/members/m1`, () => {
        all = all.filter((m) => m.userId !== 'm1');
        return new HttpResponse(null, { status: 204 });
      }),
    );
    const user = userEvent.setup();
    const { queryClient } = view();
    await screen.findByText('Member 0');
    await user.click(screen.getByRole('button', { name: t('PAGINATION.load_more') }));
    await screen.findByText('Member 129');
    await user.click(within(row('Member 1')).getByRole('button', { name: new RegExp(t('MEMBERS.kick')) }));
    await waitFor(() => expect(screen.queryByText('Member 1')).not.toBeInTheDocument());
    urls.length = 0;
    await act(async () => {
      await queryClient.invalidateQueries({ queryKey: membersKey(ID) });
    });
    expect(urls).toEqual(['?skip=0&limit=100', '?skip=100&limit=100']);
    expect(screen.getByText('Member 129')).toBeInTheDocument();
    expect(screen.queryByText('Member 1')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /\(129\)/ })).toBeInTheDocument();
  });

  it('shows an error and keeps load more available when a page fails', async () => {
    const all = Array.from({ length: 150 }, (_, i) => memberJson({ userId: `m${i}`, displayName: `Member ${i}` }));
    let fail = true;
    server.use(
      http.get(`${API}/clubs/${ID}/members`, ({ request }) => {
        if (fail && new URL(request.url).searchParams.get('skip') === '100') return HttpResponse.json({ detail: 'boom' }, { status: 400 });
        return pageOf(all, request);
      }),
    );
    const user = userEvent.setup();
    view();
    await screen.findByText('Member 0');
    await user.click(screen.getByRole('button', { name: t('PAGINATION.load_more') }));
    expect(await screen.findByText(t('PAGINATION.load_failed'))).toBeInTheDocument();
    fail = false;
    await user.click(screen.getByRole('button', { name: t('PAGINATION.load_more') }));
    await screen.findByText('Member 149');
  });

  it('offers no load more once every member is shown', async () => {
    serve();
    view();
    await screen.findByText('Grace Hopper');
    expect(screen.queryByRole('button', { name: t('PAGINATION.load_more') })).not.toBeInTheDocument();
  });

  it('does not refetch while another member request is open, so a late server-side delete cannot bring the member back', async () => {
    const backend = serve();
    const a = gate();
    const b = gate();
    let reads = 0;
    server.use(
      http.get(`${API}/clubs/${ID}/members`, ({ request }) => {
        reads += 1;
        return HttpResponse.json(roster().filter((m) => !backendGone.has(m.userId)), { headers: { 'x-url': request.url } });
      }),
      http.delete(`${API}/clubs/${ID}/members/m1`, async () => {
        backendGone.add('m1');
        await a.open;
        return new HttpResponse(null, { status: 204 });
      }),
      // the server applies this delete only when its request is released, as with a slow transaction
      http.delete(`${API}/clubs/${ID}/members/m2`, async () => {
        await b.open;
        backendGone.add('m2');
        return new HttpResponse(null, { status: 204 });
      }),
    );
    void backend;
    const user = userEvent.setup();
    view();
    await screen.findByText('Grace Hopper');
    const initialReads = reads;
    await user.click(within(row('Grace Hopper')).getByRole('button', { name: new RegExp(t('MEMBERS.kick')) }));
    await user.click(within(row('Alan Turing')).getByRole('button', { name: new RegExp(t('MEMBERS.kick')) }));
    expect(screen.queryByText('Grace Hopper')).not.toBeInTheDocument();
    expect(screen.queryByText('Alan Turing')).not.toBeInTheDocument();
    a.release();
    await new Promise((r) => setTimeout(r, 100));
    expect(reads).toBe(initialReads);
    expect(screen.queryByText('Alan Turing')).not.toBeInTheDocument();
    b.release();
    await waitFor(() => expect(reads).toBe(initialReads + 1));
    expect(screen.queryByText('Alan Turing')).not.toBeInTheDocument();
    expect(screen.queryByText('Grace Hopper')).not.toBeInTheDocument();
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

describe('club actions across components', () => {
  it('does not bring a kicked member back when a join request is approved while the kick is pending', async () => {
    const { Requests } = await import('./requests');
    const hold = gate();
    let reads = 0;
    server.use(
      http.get(`${API}/clubs/${ID}/members`, () => {
        reads += 1;
        return HttpResponse.json(roster().filter((m) => !backendGone.has(m.userId)));
      }),
      // the server applies the kick only when its request is released
      http.delete(`${API}/clubs/${ID}/members/m1`, async () => {
        await hold.open;
        backendGone.add('m1');
        return new HttpResponse(null, { status: 204 });
      }),
      http.get(`${API}/clubs/${ID}/join-requests`, () =>
        HttpResponse.json([{ userId: 'r1', displayName: 'Katherine Johnson', avatarUrl: null, status: 'pending', source: 'link', createdAt: '2099-01-01T00:00:00Z' }]),
      ),
      http.post(`${API}/clubs/${ID}/join-requests/r1/approve`, () => HttpResponse.json({ memberCount: 6 })),
    );
    const user = userEvent.setup();
    renderWithProviders(
      <>
        <MemberList clubId={ID} isOwner roleControls={{ ownerId: 'owner', currentUserId: 'me' }} />
        <Requests clubId={ID} />
      </>,
    );
    await screen.findByText('Grace Hopper');
    await screen.findByText('Katherine Johnson');
    const before = reads;
    await user.click(within(row('Grace Hopper')).getByRole('button', { name: new RegExp(t('MEMBERS.kick')) }));
    await user.click(screen.getByRole('button', { name: t('CLUBS.approve') }));
    await waitFor(() => expect(screen.queryByText('Katherine Johnson')).not.toBeInTheDocument());
    await new Promise((r) => setTimeout(r, 100));
    expect(reads).toBe(before);
    expect(screen.queryByText('Grace Hopper')).not.toBeInTheDocument();
    hold.release();
    await waitFor(() => expect(reads).toBe(before + 1));
    expect(screen.queryByText('Grace Hopper')).not.toBeInTheDocument();
  });
});
