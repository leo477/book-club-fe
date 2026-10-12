'use client';
'use no memo';

import { useTranslations } from 'next-intl';
import { ErrorPanel } from '@/components/error-panel';
import { Pending } from '@/features/auth/require-auth';
import { cn } from '@/lib/utils';
import { badgeLabel } from './chat-model';
import { ChatComposer } from './chat-composer';
import { ConnectionNotice } from './connection-notice';
import { ChatMessageList } from './chat-message-list';
import { useChat } from './chat-provider';
import { useChatRoom } from './use-chat-data';

export function ChatsPage() {
  const t = useTranslations('CHAT');
  const tPage = useTranslations('CHATS');
  const chat = useChat();
  const activeRoom = chat.rooms.find((r) => r.id === chat.activeRoomId) ?? null;

  if (chat.roomsPending) return <Pending />;
  if (chat.roomsError) return <ErrorPanel onRetry={chat.retryRooms} />;

  return (
    <div className="grid grid-rows-[auto_minmax(0,1fr)] md:grid-rows-1 md:grid-cols-[20rem_minmax(0,1fr)] h-[calc(100dvh-4rem)] overflow-hidden">
      <h1 className="sr-only">{t('page_title')}</h1>
      <aside className="flex flex-col max-h-44 md:max-h-none border-b md:border-b-0 md:border-r border-[var(--color-sepia)] overflow-y-auto">
        <h2 className="px-4 py-4 font-semibold text-base border-b border-[var(--color-sepia)]">{tPage('title')}</h2>
        <div className="py-2">
          {chat.rooms.length === 0 ? (
            <p className="px-4 py-3 text-sm text-[var(--color-ink-muted)]">{tPage('no_rooms')}</p>
          ) : (
            chat.rooms.map((room) => {
              const selected = chat.activeRoomId === room.id;
              const count = chat.unread[room.id]?.count ?? 0;
              return (
                <button
                  key={room.id}
                  type="button"
                  onClick={() => chat.selectRoom(room.id)}
                  aria-current={selected ? 'true' : undefined}
                  className={cn(
                    'w-full text-left px-3 py-3 flex items-center gap-3 border-l-2 transition-colors hover:bg-[var(--color-surface-raised)]/60',
                    selected ? 'border-l-primary-600 bg-[var(--color-surface-raised)]' : 'border-l-transparent',
                  )}
                >
                  <span
                    className={cn(
                      'shrink-0 size-9 rounded-full flex items-center justify-center text-sm font-semibold',
                      selected ? 'bg-primary-600 text-white' : 'bg-primary-500/15 text-primary-600',
                    )}
                    aria-hidden="true"
                  >
                    {room.name.slice(0, 1).toUpperCase()}
                  </span>
                  <span className="flex-1 flex flex-col min-w-0">
                    <span className="text-sm font-semibold leading-tight truncate">{room.name}</span>
                    <span className="text-xs text-[var(--color-ink-muted)] leading-tight truncate mt-0.5">{room.clubName}</span>
                  </span>
                  {count > 0 && !selected && (
                    <>
                      <span aria-hidden="true" className="shrink-0 min-w-5 h-5 rounded-full bg-[var(--destructive)] flex items-center justify-center text-white text-xs font-bold px-1">
                        {badgeLabel(count)}
                      </span>
                      <span className="sr-only">{t('unread_aria', { count })}</span>
                    </>
                  )}
                </button>
              );
            })
          )}
        </div>
      </aside>

      <section className="flex flex-col overflow-hidden">
        {activeRoom ? (
          <>
            <div className="px-4 py-3 border-b border-[var(--color-sepia)] flex flex-col">
              <span className="font-semibold text-base leading-tight">{activeRoom.name}</span>
              <span className="text-xs text-[var(--color-ink-muted)] mt-0.5">{activeRoom.clubName}</span>
              <ConnectionNotice status={chat.connection} onRetry={chat.reconnect} className="text-xs text-[var(--color-ink-muted)] mt-0.5" />
            </div>
            <ChatMessageList key={activeRoom.id} roomId={activeRoom.id} variant="page" />
            <PageComposer roomId={activeRoom.id} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-[var(--color-ink-muted)]">{tPage('select_room')}</div>
        )}
      </section>
    </div>
  );
}

function PageComposer({ roomId }: { roomId: string }) {
  const { send } = useChatRoom(roomId);
  const { markRoomRead } = useChat();
  return (
    <ChatComposer
      variant="page"
      onSend={(text) => {
        send(text);
        markRoomRead(roomId);
      }}
    />
  );
}
