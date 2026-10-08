'use client';

import type { Submission, SubmissionStatus } from '@book-club/contracts';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useToggleLike } from './use-support';

type BadgeVariant = 'outline' | 'warning' | 'secondary' | 'success' | 'destructive';

const STATUS_VARIANT: Record<SubmissionStatus, BadgeVariant> = {
  open: 'outline',
  pending: 'warning',
  in_progress: 'secondary',
  approved: 'success',
  done: 'success',
  rejected: 'destructive',
};

const NEXT_STATUS: Partial<Record<SubmissionStatus, 'in_progress' | 'done'>> = { approved: 'in_progress', in_progress: 'done' };

const ACTION = 'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-2';
const PRIMARY = `${ACTION} bg-[var(--color-primary-600)] text-white hover:bg-[var(--color-primary-700)] focus-visible:ring-[var(--color-primary-500)]`;

interface Props {
  submission: Submission;
  isAdmin?: boolean;
  onApprove?: (submission: Submission) => void;
  onReject?: (submission: Submission) => void;
  onAdvance?: (submission: Submission) => void;
}

export function SubmissionCard({ submission, isAdmin = false, onApprove, onReject, onAdvance }: Props) {
  const t = useTranslations('SUPPORT');
  const toggleLike = useToggleLike();
  const canLike = submission.type !== 'suggestion';
  const next = NEXT_STATUS[submission.status];

  return (
    <Card className="parchment-card">
      <CardHeader className="gap-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-medium break-words">{submission.title}</h3>
          <Badge variant={STATUS_VARIANT[submission.status]} className="shrink-0">
            {t(`status_${submission.status}`)}
          </Badge>
        </div>
        <p className="text-xs text-[var(--color-ink-muted)]">{t(`type_${submission.type}`)}</p>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-[var(--color-ink)] whitespace-pre-line break-words">{submission.body}</p>
      </CardContent>
      {canLike && (
        <div className="px-6 pb-2">
          <button
            type="button"
            onClick={() => toggleLike.mutate({ id: submission.id, liked: submission.likedByMe })}
            data-testid="support-like"
            aria-pressed={submission.likedByMe}
            aria-label={t('reaction_toggle')}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-500)] focus-visible:ring-offset-2',
              submission.likedByMe
                ? 'border-transparent bg-[var(--color-accent-500)]/15 text-[var(--color-accent-700)] dark:text-[var(--color-accent-300)]'
                : 'border-[var(--color-ink-muted)]/30 text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-raised)]',
            )}
          >
            <span aria-hidden="true">{submission.type === 'complaint' ? '😠' : '👍'}</span>
            <span>{submission.likeCount}</span>
          </button>
        </div>
      )}
      {isAdmin && (
        <CardFooter className="flex-wrap gap-2">
          {submission.status === 'pending' ? (
            <>
              <button type="button" onClick={() => onApprove?.(submission)} data-testid="support-approve" className={PRIMARY}>
                {t('action_approve')}
              </button>
              <button
                type="button"
                onClick={() => onReject?.(submission)}
                data-testid="support-reject"
                className={`${ACTION} border border-red-300 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20 focus-visible:ring-red-500`}
              >
                {t('action_reject')}
              </button>
            </>
          ) : (
            next && (
              <button type="button" onClick={() => onAdvance?.(submission)} data-testid="support-advance" className={PRIMARY}>
                {t(`action_move_to_${next}`)}
              </button>
            )
          )}
        </CardFooter>
      )}
    </Card>
  );
}
