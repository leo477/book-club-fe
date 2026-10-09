'use client';
'use no memo';

import { useQueryClient } from '@tanstack/react-query';
import type { Club } from '@book-club/contracts';
import { useTranslations } from 'next-intl';
import { useId, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { clubKey } from '@/features/club-detail/use-club-detail';
import { invalidateEvents } from '@/features/events/use-events';
import { invalidateClub } from '@/features/organizer/use-organizer';
import { api } from '@/lib/api';
import { useGuardedRunner } from './use-club-manage';

/** Pause, reschedule and cancel; cancelling asks for an inline confirmation first, as in the Angular screen. */
export function StatusActions({ clubId }: { clubId: string }) {
  const t = useTranslations('CLUB_DETAIL');
  const tManage = useTranslations('CLUB_MANAGE');
  const queryClient = useQueryClient();
  const { run, busy } = useGuardedRunner();
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const [date, setDate] = useState('');
  const dateId = useId();

  const apply = (key: string, call: () => Promise<Club>) =>
    run(key, async () => {
      const updated = await call();
      queryClient.setQueryData(clubKey(clubId), updated);
      void Promise.all([invalidateClub(queryClient, clubId), invalidateEvents(queryClient)]);
    });

  const cancel = async () => {
    setConfirmCancel(false);
    await apply('cancel', () => api.clubs.cancel(clubId));
  };

  const reschedule = async () => {
    const parsed = new Date(date);
    if (!date || Number.isNaN(parsed.getTime())) return;
    const done = await apply('reschedule', () => api.clubs.reschedule(clubId, parsed.toISOString()));
    if (done) {
      setShowReschedule(false);
      setDate('');
    }
  };

  const working = busy.size > 0;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" disabled={working} onClick={() => void apply('pause', () => api.clubs.pause(clubId))}>
          {t('pause')}
        </Button>
        <Button type="button" variant="outline" size="sm" aria-expanded={showReschedule} onClick={() => setShowReschedule((v) => !v)}>
          {t('reschedule')}
        </Button>
        {confirmCancel ? (
          <span className="inline-flex items-center gap-2">
            <Button type="button" variant="destructive" size="sm" disabled={working} onClick={() => void cancel()}>
              {t('delete_club_yes')}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setConfirmCancel(false)}>
              {t('cancel')}
            </Button>
          </span>
        ) : (
          <Button type="button" variant="outline" size="sm" className="text-orange-600" disabled={working} onClick={() => setConfirmCancel(true)}>
            {tManage('cancel_club')}
          </Button>
        )}
      </div>

      {showReschedule && (
        <div className="flex flex-wrap items-center gap-2">
          <Input id={dateId} type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} aria-label={t('reschedule')} className="w-auto" />
          <Button type="button" size="sm" disabled={!date || working} onClick={() => void reschedule()} className="bg-primary-600 text-white">
            {t('reschedule_submit')}
          </Button>
        </div>
      )}
    </div>
  );
}
