import type { ChatMessage, ChatRoom } from '@book-club/contracts';
import { isTemp } from './chat-keys';

export interface ChatRoomView extends ChatRoom {
  clubId: string;
  clubName: string;
}

export interface MessagesPage {
  items: ChatMessage[];
  /** False once a page comes back shorter than OLDER_PAGE_SIZE. */
  hasMoreOlder: boolean;
}

export interface UnreadState {
  count: number;
  lastReadId: string | null;
}

export type ChatItem =
  | { kind: 'divider'; id: 'unread-divider' }
  | { kind: 'message'; id: string; message: ChatMessage; isOwn: boolean; isGroupFirst: boolean; isGroupLast: boolean };

export const OLDER_PAGE_SIZE = 50;

export { TEMP_PREFIX, isTemp, messagesKey, roomsKey, unreadKey } from './chat-keys';

/** Senders may come back as an email; only the local part is shown. */
export function senderLabel(name: string): string {
  const at = name.indexOf('@');
  return at > 0 ? name.slice(0, at) : name;
}

/** Appends a live message; an echo of one already held is ignored and an optimistic twin of it is replaced. */
export function mergeIncoming(items: readonly ChatMessage[], message: ChatMessage): { items: ChatMessage[]; added: boolean } {
  if (items.some((m) => m.id === message.id)) return { items: [...items], added: false };
  const twin = items.findIndex((m) => isTemp(m) && m.senderId === message.senderId && m.text === message.text);
  const next = twin === -1 ? [...items, message] : items.map((m, i) => (i === twin ? message : m));
  return { items: next, added: true };
}

/** Folds a freshly fetched latest page into what is cached: loaded older history, live arrivals the fetch predates and pending optimistic sends survive. */
export function mergeLatest(prev: readonly ChatMessage[], fresh: readonly ChatMessage[]): ChatMessage[] {
  const first = fresh[0];
  const last = fresh[fresh.length - 1];
  const at = first ? prev.findIndex((m) => m.id === first.id) : -1;
  const older = at > 0 ? prev.slice(0, at) : [];
  const freshIds = new Set(fresh.map((m) => m.id));
  const lastAt = last ? Date.parse(last.timestamp) : Number.NaN;
  const newer = (at >= 0 ? prev.slice(at) : prev).filter((m) => !isTemp(m) && !freshIds.has(m.id) && Date.parse(m.timestamp) >= lastAt);
  const pending = prev.filter((m) => isTemp(m) && !fresh.some((f) => f.senderId === m.senderId && f.text === m.text));
  return [...older, ...fresh, ...newer, ...pending];
}

export function prependOlder(items: readonly ChatMessage[], older: readonly ChatMessage[]): ChatMessage[] {
  const known = new Set(items.map((m) => m.id));
  return [...older.filter((m) => !known.has(m.id)), ...items];
}

/** Inserts the unread divider after the last read message (never when it is the last one or unknown) and precomputes sender groups. */
export function buildItems(messages: readonly ChatMessage[], lastReadId: string | null | undefined, userId: string | null): ChatItem[] {
  const at = lastReadId ? messages.findIndex((m) => m.id === lastReadId) : -1;
  const divideAfter = at !== -1 && at < messages.length - 1 ? at : -1;
  const raw: ({ divider: true } | { divider: false; message: ChatMessage })[] = [];
  messages.forEach((message, i) => {
    raw.push({ divider: false, message });
    if (i === divideAfter) raw.push({ divider: true });
  });
  return raw.map((entry, i) => {
    if (entry.divider) return { kind: 'divider', id: 'unread-divider' };
    const prev = raw[i - 1];
    const next = raw[i + 1];
    const { message } = entry;
    return {
      kind: 'message',
      id: message.id,
      message,
      isOwn: message.senderId === userId,
      isGroupFirst: !prev || prev.divider || prev.message.senderId !== message.senderId,
      isGroupLast: !next || next.divider || next.message.senderId !== message.senderId,
    };
  });
}

export const badgeLabel = (count: number): string => (count > 9 ? '9+' : String(count));
