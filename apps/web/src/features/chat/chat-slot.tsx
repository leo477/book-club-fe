'use client';

import { lazy, Suspense } from 'react';
import { ChatLink } from '@/components/layout/chat-link';
import { useChat } from './chat-provider';

// the panel, message list and icons load only once a signed-in viewer has the flag, keeping them out of every page's first load
const ChatWidget = lazy(() => import('./chat-widget').then((m) => ({ default: m.ChatWidget })));

/** Behind Edge Config `shell.chatWidget`: the full widget when on, the R5 link to /chats while the flag is off. */
export function ChatSlot() {
  const { active, isChatsPage } = useChat();
  if (isChatsPage) return null;
  return active ? (
    <Suspense fallback={null}>
      <ChatWidget />
    </Suspense>
  ) : (
    <ChatLink />
  );
}
