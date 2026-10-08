'use client';
'use no memo';

import type { Submission, SubmissionStatus } from '@book-club/contracts';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { AppLink } from '@/components/app-link';
import { EmptyState } from '@/components/empty-state';
import { Spinner } from '@/components/ui/spinner';
import { useSession } from '@/features/clubs/use-session';
import { SubmissionCard } from './submission-card';
import { useSubmissions, useUpdateStatus } from './use-support';

const COLUMNS = ['pending', 'approved', 'in_progress', 'done', 'rejected'] as const satisfies readonly SubmissionStatus[];
const GRID = 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3';
const NO_ITEMS: Submission[] = [];

function Section({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-[var(--color-ink)]">{heading}</h2>
      {children}
    </section>
  );
}

export function SupportBoard() {
  const t = useTranslations('SUPPORT');
  const { user } = useSession();
  const query = useSubmissions();
  const updateStatus = useUpdateStatus();
  const items = query.data ?? NO_ITEMS;
  const isAdmin = user?.role === 'admin';

  const complaints = items.filter((s) => s.type === 'complaint');
  const comments = items.filter((s) => s.type === 'comment');
  const suggestions = items.filter((s) => s.type === 'suggestion');

  // a failed status change is swallowed: the client already toasts 5xx and timeouts
  const move = (s: Submission, status: 'approved' | 'rejected' | 'in_progress' | 'done') => updateStatus.mutate({ id: s.id, status });
  const advance = (s: Submission) => {
    if (s.status === 'approved') move(s, 'in_progress');
    else if (s.status === 'in_progress') move(s, 'done');
  };

  const list = (group: Submission[], icon: string, key: 'complaints' | 'comments') =>
    group.length === 0 ? (
      <EmptyState icon={icon} title={t(`empty_${key}_title`)} description={t(`empty_${key}_desc`)} />
    ) : (
      <div className={GRID}>
        {group.map((item) => (
          <SubmissionCard key={item.id} submission={item} />
        ))}
      </div>
    );

  return (
    <div className="page-max-w px-4 sm:px-6 py-6 space-y-8">
      <header className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white">💬 {t('title')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">{t('subtitle')}</p>
        </div>
        <AppLink
          href="/support/new"
          data-testid="support-new"
          className="rounded-lg bg-gradient-brand px-4 py-2 text-sm font-medium text-white transition-all hover:opacity-90 outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-500)] focus-visible:ring-offset-2"
        >
          {t('new_btn')}
        </AppLink>
      </header>

      {query.isPending ? (
        <div className="flex justify-center py-16">
          <Spinner aria-label={t('loading')} />
        </div>
      ) : (
        <>
          <Section heading={t('complaints_heading')}>{list(complaints, '😠', 'complaints')}</Section>
          <Section heading={t('comments_heading')}>{list(comments, '💬', 'comments')}</Section>
          <Section heading={t('suggestions_heading')}>
            {suggestions.length === 0 ? (
              <EmptyState icon="💡" title={t('empty_suggestions_title')} description={t('empty_suggestions_desc')} />
            ) : (
              <div className="overflow-x-auto pb-2 -mx-4 px-4">
                <div className="flex gap-4 md:grid md:grid-cols-5 md:gap-4">
                  {COLUMNS.map((status) => {
                    const column = suggestions.filter((s) => s.status === status);
                    return (
                      <div key={status} className="flex w-72 shrink-0 flex-col gap-3 md:w-auto">
                        <div className="flex items-center justify-between rounded-lg bg-[var(--color-surface-raised)] px-3 py-2">
                          <span className="text-sm font-semibold text-[var(--color-ink)]">{t(`status_${status}`)}</span>
                          <span className="text-xs text-[var(--color-ink-muted)]">{column.length}</span>
                        </div>
                        <div className="flex flex-col gap-3">
                          {column.map((item) => (
                            <SubmissionCard key={item.id} submission={item} isAdmin={isAdmin} onApprove={(s) => move(s, 'approved')} onReject={(s) => move(s, 'rejected')} onAdvance={advance} />
                          ))}
                          {column.length === 0 && <p className="px-1 text-xs text-[var(--color-ink-muted)]">{t('column_empty')}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </Section>
        </>
      )}
    </div>
  );
}
