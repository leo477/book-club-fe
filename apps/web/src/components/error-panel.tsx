'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

/** Localized, generic failure view: never renders the error message or stack, which can leak internals. */
export function ErrorPanel({ onRetry }: { onRetry: () => void }) {
  const t = useTranslations('ERRORS');
  return (
    <div role="alert" className="page-container py-24 text-center space-y-4">
      <p className="font-display text-lg text-[var(--color-ink)]">{t('unexpected')}</p>
      <Button type="button" onClick={onRetry}>
        {t('retry')}
      </Button>
    </div>
  );
}
