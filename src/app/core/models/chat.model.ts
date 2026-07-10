export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: Date;
  isOwn: boolean;
  isSystem: boolean;
  isMuted?: boolean;
  isDivider?: never;
  /** True if this message starts/ends a new visual group (first overall, after
   *  a divider, or sender changed). Precomputed by ChatService so templates
   *  don't call an O(n) lookup function per row. */
  isGroupFirst?: boolean;
  isGroupLast?: boolean;
}

export interface UnreadDivider {
  id: string;
  isDivider: true;
}

/** Union of real messages and the unread-divider sentinel. */
export type ChatItem = ChatMessage | UnreadDivider;

export interface ChatRoom {
  id: string;
  name: string;
  clubId: string;
  eventId?: string;
}
