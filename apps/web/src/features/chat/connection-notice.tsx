'use client';

import { useTranslations } from 'next-intl';
import type { ChatSocketStatus } from '@book-club/api-client/ws';

/** Live updates are down: a quiet note while it retries, and a retry control once the client has given up. */
export function ConnectionNotice({ status, onRetry, className }: { status: ChatSocketStatus; onRetry: () => void; className?: string }) {
  const t = useTranslations('CHAT');
  if (status === 'reconnecting') {
    return (
      <p role="status" className={className}>
        {t('reconnecting')}
      </p>
    );
  }
  if (status !== 'closed' && status !== 'stopped') return null;
  return (
    <p role="status" className={className}>
      {t(status === 'stopped' ? 'connection_stopped' : 'connection_lost')}{' '}
      <button type="button" onClick={onRetry} className="underline font-medium">
        {t('retry')}
      </button>
    </p>
  );
}
