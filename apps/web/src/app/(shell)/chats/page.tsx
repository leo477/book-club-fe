import { RequireAuth } from '@/features/auth/require-auth';
import { ChatsPage } from '@/features/chat/chats-page';
import { pageMetadata } from '@/lib/page-metadata';

export async function generateMetadata() {
  return pageMetadata('CHAT.page_title', '/chats', { index: false });
}

export default function ChatsRoute() {
  return (
    <RequireAuth>
      <ChatsPage />
    </RequireAuth>
  );
}
