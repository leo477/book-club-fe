'use client';

import { XIcon, ChevronLeftIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function ChatHeader(
  props:
    | { view: 'rooms'; roomCount: number }
    | { view: 'chat'; roomName: string; showBack: boolean; onBack: () => void; onClose: () => void },
) {
  const t = useTranslations('CHAT');
  if (props.view === 'rooms') {
    return (
      <div className="flex items-center justify-between p-4 bg-gradient-to-br from-primary-600 to-primary-500">
        <div>
          <h2 className="text-white font-bold text-base">{t('widget_title')}</h2>
          <p className="text-white/80 text-xs">{t('rooms_count', { count: props.roomCount })}</p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-3 p-3 border-b border-[var(--border)]">
      {props.showBack && (
        <button
          type="button"
          onClick={props.onBack}
          aria-label={t('back')}
          className="shrink-0 text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
        >
          <ChevronLeftIcon className="size-5" aria-hidden="true" />
        </button>
      )}
      <h2 className="flex-1 min-w-0 truncate font-semibold text-sm text-[var(--color-ink)]">{props.roomName}</h2>
      <button
        type="button"
        onClick={props.onClose}
        aria-label={t('close')}
        className="shrink-0 text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
      >
        <XIcon className="size-5" aria-hidden="true" />
      </button>
    </div>
  );
}
