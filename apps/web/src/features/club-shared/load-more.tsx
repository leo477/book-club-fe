'use client';
'use no memo';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

interface LoadMoreProps {
  hasNextPage: boolean;
  isFetching: boolean;
  failed: boolean;
  onLoadMore: () => void;
}

export function LoadMore({ hasNextPage, isFetching, failed, onLoadMore }: LoadMoreProps) {
  const t = useTranslations('PAGINATION');
  if (!hasNextPage) return null;
  return (
    <div className="mt-4 flex flex-col items-center gap-2" aria-busy={isFetching}>
      <p role="status" className="sr-only">
        {isFetching ? t('loading') : ''}
      </p>
      {failed && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {t('load_failed')}
        </p>
      )}
      <Button type="button" variant="outline" size="sm" disabled={isFetching} onClick={onLoadMore}>
        {isFetching ? t('loading') : t('load_more')}
      </Button>
    </div>
  );
}
