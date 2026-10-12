'use client';

import { SendIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState, type KeyboardEvent } from 'react';
import { MAX_MESSAGE_LENGTH } from '@book-club/api-client/ws';
import { cn } from '@/lib/utils';

export function ChatComposer({ onSend, variant = 'widget', autoFocus = false }: { onSend: (text: string) => void; variant?: 'widget' | 'page'; autoFocus?: boolean }) {
  const t = useTranslations('CHAT');
  const [text, setText] = useState('');
  const trimmed = text.trim();

  const submit = () => {
    if (!trimmed) return;
    onSend(trimmed);
    setText('');
  };
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter' || e.shiftKey || e.nativeEvent.isComposing) return;
    e.preventDefault();
    submit();
  };

  return (
    <div className={cn('flex gap-2 border-t border-[var(--border)]', variant === 'widget' ? 'p-3' : 'px-3 py-3 border-[var(--color-sepia)]')}>
      <input
        type="text"
        autoFocus={autoFocus}
        maxLength={MAX_MESSAGE_LENGTH}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={t('placeholder')}
        aria-label={t('placeholder')}
        className={cn(
          'flex-1 min-w-0 px-4 py-2 bg-[var(--color-surface)] text-[var(--color-ink)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-accent-500',
          variant === 'widget' ? 'rounded-full' : 'rounded-md',
        )}
      />
      <button
        type="button"
        onClick={submit}
        disabled={!trimmed}
        aria-label={t('send')}
        className="size-10 shrink-0 rounded-full bg-accent-500 text-white flex items-center justify-center hover:shadow-md transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <SendIcon className="size-5" aria-hidden="true" />
      </button>
    </div>
  );
}
