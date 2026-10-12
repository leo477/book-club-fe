'use client';

import { ChatLink } from '@/components/layout/chat-link';
import { useChat } from './chat-provider';
import { ChatWidget } from './chat-widget';

/** Behind Edge Config `shell.chatWidget`: the full widget when on, the R5 link to /chats while the flag is off. */
export function ChatSlot() {
  const { active, isChatsPage } = useChat();
  if (isChatsPage) return null;
  return active ? <ChatWidget /> : <ChatLink />;
}
