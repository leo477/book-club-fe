'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

interface Props {
  attending: boolean;
  loading?: boolean;
  closed?: boolean;
  /** the attending state also names the cancel action (detail page) */
  showCancel?: boolean;
  size?: 'default' | 'sm' | 'lg';
  /** names the event for screen readers when several buttons share a page */
  label?: string;
  onClick: () => void;
}

export function RsvpButton({ attending, loading = false, closed = false, showCancel = false, size = 'sm', label, onClick }: Props) {
  const t = useTranslations('events.rsvp');
  const tEvents = useTranslations('EVENTS');
  const tone = attending
    ? 'bg-[var(--color-accent-600)] hover:bg-[var(--color-accent-700)] text-white'
    : 'bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)] text-white';
  return (
    <Button type="button" size={size} data-testid="event-rsvp-button" disabled={loading || closed} aria-busy={loading || undefined} onClick={onClick} className={tone}>
      {loading ? (
        <>
          <Spinner aria-hidden="true" className="text-xs" />
          <span className="sr-only">{tEvents('rsvp_loading')}</span>
        </>
      ) : closed ? (
        tEvents('registration_closed')
      ) : attending ? (
        showCancel ? `${t('attending')} · ${t('cancel')}` : t('attending')
      ) : (
        t('join')
      )}
      {label && <span className="sr-only"> — {label}</span>}
    </Button>
  );
}
