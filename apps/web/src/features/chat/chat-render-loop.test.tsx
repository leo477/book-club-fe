import { HttpResponse, delay, http } from 'msw';
import { Profiler } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StranglerProvider } from '@/strangler/context';
import { SHELL_CHAT_WIDGET } from '@/strangler/flags';
import { API, renderWithProviders, server, setupApiServer } from '@/test/harness';
import { ChatProvider } from './chat-provider';
import { ChatSlot } from './chat-slot';
import { FakeWebSocket, mockChat } from './test-support';

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

describe('ChatProvider render stability', () => {
  it('settles while /clubs/my is still pending: no render loop, no "Maximum update depth"', async () => {
    mockChat();
    server.use(
      http.get(`${API}/clubs/my`, async () => {
        await delay(1_500);
        return HttpResponse.json([]);
      }),
    );
    const errors = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    let commits = 0;
    renderWithProviders(
      <StranglerProvider value={[SHELL_CHAT_WIDGET]}>
        <Profiler id="chat" onRender={() => void (commits += 1)}>
          <ChatProvider>
            <ChatSlot />
          </ChatProvider>
        </Profiler>
      </StranglerProvider>,
    );
    await new Promise((r) => setTimeout(r, 1_000));
    expect(commits).toBeLessThan(25);
    expect(errors.mock.calls.flat().join(' ')).not.toMatch(/Maximum update depth/);
    await new Promise((r) => setTimeout(r, 700));
    expect(commits).toBeLessThan(40);
  });
});
