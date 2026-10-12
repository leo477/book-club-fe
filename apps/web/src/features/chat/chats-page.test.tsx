import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { t } from '@/features/club-manage/test-support';
import { StranglerProvider } from '@/strangler/context';
import { API, renderWithProviders, server, setupApiServer } from '@/test/harness';
import { ChatProvider } from './chat-provider';
import { ChatsPage } from './chats-page';
import { OLDER_PAGE_SIZE } from './chat-model';
import { FakeWebSocket, ME, ROOM, ROOM_2, mockChat, msg, sockets } from './test-support';

const nav = vi.hoisted(() => ({ beep: vi.fn() }));
vi.mock('next/navigation', () => ({ usePathname: () => '/chats', useRouter: () => ({ push: vi.fn(), replace: vi.fn() }) }));
vi.mock('@/lib/navigate', () => ({ hardNavigate: vi.fn(), replaceNavigate: vi.fn() }));
vi.mock('@/lib/toast', () => ({ showToast: vi.fn() }));
vi.mock('./chat-audio-alert', () => ({ createChatAudioAlert: () => ({ playBeep: nav.beep, dispose: vi.fn() }) }));

setupApiServer();
beforeEach(() => {
  FakeWebSocket.reset();
  nav.beep.mockReset();
  vi.stubGlobal('WebSocket', FakeWebSocket);
  vi.stubEnv('NEXT_PUBLIC_WS_URL', 'wss://book-club-be.onrender.com/api/v1');
});

const TWO_ROOMS = [
  { id: ROOM, name: 'General' },
  { id: ROOM_2, name: 'Plot talk' },
];

const renderPage = () =>
  renderWithProviders(
    <StranglerProvider value={[]}>
      <ChatProvider>
        <ChatsPage />
      </ChatProvider>
    </StranglerProvider>,
  );

async function connected() {
  await waitFor(() => expect(sockets()).toHaveLength(1));
  const socket = sockets()[0]!;
  await waitFor(() => expect(socket.readyState).toBe(0));
  act(() => socket.accept());
  return socket;
}

describe('ChatsPage', () => {
  it('lists rooms with their club, opens the first one and connects without any widget flag', async () => {
    mockChat({ rooms: TWO_ROOMS, messages: { [ROOM]: [msg('m1', 'welcome')] } });
    renderPage();
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent(t('CHAT.page_title'));
    const general = await screen.findByRole('button', { name: /General/ });
    expect(general).toHaveAttribute('aria-current', 'true');
    expect(within(general).getByText('Alpha Readers')).toBeInTheDocument();
    expect(await screen.findByText('welcome')).toBeInTheDocument();
    const socket = await connected();
    expect(socket.url).toContain(`/chat/rooms/${ROOM}`);
  });

  it('shows the empty states', async () => {
    mockChat({ rooms: [] });
    renderPage();
    expect(await screen.findByText(t('CHATS.no_rooms'))).toBeInTheDocument();
    expect(screen.getByText(t('CHATS.select_room'))).toBeInTheDocument();
    expect(sockets()).toHaveLength(0);
  });

  it('shows per-room unread badges for the other rooms and an unread divider in the open one', async () => {
    mockChat({
      rooms: TWO_ROOMS,
      messages: { [ROOM]: [msg('m1', 'read one'), msg('m2', 'fresh one')] },
      unread: { [ROOM]: { unread_count: 1, last_read_message_id: 'm1' }, [ROOM_2]: { unread_count: 12, last_read_message_id: null } },
    });
    renderPage();
    const other = await screen.findByRole('button', { name: /Plot talk/ });
    expect(await within(other).findByText('9+')).toBeInTheDocument();
    expect(other).toHaveAccessibleName(/Plot talk.*12/);
    const log = await screen.findByRole('log');
    const divider = await waitFor(() => {
      const node = log.querySelector('[data-unread-divider]');
      expect(node).not.toBeNull();
      return node as HTMLElement;
    });
    expect(divider).toHaveTextContent(t('CHAT.unread_divider'));
    expect(divider.previousElementSibling).toHaveTextContent('read one');
    expect(divider.nextElementSibling).toHaveTextContent('fresh one');
  });

  it('marks the open room read on the server as soon as it shows, and never counts or beeps for what arrives while on the page', async () => {
    const mock = mockChat({ messages: { [ROOM]: [msg('m1', 'one')] }, unread: { [ROOM]: { unread_count: 1, last_read_message_id: null } } });
    renderPage();
    await screen.findByText('one');
    await waitFor(() => expect(mock.reads).toEqual([{ roomId: ROOM, lastReadMessageId: 'm1' }]));
    const socket = await connected();
    act(() => socket.push({ type: 'message', payload: msg('m2', 'two') }));
    expect(await screen.findByText('two')).toBeInTheDocument();
    await waitFor(() => expect(mock.reads.at(-1)).toEqual({ roomId: ROOM, lastReadMessageId: 'm2' }));
    expect(nav.beep).not.toHaveBeenCalled();
  });

  it('switches room: closes the old socket, loads the new history and reconnects with a new ticket', async () => {
    const mock = mockChat({ rooms: TWO_ROOMS, messages: { [ROOM]: [msg('a1', 'in general')], [ROOM_2]: [msg('b1', 'in plot talk')] } });
    const user = userEvent.setup();
    renderPage();
    const first = await connected();
    await screen.findByText('in general');
    await user.click(await screen.findByRole('button', { name: /Plot talk/ }));
    expect(await screen.findByText('in plot talk')).toBeInTheDocument();
    expect(screen.queryByText('in general')).not.toBeInTheDocument();
    expect(first.closed).toBe(true);
    await waitFor(() => expect(sockets()).toHaveLength(1));
    expect(sockets()[0]?.url).toContain(ROOM_2);
    expect(mock.tickets.n).toBe(2);
    await waitFor(() => expect(mock.reads).toContainEqual({ roomId: ROOM, lastReadMessageId: 'a1' }));
  });

  it('shows timestamps with a today prefix and a message of mine on the right', async () => {
    mockChat({ messages: { [ROOM]: [msg('m1', 'mine', { senderId: ME, senderName: 'Ada Lovelace' })] } });
    renderPage();
    const text = await screen.findByText('mine');
    const column = text.parentElement as HTMLElement;
    expect(column.className).toContain('items-end');
    expect(within(column).getByText(new RegExp(`^${t('CHAT.today')} \\d\\d:\\d\\d$`))).toBeInTheDocument();
  });

  it('loads older history when scrolled to the top, once, and stops after a short page', async () => {
    const page = Array.from({ length: OLDER_PAGE_SIZE }, (_, i) => msg(`n${String(i).padStart(2, '0')}`, `newer ${i}`));
    const mock = mockChat({ messages: { [ROOM]: page } });
    server.use(
      http.get(`${API}/chat/rooms/${ROOM}/messages`, ({ request }) => {
        const before = new URL(request.url).searchParams.get('before_id');
        mock.messageFetches.push({ roomId: ROOM, before });
        return HttpResponse.json(before ? [msg('o1', 'older 1'), msg('o2', 'older 2')] : page);
      }),
    );
    renderPage();
    const log = await screen.findByRole('log');
    await screen.findByText('newer 0');
    Object.defineProperty(log, 'scrollTop', { configurable: true, value: 0, writable: true });
    fireEvent.scroll(log);
    fireEvent.scroll(log);
    expect(await screen.findByText('older 1')).toBeInTheDocument();
    expect(mock.messageFetches.filter((f) => f.before !== null)).toEqual([{ roomId: ROOM, before: 'n00' }]);
    fireEvent.scroll(log);
    await new Promise((r) => setTimeout(r, 50));
    expect(mock.messageFetches.filter((f) => f.before !== null)).toHaveLength(1);
    const order = within(log).getAllByText(/older|newer/).map((n) => n.textContent);
    expect(order.slice(0, 4)).toEqual(['older 1', 'older 2', 'newer 0', 'newer 1']);
  });

  it('does not offer older history when the first page is short', async () => {
    const mock = mockChat({ messages: { [ROOM]: [msg('a', 'only one')] } });
    renderPage();
    const log = await screen.findByRole('log');
    await screen.findByText('only one');
    Object.defineProperty(log, 'scrollTop', { configurable: true, value: 0, writable: true });
    fireEvent.scroll(log);
    await new Promise((r) => setTimeout(r, 50));
    expect(mock.messageFetches.filter((f) => f.before !== null)).toHaveLength(0);
  });

  it('keeps going when the message feed fails, with a retry', async () => {
    mockChat();
    server.use(http.get(`${API}/chat/rooms/${ROOM}/messages`, () => HttpResponse.json({ detail: 'x' }, { status: 400 })));
    renderPage();
    expect(await screen.findByRole('alert')).toBeInTheDocument();
  });
});
