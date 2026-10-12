import type { MessagesPage } from './chat-model';

export const TEMP_PREFIX = 'temp-';

/** Every chat cache entry is scoped by the viewer, so one user's rooms, messages and counts can never be read as another's. */
export const CHAT_ROOT = ['chat'] as const;
export const roomsKey = (userId: string) => ['chat', userId, 'rooms'] as const;
export const messagesKey = (userId: string, roomId: string) => ['chat', userId, 'messages', roomId] as const;
export const unreadKey = (userId: string, roomId: string) => ['chat', userId, 'unread', roomId] as const;

export const isTemp = (message: { id: string }): boolean => message.id.startsWith(TEMP_PREFIX);

/** A tab asleep for longer than this is assumed to hold a dead socket the browser never reported. */
export const RESUME_RECONNECT_MS = 30_000;

export const lastConfirmedId = (page: MessagesPage | undefined): string | null => {
  const last = page?.items[page.items.length - 1];
  return last && !isTemp(last) ? last.id : null;
};
