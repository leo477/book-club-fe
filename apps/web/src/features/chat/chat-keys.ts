import type { MessagesPage } from './chat-model';

export const TEMP_PREFIX = 'temp-';

export const roomsKey = ['chat', 'rooms'] as const;
export const messagesKey = (roomId: string) => ['chat', 'messages', roomId] as const;
export const unreadKey = (roomId: string) => ['chat', 'unread', roomId] as const;

export const isTemp = (message: { id: string }): boolean => message.id.startsWith(TEMP_PREFIX);

/** A tab asleep for longer than this is assumed to hold a dead socket the browser never reported. */
export const RESUME_RECONNECT_MS = 30_000;

export const lastConfirmedId = (page: MessagesPage | undefined): string | null => {
  const last = page?.items[page.items.length - 1];
  return last && !isTemp(last) ? last.id : null;
};
