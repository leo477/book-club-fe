'use client';
'use no memo';

import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import { AppLink } from '@/components/app-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { describeError } from '@/features/club-detail/describe-error';
import { api } from '@/lib/api';
import { isAbort, useMounted } from './use-club-manage';

const ROOM_NAME_MAX = 40;

/** Creates a chat room; the chat widget itself is not ported yet, so success links to the chats page instead of opening it. */
export function ChatRoomForm({ clubId }: { clubId: string }) {
  const t = useTranslations('CLUB_DETAIL');
  const tChat = useTranslations('CHAT');
  const tErrors = useTranslations('ERRORS');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState(false);
  const submitting = useRef(false);
  const isMounted = useMounted();

  const create = async () => {
    const trimmed = name.trim();
    if (!trimmed || submitting.current) return;
    submitting.current = true;
    setError(null);
    setCreated(false);
    try {
      await api.chat.createClubRoom(clubId, trimmed);
      if (!isMounted()) return;
      setName('');
      setCreated(true);
    } catch (err) {
      if (isMounted() && !isAbort(err)) setError(describeError(err, tErrors));
    } finally {
      submitting.current = false;
    }
  };

  return (
    <section className="parchment-card p-4">
      <h2 className="text-xs font-semibold text-[var(--color-ink-muted)] uppercase tracking-wide mb-2">
        <span aria-hidden="true">💬 </span>
        {t('chat_create_title')}
      </h2>
      <form
        className="flex flex-col sm:flex-row gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void create();
        }}
      >
        <Input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={t('chat_room_placeholder')} aria-label={t('chat_room_placeholder')} maxLength={ROOM_NAME_MAX} className="flex-1" />
        <Button type="submit" size="sm" disabled={!name.trim()} className="bg-primary-600 hover:bg-primary-700 text-white">
          {t('chat_create_btn')}
        </Button>
      </form>
      {error ? (
        <p role="alert" className="mt-1 text-xs text-red-500">
          {error}
        </p>
      ) : null}
      {created ? (
        <p role="status" className="mt-1 text-xs text-[var(--color-ink-muted)]">
          ✓{' '}
          <AppLink href="/chats" className="underline">
            {tChat('page_title')}
          </AppLink>
        </p>
      ) : null}
    </section>
  );
}
