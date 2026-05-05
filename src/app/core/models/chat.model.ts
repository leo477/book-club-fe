export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: Date;
  isOwn: boolean;
  isMuted?: boolean;
}

export interface ChatRoom {
  id: string;
  name: string;
  clubId: string;
}
