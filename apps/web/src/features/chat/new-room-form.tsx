'use client';

import { useTranslations } from 'next-intl';
import { useState, type KeyboardEvent } from 'react';
import { useRoomActions } from './use-chat-data';

const MIN_NAME = 3;
const MAX_NAME = 40;

/** Organizer-only: toggles an inline name field and creates a room in the club. */
export function NewRoomForm({ clubId }: { clubId: string }) {
  const t = useTranslations('CHAT');
  const { createRoom, isCreating } = useRoomActions();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const valid = name.trim().length >= MIN_NAME;

  const submit = async () => {
    if (!valid || isCreating) return;
    if (await createRoom(clubId, name.trim())) {
      setName('');
      setCreating(false);
    }
  };
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      e.preventDefault();
      void submit();
    } else if (e.key === 'Escape' && creating) {
      e.stopPropagation();
      setCreating(false);
    }
  };

  return (
    <div className="px-3 pb-3 pt-2 border-t border-[var(--border)]">
      {creating && (
        <div className="flex flex-col gap-2 pb-2">
          <input
            type="text"
            value={name}
            maxLength={MAX_NAME}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={t('new_room_name')}
            aria-label={t('new_room_name')}
            className="px-3 py-1.5 rounded-lg text-sm bg-[var(--color-surface)] text-[var(--color-ink)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-accent-500"
          />
          <button
            type="button"
            onClick={() => void submit()}
            disabled={!valid || isCreating}
            className="w-full py-2 rounded-lg text-sm font-medium bg-accent-500 text-white disabled:opacity-50"
          >
            {t('create_room')}
          </button>
        </div>
      )}
      <button
        type="button"
        onClick={() => {
          setCreating(!creating);
          setName('');
        }}
        className="w-full py-1.5 rounded-lg text-sm font-medium bg-[var(--color-surface)] text-[var(--color-ink-muted)] transition-colors"
      >
        {creating ? t('cancel') : `+ ${t('new_room')}`}
      </button>
    </div>
  );
}
