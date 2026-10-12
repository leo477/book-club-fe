import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { t } from '@/features/club-manage/test-support';
import { SHELL_CHAT_WIDGET } from '@/strangler/flags';
import { StranglerProvider } from '@/strangler/context';
import { API, renderWithProviders, server, setupApiServer } from '@/test/harness';
import { ChatProvider, RESUME_RECONNECT_MS } from './chat-provider';
import { ChatSlot } from './chat-slot';
import { FakeWebSocket, ME, ROOM, ROOM_2, mockChat, msg, sockets } from './test-support';

const nav = vi.hoisted(() => ({ pathname: '/clubs', toast: vi.fn(), beep: vi.fn(), disposed: vi.fn(), hard: vi.fn() }));
vi.mock('next/navigation', () => ({ usePathname: () => nav.pathname, useRouter: () => ({ push: vi.fn(), replace: vi.fn() }) }));
vi.mock('@/lib/navigate', () => ({ hardNavigate: nav.hard, replaceNavigate: vi.fn() }));
vi.mock('@/lib/toast', () => ({ showToast: nav.toast }));
vi.mock('@book-club/api-client/ws', async (importActual) => {
  const actual = await importActual<typeof import('@book-club/api-client/ws')>();
  return { ...actual, createChatSocket: (o: Parameters<typeof actual.createChatSocket>[0]) => actual.createChatSocket({ ...o, baseDelayMs: 5, maxDelayMs: 20 }) };
});
vi.mock('./chat-audio-alert', () => ({ createChatAudioAlert: () => ({ playBeep: nav.beep, dispose: nav.disposed }) }));

setupApiServer();
beforeEach(() => {
  FakeWebSocket.reset();
  vi.stubGlobal('WebSocket', FakeWebSocket);
  vi.stubEnv('NEXT_PUBLIC_WS_URL', 'wss://book-club-be.onrender.com/api/v1');
  nav.hard.mockReset();
  nav.pathname = '/clubs';
  nav.toast.mockReset();
  nav.beep.mockReset();
});

const renderWidget = (flag = true) =>
  renderWithProviders(
    <StranglerProvider value={flag ? [SHELL_CHAT_WIDGET] : []}>
      <ChatProvider>
        <ChatSlot />
      </ChatProvider>
    </StranglerProvider>,
  );

async function connected(index = 0) {
  await waitFor(() => expect(sockets()).toHaveLength(index + 1));
  const socket = sockets()[index]!;
  await waitFor(() => expect(socket.readyState).toBe(0));
  act(() => socket.accept());
  return socket;
}

const fab = () => screen.findByRole('button', { name: t('CHAT.open') });
const unreadLabel = (n: number) => t('CHAT.open_unread').replace('{count}', String(n));

describe('ChatSlot', () => {
  it('with the flag off keeps the R5 link to /chats and opens nothing', async () => {
    const mock = mockChat();
    renderWidget(false);
    expect(await screen.findByRole('link', { name: t('CHAT.open') })).toHaveAttribute('href', '/chats');
    await new Promise((r) => setTimeout(r, 50));
    expect(sockets()).toHaveLength(0);
    expect(mock.tickets.n).toBe(0);
  });

  it('renders nothing for a guest', async () => {
    server.use(http.get(`${API}/auth/session-status`, () => HttpResponse.json({ hasSession: false })));
    const { container } = renderWidget();
    await new Promise((r) => setTimeout(r, 50));
    expect(container).toBeEmptyDOMElement();
    expect(sockets()).toHaveLength(0);
  });

  it('is hidden on a club page and on /chats', async () => {
    mockChat();
    nav.pathname = '/clubs/3f2b8c1e-9a4d-4e7b-8c5f-1a2b3c4d5e6f';
    const { unmount } = renderWidget();
    await connected();
    expect(screen.queryByRole('button', { name: t('CHAT.open') })).not.toBeInTheDocument();
    unmount();
    nav.pathname = '/chats';
    renderWidget();
    await new Promise((r) => setTimeout(r, 50));
    expect(screen.queryByRole('button', { name: t('CHAT.open') })).not.toBeInTheDocument();
  });
});

describe('ChatWidget connection', () => {
  it('fetches a ticket, opens the room socket on the backend, and authenticates with the ticket as the first frame', async () => {
    const mock = mockChat();
    renderWidget();
    const socket = await connected();
    expect(socket.url).toBe(`wss://book-club-be.onrender.com/api/v1/chat/rooms/${ROOM}`);
    expect(socket.sent[0]).toEqual({ type: 'auth', ticket: 'ticket-1' });
    expect(mock.tickets.n).toBe(1);
  });

  it('closes the socket and the audio alert when the shell unmounts, and again leaks nothing on a room switch', async () => {
    mockChat({
      rooms: [
        { id: ROOM, name: 'General' },
        { id: ROOM_2, name: 'Plot talk' },
      ],
    });
    const user = userEvent.setup();
    const { unmount } = renderWidget();
    const first = await connected();
    await user.click(await fab());
    await user.click(await screen.findByRole('button', { name: t('CHAT.back') }));
    await user.click(await screen.findByRole('button', { name: "Plot talk" }));
    const second = await connected();
    expect(first.closed).toBe(true);
    expect(second.url).toContain(ROOM_2);
    expect(sockets()).toHaveLength(1);
    unmount();
    expect(sockets()).toHaveLength(0);
    expect(nav.disposed).toHaveBeenCalled();
  });

  it('reconnects with a brand-new ticket when the browser comes back online', async () => {
    const mock = mockChat();
    renderWidget();
    const first = await connected();
    act(() => void window.dispatchEvent(new Event('online')));
    await waitFor(() => expect(first.closed).toBe(true));
    await waitFor(() => expect(sockets()).toHaveLength(1));
    const second = sockets()[0]!;
    await waitFor(() => expect(second.readyState).toBe(0));
    expect(second).not.toBe(first);
    expect(mock.tickets.n).toBe(2);
    act(() => second.accept());
    expect(second.sent[0]).toEqual({ type: 'auth', ticket: 'ticket-2' });
  });

  it('reconnects after a long tab sleep but not after a short hide', async () => {
    const mock = mockChat();
    renderWidget();
    const first = await connected();
    let hidden = false;
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => hidden });
    const now = vi.spyOn(Date, 'now');
    const flip = (value: boolean, at: number) => {
      hidden = value;
      now.mockReturnValue(at);
      act(() => void document.dispatchEvent(new Event('visibilitychange')));
    };

    flip(true, 1_000);
    flip(false, 1_000 + RESUME_RECONNECT_MS - 1);
    await new Promise((r) => setTimeout(r, 50));
    expect(first.closed).toBe(false);
    expect(mock.tickets.n).toBe(1);

    flip(true, 100_000);
    flip(false, 100_000 + RESUME_RECONNECT_MS + 1);
    await waitFor(() => expect(first.closed).toBe(true));
    await waitFor(() => expect(mock.tickets.n).toBe(2));
    now.mockRestore();
    delete (document as { hidden?: boolean }).hidden;
  });

  it('retries with a new ticket after the server drops the connection, then fills the gap it missed', async () => {
    const mock = mockChat({ messages: { [ROOM]: [msg('m1', 'before the drop')] } });
    const user = userEvent.setup();
    renderWidget();
    const first = await connected();
    await user.click(await fab());
    expect(await screen.findByText('before the drop')).toBeInTheDocument();

    mock.messageFetches.length = 0;
    server.use(http.get(`${API}/chat/rooms/${ROOM}/messages`, () => HttpResponse.json([msg('m1', 'before the drop'), msg('m2', 'sent while offline')])));
    act(() => first.drop());
    await waitFor(() => expect(mock.tickets.n).toBe(2), { timeout: 3_000 });
    await waitFor(() => expect(sockets()).toHaveLength(1));
    const second = sockets()[0]!;
    await waitFor(() => expect(second.readyState).toBe(0));
    act(() => second.accept());
    expect(await screen.findByText('sent while offline')).toBeInTheDocument();
    expect(screen.getAllByText('before the drop')).toHaveLength(1);
  });
});

describe('ChatWidget failures', () => {
  it('stops quietly on a 403 ticket: no socket, no redirect', async () => {
    mockChat();
    server.use(http.post(`${API}/auth/ws-ticket`, () => HttpResponse.json({ detail: 'Forbidden' }, { status: 403 })));
    renderWidget();
    await fab();
    await new Promise((r) => setTimeout(r, 150));
    expect(sockets()).toHaveLength(0);
    expect(nav.hard).not.toHaveBeenCalled();
  });

  it('ignores a late frame from the socket of the room that was left, and uses a fresh ticket for the next', async () => {
    const mock = mockChat({ rooms: [{ id: ROOM, name: 'General' }, { id: ROOM_2, name: 'Plot talk' }] });
    const user = userEvent.setup();
    renderWidget();
    const old = await connected();
    await user.click(await fab());
    await user.click(await screen.findByRole('button', { name: t('CHAT.back') }));
    await user.click(await screen.findByRole('button', { name: 'Plot talk' }));
    await connected();
    act(() => old.push({ type: 'message', payload: msg('late', 'from the old room') }));
    await new Promise((r) => setTimeout(r, 30));
    expect(screen.queryByText('from the old room')).not.toBeInTheDocument();
    expect(mock.tickets.n).toBe(2);
    expect(sockets()[0]?.sent[0]).toEqual({ type: 'auth', ticket: 'ticket-2' });
  });

  it('shows a retry once the client gave up, and the retry reconnects', async () => {
    const mock = mockChat();
    const user = userEvent.setup();
    renderWidget();
    await user.click(await fab());
    for (let round = 1; round <= 6; round++) {
      await waitFor(() => expect(sockets()).toHaveLength(1), { timeout: 5_000 });
      const socket = sockets()[0]!;
      await waitFor(() => expect(socket.readyState).toBe(0));
      act(() => socket.drop());
    }
    const retry = await screen.findByRole('button', { name: t('CHAT.retry') }, { timeout: 5_000 });
    const before = mock.tickets.n;
    await user.click(retry);
    await waitFor(() => expect(mock.tickets.n).toBe(before + 1));
    await waitFor(() => expect(sockets()).toHaveLength(1));
  });
});

describe('ChatWidget unread and live messages', () => {
  it('shows the server unread total on the button, capped at 9+', async () => {
    mockChat({
      rooms: [
        { id: ROOM, name: 'General' },
        { id: ROOM_2, name: 'Plot talk' },
      ],
      unread: { [ROOM]: { unread_count: 4, last_read_message_id: null }, [ROOM_2]: { unread_count: 3, last_read_message_id: null } },
    });
    renderWidget();
    const button = await screen.findByRole('button', { name: unreadLabel(7) });
    expect(button).toHaveTextContent('7');
  });

  it('counts a message from someone else while closed, beeps once, and clears the badge when opened', async () => {
    mockChat({ messages: { [ROOM]: [msg('m1', 'hello')] } });
    const user = userEvent.setup();
    renderWidget();
    const socket = await connected();
    await user.click(await fab());
    await screen.findByText('hello');
    await user.click(screen.getAllByRole('button', { name: t('CHAT.close') })[0]!);

    act(() => socket.push({ type: 'message', payload: msg('m2', 'ping') }));
    act(() => socket.push({ type: 'message', payload: msg('m2', 'ping') }));
    expect(await screen.findByRole('button', { name: unreadLabel(1) })).toHaveTextContent('1');
    expect(nav.beep).toHaveBeenCalledTimes(1);

    await user.click(await screen.findByRole('button', { name: unreadLabel(1) }));
    await waitFor(() => expect(screen.queryByRole('button', { name: unreadLabel(1) })).not.toBeInTheDocument());
    expect(await screen.findByText('ping')).toBeInTheDocument();
  });

  it('counts and beeps once for a message that arrives before the widget was ever opened (no cached history)', async () => {
    mockChat();
    renderWidget();
    const socket = await connected();
    act(() => socket.push({ type: 'message', payload: msg('m5', 'while nobody looked') }));
    act(() => socket.push({ type: 'message', payload: msg('m5', 'while nobody looked') }));
    expect(await screen.findByRole('button', { name: unreadLabel(1) })).toBeInTheDocument();
    expect(nav.beep).toHaveBeenCalledTimes(1);
  });

  it('never counts or beeps for the viewer own message', async () => {
    mockChat();
    renderWidget();
    const socket = await connected();
    act(() => socket.push({ type: 'message', payload: msg('m9', 'mine', { senderId: ME }) }));
    await new Promise((r) => setTimeout(r, 30));
    expect(nav.beep).not.toHaveBeenCalled();
  });

  it('renders message text as plain text, never as markup', async () => {
    const evil = '<img src=x onerror="window.__pwned=1"><script>window.__pwned=1</script><b>bold</b>';
    mockChat({ messages: { [ROOM]: [msg('m1', evil)] } });
    const user = userEvent.setup();
    renderWidget();
    await user.click(await fab());
    const log = await screen.findByRole('log');
    expect(await within(log).findByText(evil)).toBeInTheDocument();
    expect(log.querySelector('img, script, b')).toBeNull();
    expect((window as { __pwned?: number }).__pwned).toBeUndefined();
  });

  it('shows the online dot for a sender the presence snapshot marks online', async () => {
    mockChat({ messages: { [ROOM]: [msg('m1', 'hi', { senderId: 'u2' })] } });
    const user = userEvent.setup();
    renderWidget();
    const socket = await connected();
    act(() => socket.push({ type: 'presence_snapshot', payload: [{ userId: 'u2', status: 'online' }] }));
    await user.click(await fab());
    expect(await screen.findByRole('img', { name: t('CHAT.online') })).toBeInTheDocument();
    act(() => socket.push({ type: 'presence', payload: { userId: 'u2', status: 'offline' } }));
    await waitFor(() => expect(screen.queryByRole('img', { name: t('CHAT.online') })).not.toBeInTheDocument());
  });
});

describe('ChatWidget sending', () => {
  it('sends on Enter, shows it at once, keeps a single copy when the socket echoes it, and tells the server it is read', async () => {
    const mock = mockChat({ messages: { [ROOM]: [msg('m1', 'earlier')] } });
    const user = userEvent.setup();
    renderWidget();
    const socket = await connected();
    await user.click(await fab());
    await screen.findByText('earlier');
    await user.type(screen.getByRole('textbox', { name: t('CHAT.placeholder') }), 'hello there{Enter}');
    expect(await screen.findByText('hello there')).toBeInTheDocument();
    await waitFor(() => expect(mock.sends).toEqual([{ roomId: ROOM, text: 'hello there' }]));
    act(() => socket.push({ type: 'message', payload: msg('saved-1', 'hello there', { senderId: ME }) }));
    await waitFor(() => expect(screen.getAllByText('hello there')).toHaveLength(1));
    expect(screen.getByRole('textbox')).toHaveValue('');
    await waitFor(() => expect(mock.reads.some((r) => r.lastReadMessageId === 'm1')).toBe(true));
  });

  it('removes the optimistic message and toasts when the send fails; a blank draft is not sent', async () => {
    mockChat();
    server.use(http.post(`${API}/chat/rooms/${ROOM}/messages`, () => HttpResponse.json({ detail: 'You are banned from this room' }, { status: 403 })));
    const user = userEvent.setup();
    renderWidget();
    await user.click(await fab());
    const input = await screen.findByRole('textbox', { name: t('CHAT.placeholder') });
    expect(screen.getByRole('button', { name: t('CHAT.send') })).toBeDisabled();
    await user.type(input, '   {Enter}');
    expect(screen.queryByText('   ')).not.toBeInTheDocument();
    await user.type(input, 'nope{Enter}');
    await waitFor(() => expect(nav.toast).toHaveBeenCalledWith('error', 'You are banned from this room'));
    expect(screen.queryByText('nope')).not.toBeInTheDocument();
  });
});

describe('ChatWidget panel', () => {
  it('is a labelled modal dialog that puts focus in the composer', async () => {
    mockChat();
    const user = userEvent.setup();
    renderWidget();
    await user.click(await fab());
    expect(await screen.findByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    await waitFor(() => expect(screen.getByRole('textbox', { name: t('CHAT.placeholder') })).toHaveFocus());
  });

  it('closes on Escape and returns focus to the button', async () => {
    mockChat();
    const user = userEvent.setup();
    renderWidget();
    await user.click(await fab());
    const input = await screen.findByRole('textbox', { name: t('CHAT.placeholder') });
    fireEvent.keyDown(input, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await waitFor(() => expect(screen.getByRole('button', { name: t('CHAT.open') })).toHaveFocus());
  });

  it('lets a club organizer create and delete rooms but not a plain member', async () => {
    mockChat({ organizerId: ME });
    let created: unknown = null;
    server.use(
      http.post(`${API}/clubs/:clubId/chat/rooms`, async ({ request }) => {
        created = await request.json();
        return HttpResponse.json({ id: ROOM_2, name: 'Book swap' });
      }),
    );
    const user = userEvent.setup();
    const { unmount } = renderWidget();
    await user.click(await fab());
    await user.click(await screen.findByRole('button', { name: `+ ${t('CHAT.new_room')}` }));
    await user.type(screen.getByRole('textbox', { name: t('CHAT.new_room_name') }), 'Bo');
    expect(screen.getByRole('button', { name: t('CHAT.create_room') })).toBeDisabled();
    await user.type(screen.getByRole('textbox', { name: t('CHAT.new_room_name') }), 'ok swap{Enter}');
    await waitFor(() => expect(created).toEqual({ name: 'Book swap' }));
    unmount();

    mockChat({ organizerId: 'someone-else' });
    renderWidget();
    await user.click(await fab());
    await screen.findByRole('textbox', { name: t('CHAT.placeholder') });
    expect(screen.queryByRole('button', { name: `+ ${t('CHAT.new_room')}` })).not.toBeInTheDocument();
  });
});
