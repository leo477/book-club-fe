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
