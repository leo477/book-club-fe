import { act, screen, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { sessionKey } from '@/features/clubs/use-session';
import { StranglerProvider } from '@/strangler/context';
import { API, renderWithProviders, server, setupApiServer, userJson } from '@/test/harness';
import { ChatProvider } from './chat-provider';
import { ChatsPage } from './chats-page';
import { FakeWebSocket, ROOM, mockChat, msg, sockets } from './test-support';

const nav = vi.hoisted(() => ({ pathname: '/clubs' }));
vi.mock('next/navigation', () => ({ usePathname: () => nav.pathname, useRouter: () => ({ push: vi.fn(), replace: vi.fn() }) }));
vi.mock('@/lib/navigate', () => ({ hardNavigate: vi.fn(), replaceNavigate: vi.fn() }));
vi.mock('@/lib/toast', () => ({ showToast: vi.fn() }));
vi.mock('./chat-audio-alert', () => ({ createChatAudioAlert: () => ({ playBeep: vi.fn(), dispose: vi.fn() }) }));

setupApiServer();
beforeEach(() => {
  FakeWebSocket.reset();
  nav.pathname = '/clubs';
  vi.stubGlobal('WebSocket', FakeWebSocket);
  vi.stubEnv('NEXT_PUBLIC_WS_URL', 'wss://book-club-be.onrender.com/api/v1');
});
afterEach(() => vi.restoreAllMocks());

describe('ChatProvider', () => {
  it('shows nothing of the previous viewer after the session changes in the same tab', async () => {
    nav.pathname = '/chats';
    mockChat({ messages: { [ROOM]: [msg('m1', "A's private note")] } });
    const view = renderWithProviders(
      <StranglerProvider value={[]}>
        <ChatProvider>
          <ChatsPage />
        </ChatProvider>
      </StranglerProvider>,
    );
    expect(await screen.findByText("A's private note")).toBeInTheDocument();
    await waitFor(() => expect(sockets()).toHaveLength(1));
    const socketOfA = sockets()[0]!;

    server.use(
      http.get(`${API}/clubs/my`, () => HttpResponse.json([])),
      http.get(`${API}/chat/rooms/${ROOM}/messages`, () => HttpResponse.json([msg('x', 'must not be asked for')])),
    );
    act(() => void view.queryClient.setQueryData(sessionKey, userJson({ id: 'u2', displayName: 'Bob' })));

    await waitFor(() => expect(screen.queryByText("A's private note")).not.toBeInTheDocument());
    expect(socketOfA.closed).toBe(true);
    const keys = view.queryClient.getQueryCache().findAll({ queryKey: ['chat'] }).map((q) => q.queryKey);
    expect(keys.filter((k) => k[1] === 'u1')).toEqual([]);
    expect(screen.queryByText('must not be asked for')).not.toBeInTheDocument();
  });
});
