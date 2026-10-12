'use client';
'use no memo';

import { ChevronRightIcon, MessageSquareIcon, Trash2Icon, XIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { useRef, useState, type KeyboardEvent } from 'react';
import { useSession } from '@/features/clubs/use-session';
import { cn } from '@/lib/utils';
import { badgeLabel } from './chat-model';
import { ChatComposer } from './chat-composer';
import { ChatHeader } from './chat-header';
import { ChatMessageList } from './chat-message-list';
import { ConnectionNotice } from './connection-notice';
import { useChat } from './chat-provider';
import { NewRoomForm } from './new-room-form';
import { useChatRoom, useRoomActions } from './use-chat-data';

const CLUB_DETAIL = /^\/clubs\/[^/]+$/;
const URL_CLUB = /^\/clubs\/([^/]+)$/;

export function ChatWidget() {
  const t = useTranslations('CHAT');
  const pathname = usePathname();
  const { user } = useSession();
  const chat = useChat();
  const fab = useRef<HTMLButtonElement>(null);
  const [roomListRequested, setRoomListRequested] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<string | null>(null);
  const { deleteRoom } = useRoomActions();

  if (!user || !chat.active || chat.isChatsPage) return null;

  const activeRoom = chat.rooms.find((r) => r.id === chat.activeRoomId) ?? null;
  const urlClubId = URL_CLUB.exec(pathname)?.[1] ?? null;
  const clubId = activeRoom?.clubId ?? urlClubId;
  const isOrganizer = clubId !== null && chat.clubs.some((c) => c.id === clubId && c.organizerId === user.id);
  const shift = isOrganizer || pathname === '/clubs';
  const fabVisible = !CLUB_DETAIL.test(pathname);
  const showRoomList = roomListRequested || (chat.rooms.length > 1 && !chat.activeRoomId);

  const closeAndFocus = () => {
    chat.close();
    setTimeout(() => fab.current?.focus(), 0);
  };
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && chat.isOpen) closeAndFocus();
  };
  const pick = (roomId: string) => {
    chat.selectRoom(roomId);
    setRoomListRequested(false);
  };

  return (
    <div onKeyDown={onKeyDown}>
      {fabVisible && (
        <button
          ref={fab}
          type="button"
          onClick={chat.toggle}
          aria-label={chat.isOpen ? t('close') : chat.totalUnread > 0 ? t('open_unread', { count: chat.totalUnread }) : t('open')}
          className={cn(
            'fixed z-50 right-6 size-14 rounded-full bg-accent-500 shadow-lg hover:shadow-xl transition-shadow duration-200 flex items-center justify-center text-white',
            shift ? 'bottom-24' : 'bottom-6',
            chat.hasNewMessage && 'motion-safe:animate-[bounce_1s_1]',
          )}
        >
          {chat.isOpen ? <XIcon className="size-6" aria-hidden="true" /> : <MessageSquareIcon className="size-6" fill="currentColor" aria-hidden="true" />}
          {chat.totalUnread > 0 && (
            <span
              aria-hidden="true"
              className="absolute top-0 right-0 min-w-5 h-5 rounded-full border-2 border-[var(--color-surface-raised)] bg-[var(--destructive)] flex items-center justify-center text-white text-xs font-bold px-1"
            >
              {badgeLabel(chat.totalUnread)}
            </span>
          )}
        </button>
      )}

      {chat.isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t('title')}
          className={cn(
            'fixed z-40 right-6 w-[calc(100vw-3rem)] max-w-80 max-h-[480px] flex flex-col rounded-2xl shadow-2xl overflow-hidden bg-[var(--color-surface-raised)] border border-[var(--border)]',
            shift ? 'bottom-40' : 'bottom-24',
          )}
        >
          {showRoomList ? (
            <>
              <ChatHeader view="rooms" roomCount={chat.rooms.length} />
              <div className="flex-1 overflow-y-auto">
                {chat.rooms.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-2 text-center px-4 py-8">
                    <MessageSquareIcon className="size-6 text-[var(--color-ink-muted)]" aria-hidden="true" />
                    <p className="text-sm text-[var(--color-ink-muted)]">{t('no_rooms_hint_member')}</p>
                  </div>
                ) : (
                  chat.rooms.map((room) => (
                    <div key={room.id} className="flex flex-col">
                      <div className="flex items-center">
                        <button
                          type="button"
                          onClick={() => pick(room.id)}
                          className="flex-1 min-w-0 flex items-center gap-3 px-4 py-3 border-b border-[var(--border)] hover:bg-[var(--color-surface)] text-left"
                        >
                          <span className="size-10 shrink-0 rounded-full bg-primary-500 text-white flex items-center justify-center font-bold" aria-hidden="true">
                            {room.name.slice(0, 1).toUpperCase()}
                          </span>
                          <span className="flex-1 min-w-0 truncate font-semibold text-sm text-[var(--color-ink)]">{room.name}</span>
                          {(chat.unread[room.id]?.count ?? 0) > 0 && (
                            <>
                              <span aria-hidden="true" className="min-w-5 h-5 rounded-full bg-[var(--destructive)] text-white text-xs font-bold px-1 flex items-center justify-center">
                                {badgeLabel(chat.unread[room.id]?.count ?? 0)}
                              </span>
                              <span className="sr-only">{t('unread_aria', { count: chat.unread[room.id]?.count ?? 0 })}</span>
                            </>
                          )}
                          <ChevronRightIcon className="size-4 shrink-0 text-[var(--color-ink-muted)]" aria-hidden="true" />
                        </button>
                        {chat.clubs.some((c) => c.id === room.clubId && c.organizerId === user.id) && (
                          <button
                            type="button"
                            onClick={() => setRoomToDelete(roomToDelete === room.id ? null : room.id)}
                            aria-label={t('delete_room_aria', { name: room.name })}
                            className="shrink-0 p-2 ml-1 rounded-lg text-[var(--color-ink-muted)] hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Trash2Icon className="size-4" aria-hidden="true" />
                          </button>
                        )}
                      </div>
                      {roomToDelete === room.id && (
                        <div className="flex items-center justify-between px-3 py-2 mx-1 mb-1 rounded-lg bg-red-50 dark:bg-red-900/20">
                          <span className="text-xs text-red-600 dark:text-red-400">{t('delete_room_confirm')}</span>
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setRoomToDelete(null);
                                void deleteRoom(room.id);
                              }}
                              className="text-xs px-2 py-1 rounded font-medium bg-red-600 text-white hover:bg-red-700"
                            >
                              {t('delete')}
                            </button>
                            <button
                              type="button"
                              onClick={() => setRoomToDelete(null)}
                              className="text-xs px-2 py-1 rounded font-medium bg-[var(--color-surface)] text-[var(--color-ink-muted)]"
                            >
                              {t('cancel')}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
              {isOrganizer && clubId && <NewRoomForm clubId={clubId} />}
            </>
          ) : (
            <>
              <ChatHeader
                view="chat"
                roomName={activeRoom?.name ?? ''}
                showBack={chat.rooms.length > 1}
                onBack={() => setRoomListRequested(true)}
                onClose={closeAndFocus}
              />
              <ConnectionNotice
                status={chat.connection}
                onRetry={chat.reconnect}
                className="px-3 py-1 text-xs text-center bg-[var(--color-surface)] text-[var(--color-ink-muted)]"
              />
              {chat.activeRoomId ? (
                <>
                  <ChatMessageList roomId={chat.activeRoomId} />
                  <WidgetComposer roomId={chat.activeRoomId} />
                </>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 text-center px-4 py-8">
                  <MessageSquareIcon className="size-6 text-[var(--color-ink-muted)]" aria-hidden="true" />
                  <p className="text-sm text-[var(--color-ink-muted)]">{t('no_rooms_hint_member')}</p>
                </div>
              )}
              {isOrganizer && clubId && <NewRoomForm clubId={clubId} />}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function WidgetComposer({ roomId }: { roomId: string }) {
  const { send } = useChatRoom(roomId);
  const { markRoomRead } = useChat();
  return (
    <ChatComposer
      autoFocus
      onSend={(text) => {
        send(text);
        markRoomRead(roomId);
      }}
    />
  );
}
