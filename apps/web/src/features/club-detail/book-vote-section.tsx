'use client';
'use no memo';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AddBookOptionRequest, BookOption, BookVoteRound } from '@book-club/contracts';
import { useTranslations } from 'next-intl';
import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { toastError, voteKey } from './use-club-detail';

const ITEM = 'flex flex-col gap-1.5 rounded-xl p-3 border';

function percent(votes: number, total: number): number {
  return total > 0 ? Math.round((votes / total) * 100) : 0;
}

// the backend allows one vote per round: voting for one option moves the vote off the previously voted one
function withVote(round: BookVoteRound, optionId: string, voted: boolean): BookVoteRound {
  const hadVote = round.options.some((o) => o.hasVoted);
  return {
    ...round,
    totalVotes: Math.max(0, round.totalVotes + (voted ? (hadVote ? 0 : 1) : -1)),
    options: round.options.map((o) => {
      if (o.id === optionId) return { ...o, hasVoted: voted, votes: Math.max(0, o.votes + (voted ? 1 : -1)) };
      return voted && o.hasVoted ? { ...o, hasVoted: false, votes: Math.max(0, o.votes - 1) } : o;
    }),
  };
}

export function BookVoteSection({ clubId, isOwner, isMember }: { clubId: string; isOwner: boolean; isMember: boolean }) {
  const t = useTranslations('BOOK_VOTE');
  const tErrors = useTranslations('ERRORS');
  const queryClient = useQueryClient();
  const key = voteKey(clubId);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [addError, setAddError] = useState('');

  const query = useQuery({ queryKey: key, queryFn: () => api.bookVote.currentRound(clubId), refetchOnWindowFocus: false });
  const round = query.data ?? null;

  const invalidate = () => queryClient.invalidateQueries({ queryKey: key });
  const onError = (err: unknown) => toastError(err, tErrors);

  const run = useMutation({
    mutationFn: (action: () => Promise<unknown>) => action(),
    onSuccess: invalidate,
    onError,
  });

  const toggle = useMutation({
    mutationFn: (option: BookOption) => (option.hasVoted ? api.bookVote.unvote(clubId, option.id) : api.bookVote.vote(clubId, option.id)),
    onMutate: async (option) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<BookVoteRound | null>(key);
      if (previous) queryClient.setQueryData(key, withVote(previous, option.id, !option.hasVoted));
      return { previous };
    },
    onError: (err, _option, context) => {
      queryClient.setQueryData(key, context?.previous ?? null);
      onError(err);
    },
    onSettled: invalidate,
  });

  const busy = run.isPending || toggle.isPending;

  const addOption = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return setAddError(t('title_required_error'));
    if (!round) return;
    setAddError('');
    const body: AddBookOptionRequest = { title: trimmed, author };
    run.mutate(() => api.bookVote.addOption(clubId, round.id, body), {
      onSuccess: () => {
        setTitle('');
        setAuthor('');
      },
    });
  };

  if (query.isPending) {
    return (
      <section className="parchment-card px-6 py-5 flex flex-col gap-3" aria-busy="true">
        <div className="h-4 w-48 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
        <div className="h-16 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse" />
      </section>
    );
  }
  if (!round && !isOwner) return null;

  const total = round?.totalVotes ?? 0;
  const newRound = () => run.mutate(() => api.bookVote.createRound(clubId));

  const meta = (option: BookOption) => (
    <p className="text-[11px] text-[var(--color-ink-muted)]">
      {option.votes} {t('votes', { count: option.votes })} · {percent(option.votes, total)}%
    </p>
  );

  return (
    <section className="parchment-card px-6 py-5 flex flex-col gap-4" aria-labelledby="book-vote-title">
      <div className="flex items-center justify-between">
        <h2 id="book-vote-title" className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          📚 {t('section_title')}
        </h2>
        {isOwner && round?.status === 'open' && (
          <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => run.mutate(() => api.bookVote.closeRound(clubId, round.id))}>
            {t('close_round')}
          </Button>
        )}
        {isOwner && round?.status === 'closed' && (
          <Button type="button" size="sm" disabled={busy} onClick={newRound}>
            {t('new_round')}
          </Button>
        )}
      </div>

      {!round && (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <p className="text-sm text-[var(--color-ink-muted)]">{t('no_round_prompt')}</p>
          <Button type="button" size="sm" disabled={busy} onClick={newRound}>
            {t('start_round')}
          </Button>
        </div>
      )}

      {round?.status === 'open' && (
        <>
          {round.options.length === 0 ? (
            <p className="text-sm text-[var(--color-ink-muted)] text-center py-4">{t('no_options_prompt')}</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {round.options.map((option) => (
                <li key={option.id} className={`${ITEM} bg-[var(--color-surface-sunken)] border-[var(--color-sepia)]`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-display font-semibold text-sm text-[var(--color-ink)] leading-snug truncate">{option.title}</p>
                      {option.author && <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">{option.author}</p>}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {(isMember || isOwner) && (
                        <Button
                          type="button"
                          size="sm"
                          variant={option.hasVoted ? 'default' : 'outline'}
                          aria-pressed={option.hasVoted}
                          disabled={busy}
                          onClick={() => toggle.mutate(option)}
                          className="text-xs"
                        >
                          {option.hasVoted ? `✓ ${t('voted')}` : t('vote')}
                          {' '}
                          <span className="sr-only">— {option.title}</span>
                        </Button>
                      )}
                      {isOwner && option.votes === 0 && (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => run.mutate(() => api.bookVote.removeOption(clubId, option.id))}
                          className="text-[var(--color-ink-muted)] hover:text-red-600 dark:hover:text-red-400 transition-colors duration-150 p-1 rounded focus-visible:outline-2"
                          aria-label={`${t('remove_option_aria')}: ${option.title}`}
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full bg-[var(--color-surface-raised)] overflow-hidden">
                    <div className="h-full rounded-full bg-[var(--color-primary-600)] transition-all duration-500" style={{ width: `${percent(option.votes, total)}%` }} />
                  </div>
                  {meta(option)}
                </li>
              ))}
            </ul>
          )}

          {isOwner && (
            <form onSubmit={addOption} className="border-t border-[var(--color-sepia)] pt-4 flex flex-col gap-2" noValidate>
              <p className="text-xs font-semibold text-[var(--color-ink-muted)] uppercase tracking-wide">{t('add_book_heading')}</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t('title_placeholder')}
                  aria-label={t('title_aria')}
                  aria-invalid={addError ? true : undefined}
                  aria-describedby={addError ? 'book-vote-add-error' : undefined}
                  className="flex-1 min-w-0 parchment-input rounded-lg px-3 py-2 text-sm"
                />
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder={t('author_placeholder')}
                  aria-label={t('author_aria')}
                  className="flex-1 min-w-0 parchment-input rounded-lg px-3 py-2 text-sm"
                />
                <Button type="submit" size="sm" disabled={busy} className="flex-shrink-0">
                  {t('add_button')}
                </Button>
              </div>
              {addError && (
                <p id="book-vote-add-error" className="text-xs text-red-600 dark:text-red-400">
                  {addError}
                </p>
              )}
            </form>
          )}
        </>
      )}

      {round?.status === 'closed' && (
        <>
          <ul className="flex flex-col gap-3">
            {[...round.options]
              .sort((a, b) => b.votes - a.votes)
              .map((option) => {
                const won = option.id === round.winnerId;
                return (
                  <li
                    key={option.id}
                    className={`${ITEM} transition-colors ${
                      won
                        ? 'bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-900)]/20 border-[var(--color-primary-400)] ring-1 ring-[var(--color-primary-400)]'
                        : 'bg-[var(--color-surface-sunken)] border-[var(--color-sepia)]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-display font-semibold text-sm text-[var(--color-ink)] leading-snug truncate">{option.title}</p>
                        {option.author && <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">{option.author}</p>}
                      </div>
                      {won && (
                        <span className="flex-shrink-0 text-xs font-bold text-[var(--color-primary-700)] dark:text-[#fbbf24] bg-[var(--color-primary-100)] dark:bg-[var(--color-primary-900)]/40 border border-[var(--color-primary-300)] dark:border-[var(--color-primary-700)]/60 rounded-full px-2.5 py-0.5">
                          🏆 {t('winner_badge')}
                        </span>
                      )}
                    </div>
                    <div className="h-1.5 rounded-full bg-[var(--color-surface-raised)] overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${won ? 'bg-[var(--color-primary-500)]' : 'bg-[var(--color-ink-muted)]/40'}`}
                        style={{ width: `${percent(option.votes, total)}%` }}
                      />
                    </div>
                    {meta(option)}
                  </li>
                );
              })}
          </ul>
          {round.options.length === 0 && <p className="text-sm text-[var(--color-ink-muted)] text-center py-4">{t('no_options_closed')}</p>}
        </>
      )}
    </section>
  );
}
