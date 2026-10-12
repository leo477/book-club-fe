'use client';
'use no memo';

import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { ErrorPanel } from '@/components/error-panel';
import { Spinner } from '@/components/ui/spinner';
import { useSession } from '@/features/clubs/use-session';
import { cn } from '@/lib/utils';
import { buildItems, senderLabel } from './chat-model';
import { formatChatTimestamp } from './chat-timestamp';
import { useChat } from './chat-provider';
import { useChatRoom } from './use-chat-data';

const NEAR_TOP_PX = 40;
const STICK_BOTTOM_PX = 120;

/** Message text is always a React text child: never parsed as HTML or markdown. */
export function ChatMessageList({ roomId, variant = 'widget' }: { roomId: string; variant?: 'widget' | 'page' }) {
  const t = useTranslations('CHAT');
  const locale = useLocale();
  const { user } = useSession();
  const { unread, presence } = useChat();
  const room = useChatRoom(roomId);
  const scroller = useRef<HTMLDivElement>(null);
  const settledRoom = useRef<string | null>(null);
  const stickToBottom = useRef(true);
  const raf = useRef(0);

  const lastReadId = unread[roomId]?.lastReadId ?? null;
  const items = useMemo(() => buildItems(room.messages, lastReadId, user?.id ?? null), [room.messages, lastReadId, user?.id]);
  const words = { today: t('today'), yesterday: t('yesterday') };
  const page = variant === 'page';

  // first paint of a room lands on the unread divider, later arrivals follow the bottom only while the viewer is there
  useLayoutEffect(() => {
    const el = scroller.current;
    if (!el || room.isPending || room.messages.length === 0) return;
    if (settledRoom.current !== roomId) {
      settledRoom.current = roomId;
      const divider = el.querySelector<HTMLElement>('[data-unread-divider]');
      if (divider) el.scrollTop = Math.max(0, divider.offsetTop - 68);
      else el.scrollTop = el.scrollHeight;
      stickToBottom.current = !divider;
      return;
    }
    if (stickToBottom.current) el.scrollTop = el.scrollHeight;
  }, [roomId, room.isPending, room.messages.length]);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const onScroll = () => {
    const el = scroller.current;
    if (!el) return;
    stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < STICK_BOTTOM_PX;
    if (el.scrollTop > NEAR_TOP_PX) return;
    const { scrollHeight, scrollTop } = el;
    void room.loadOlder().then((added) => {
      if (!added) return;
      raf.current = requestAnimationFrame(() => {
        const node = scroller.current;
        if (node) node.scrollTop = scrollTop + (node.scrollHeight - scrollHeight);
      });
    });
  };

  return (
    <div
      ref={scroller}
      role="log"
      tabIndex={0}
      aria-label={t('messages_log')}
      aria-live="polite"
      onScroll={onScroll}
      className={cn('flex-1 overflow-y-auto focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent-500', page ? 'px-4 py-4 flex flex-col' : 'p-3 space-y-2 min-h-40')}
    >
      {room.isLoadingOlder && (
        <div className="flex justify-center py-2">
          <span className="text-xs text-[var(--color-ink-muted)]">{t('loading_older')}</span>
        </div>
      )}
      {room.isPending ? (
        <div className="flex justify-center pt-6" aria-busy="true">
          <Spinner />
        </div>
      ) : room.isError ? (
        <ErrorPanel compact onRetry={room.refetch} />
      ) : items.length === 0 ? (
        <div className="flex h-full items-center justify-center text-[var(--color-ink-muted)]">{t('no_messages')}</div>
      ) : (
        items.map((item) => {
          if (item.kind === 'divider') {
            return (
              <div key={item.id} data-unread-divider className={cn('flex items-center gap-2', page ? 'my-3' : 'my-2')}>
                <div className="flex-1 border-t border-[var(--destructive)] opacity-60" />
                <span className="text-xs font-semibold text-[var(--destructive)]">{t('unread_divider')}</span>
                <div className="flex-1 border-t border-[var(--destructive)] opacity-60" />
              </div>
            );
          }
          const { message, isOwn, isGroupFirst, isGroupLast } = item;
          if (message.isSystem) {
            return (
              <div key={item.id} className={cn('flex justify-center', page ? 'my-3' : 'my-2')}>
                <span className="text-xs px-3 py-1 rounded-full text-center bg-[var(--color-surface)] text-[var(--color-ink-muted)]">{message.text}</span>
              </div>
            );
          }
          const name = senderLabel(message.senderName);
          const online = presence.get(message.senderId) === 'online';
          const dot = online && (
            <span
              role="img"
              aria-label={t('online')}
              title={t('online')}
              className={cn('rounded-full bg-green-500', page ? 'absolute bottom-0 right-0 size-2.5 border-2 border-[var(--color-surface)]' : 'size-1.5 inline-block')}
            />
          );
          const time = (
            <span className={cn('text-xs text-[var(--color-ink-muted)]', isOwn && 'text-right')}>
              {formatChatTimestamp(message.timestamp, locale, words)}
            </span>
          );
          const bubble = (
            <div
              className={cn(
                'px-4 py-2 rounded-2xl [overflow-wrap:anywhere]',
                page && 'px-3 text-sm shadow-sm',
                isOwn ? 'bg-accent-500 text-white' : 'bg-[var(--color-surface)] text-[var(--color-ink)]',
                isOwn ? 'rounded-br-sm' : 'rounded-bl-sm',
                page && isGroupFirst && (isOwn ? 'rounded-tr-sm' : 'rounded-tl-sm'),
              )}
            >
              {message.text}
            </div>
          );

          if (!page) {
            return (
              <div key={item.id} className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}>
                <div className="flex flex-col max-w-[75%]">
                  {!isOwn && (
                    <div className="flex items-center gap-1 px-3 mb-1">
                      <span className="text-xs text-[var(--color-ink-muted)]">{name}</span>
                      {dot}
                    </div>
                  )}
                  {bubble}
                  <div className="px-3 mt-1 text-right">{time}</div>
                </div>
              </div>
            );
          }
          return (
            <div key={item.id} className={cn('flex flex-col', isOwn ? 'items-end' : 'items-start', isGroupFirst ? 'mt-3' : 'mt-1')}>
              <div className={cn('flex items-end gap-2 max-w-[70%]', isOwn && 'flex-row-reverse')}>
                {!isOwn &&
                  (isGroupFirst ? (
                    <div className="relative">
                      <div className="shrink-0 size-7 rounded-full flex items-center justify-center text-xs font-bold bg-[var(--color-ink-muted)]/20 text-[var(--color-ink-muted)]" aria-hidden="true">
                        {name.slice(0, 2).toUpperCase()}
                      </div>
                      {dot}
                    </div>
                  ) : (
                    <div className="w-7 shrink-0" />
                  ))}
                <div className={cn('flex flex-col', isOwn && 'items-end')}>
                  {!isOwn && isGroupFirst && <span className="text-xs text-[var(--color-ink-muted)] mb-1 ml-1">{name}</span>}
                  {bubble}
                  {isGroupLast && <div className="mt-1">{time}</div>}
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
