import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { API, renderWithProviders, server, setupApiServer } from '@/test/harness';
import { capture } from '@/features/organizer/test-support';
import { ChatRoomForm } from './chat-room-form';
import { gate, ID, t } from './test-support';

vi.mock('@/lib/toast', () => ({ showToast: vi.fn() }));
setupApiServer();

const room = { id: 'r1', name: 'General', clubId: ID, eventId: null };
const input = () => screen.getByLabelText(t('CLUB_DETAIL.chat_room_placeholder'));
const create = () => screen.getByRole('button', { name: t('CLUB_DETAIL.chat_create_btn') });

describe('ChatRoomForm', () => {
  it('disables Create while the name is blank and caps the name at the backend limit', () => {
    renderWithProviders(<ChatRoomForm clubId={ID} />);
    expect(create()).toBeDisabled();
    expect(input()).toHaveAttribute('maxlength', '40');
    fireEvent.change(input(), { target: { value: '   ' } });
    expect(create()).toBeDisabled();
  });

  it('creates the room with the trimmed name, clears the input and links to the chats', async () => {
    const bodies = capture('post', `/clubs/${ID}/chat/rooms`, () => HttpResponse.json(room, { status: 201 }));
    const user = userEvent.setup();
    renderWithProviders(<ChatRoomForm clubId={ID} />);
    await user.type(input(), '  General  ');
    await user.click(create());
    expect(await screen.findByRole('link', { name: t('CHAT.page_title') })).toHaveAttribute('href', '/chats');
    expect(bodies).toEqual([{ name: 'General' }]);
    expect(input()).toHaveValue('');
  });

  it('submits on Enter', async () => {
    const bodies = capture('post', `/clubs/${ID}/chat/rooms`, () => HttpResponse.json(room, { status: 201 }));
    const user = userEvent.setup();
    renderWithProviders(<ChatRoomForm clubId={ID} />);
    await user.type(input(), 'General{Enter}');
    await waitFor(() => expect(bodies).toHaveLength(1));
  });

  it('shows the backend detail and keeps the name when creation fails', async () => {
    server.use(http.post(`${API}/clubs/${ID}/chat/rooms`, () => HttpResponse.json({ detail: 'Room name too short' }, { status: 422 })));
    const user = userEvent.setup();
    renderWithProviders(<ChatRoomForm clubId={ID} />);
    await user.type(input(), 'Ab');
    await user.click(create());
    expect(await screen.findByRole('alert')).toHaveTextContent('Room name too short');
    expect(input()).toHaveValue('Ab');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('creates one room for two submits before it re-renders', async () => {
    const { open, release } = gate();
    let calls = 0;
    server.use(
      http.post(`${API}/clubs/${ID}/chat/rooms`, async () => {
        calls += 1;
        await open;
        return HttpResponse.json(room, { status: 201 });
      }),
    );
    renderWithProviders(<ChatRoomForm clubId={ID} />);
    fireEvent.change(input(), { target: { value: 'General' } });
    const form = input().closest('form') as HTMLFormElement;
    await act(async () => {
      fireEvent.submit(form);
      fireEvent.submit(form);
    });
    release();
    await screen.findByRole('status');
    expect(calls).toBe(1);
  });

  it('settles quietly when the form left before the answer arrived', async () => {
    const { open, release } = gate();
    const answered = vi.fn();
    server.use(
      http.post(`${API}/clubs/${ID}/chat/rooms`, async () => {
        await open;
        answered();
        return HttpResponse.json({ detail: 'late' }, { status: 422 });
      }),
    );
    const { unmount } = renderWithProviders(<ChatRoomForm clubId={ID} />);
    fireEvent.change(input(), { target: { value: 'General' } });
    fireEvent.submit(input().closest('form') as HTMLFormElement);
    unmount();
    release();
    await waitFor(() => expect(answered).toHaveBeenCalled());
    await new Promise((r) => setTimeout(r, 20));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
