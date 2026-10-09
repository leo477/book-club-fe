'use client';
'use no memo';

import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { invalidateEvents } from '@/features/events/use-events';
import { api } from '@/lib/api';
import { usePush } from '@/lib/use-push';
import { useGuardedRunner } from '@/features/club-shared/guarded-runner';

/** Deleting asks for an inline confirmation; once the club is gone the button stays disabled while the page leaves. */
export function DeleteClub({ clubId }: { clubId: string }) {
  const t = useTranslations('CLUB_DETAIL');
  const queryClient = useQueryClient();
  const push = usePush();
  const { run, busy, isMounted } = useGuardedRunner();
  const [confirming, setConfirming] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const deleting = busy.has('delete') || deleted;

  const remove = async () => {
    const done = await run('delete', async () => {
      await api.clubs.remove(clubId);
      queryClient.removeQueries({ queryKey: ['club', clubId] });
      void Promise.all([queryClient.invalidateQueries({ queryKey: ['clubs'] }), invalidateEvents(queryClient)]);
    });
    if (done && isMounted()) {
      setDeleted(true);
      push('/clubs');
    }
  };

  return (
    <div className="border-t border-red-500/20 pt-4">
      {confirming ? (
        <div className="space-y-2">
          <p className="text-xs text-red-600 dark:text-red-400 font-semibold">{t('delete_club_confirm')}</p>
          <div className="flex gap-2">
            <Button type="button" variant="destructive" size="sm" disabled={deleting} onClick={() => void remove()}>
              {t('delete_club_yes')}
            </Button>
            <Button type="button" variant="outline" size="sm" disabled={deleting} onClick={() => setConfirming(false)}>
              {t('cancel')}
            </Button>
          </div>
        </div>
      ) : (
        <Button type="button" variant="destructive" size="sm" onClick={() => setConfirming(true)}>
          <span aria-hidden="true">🗑 </span>
          {t('delete_club_btn')}
        </Button>
      )}
    </div>
  );
}
