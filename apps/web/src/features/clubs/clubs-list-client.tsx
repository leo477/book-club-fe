'use client';

import { useMutation, useMutationState, useQueryClient } from '@tanstack/react-query';
import type { Club } from '@book-club/contracts';
import { useTranslations } from 'next-intl';
import { lazy, Suspense, useState } from 'react';
import { AppLink } from '@/components/app-link';
import { EmptyState } from '@/components/empty-state';
import { Spinner } from '@/components/ui/spinner';
import { LazyBoundary } from '@/components/lazy-boundary';
import { api } from '@/lib/api';
import { trackEvent } from '@/lib/analytics';
import { ClubCard } from './club-card';
import type { Tab } from './club-tabs';
import { filterClubs, myClubsKey, useMyClubs, usePublicClubs } from './use-clubs';
import { useSession } from './use-session';

const GRID = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6';
// same height as the rendered tablist (p-1 + border + py-2 triggers) so the grid does not jump when the tabs arrive
const TABLIST_PLACEHOLDER = <div className="h-12" aria-hidden="true" data-testid="tablist-placeholder" />;

// Radix Tabs is only needed by signed-in users, so its chunk is fetched after the session resolves
const ClubTabs = lazy(() => import('./club-tabs'));
const JOIN_KEY = ['clubs', 'join'] as const;

export function ClubsListClient({ initialClubs }: { initialClubs: readonly Club[] | null }) {
  const t = useTranslations('CLUBS');
  const queryClient = useQueryClient();
  const { user, isPending: sessionPending } = useSession();
  const isAuthenticated = user !== null;
  const publicClubs = usePublicClubs(initialClubs);
  const myClubsQuery = useMyClubs(isAuthenticated);
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<Tab>('all');

  const join = useMutation({
    mutationKey: JOIN_KEY,
    mutationFn: (id: string) => api.clubs.join(id),
    // a pending request or a direct join changes what /clubs/my returns
    onSuccess: () => {
      trackEvent('join_club');
      return queryClient.invalidateQueries({ queryKey: myClubsKey });
    },
  });

  // one observer only tracks the latest mutate(), so concurrent joins are read from the mutation cache
  const joiningIds = useMutationState({ filters: { mutationKey: JOIN_KEY, status: 'pending' }, select: (m) => m.state.variables as string });

  const clubs = publicClubs.data ?? [];
  const myClubs = myClubsQuery.data ?? [];
  const myIds = new Set(myClubs.map((c) => c.id));
  const ownedClubs = user ? clubs.filter((c) => c.organizerId === user.id) : [];
  const ownedIds = new Set(ownedClubs.map((c) => c.id));
  const filtered = filterClubs(clubs, query);
  const isLoading = publicClubs.isLoading;
  const error = publicClubs.isError ? t('load_error') : myClubsQuery.isError ? t('load_my_error') : null;

  const renderList = (list: readonly Club[]) => (
    <ul className={GRID}>
      {list.map((club, index) => (
        <li key={club.id} data-testid="club-card">
          <ClubCard
            club={club}
            isMember={isAuthenticated && myIds.has(club.id)}
            isOwned={isAuthenticated && ownedIds.has(club.id)}
            isAuthenticated={isAuthenticated}
            sessionPending={sessionPending}
            priority={index < 4}
            joining={joiningIds.includes(club.id)}
            onJoin={() => join.mutate(club.id)}
          />
        </li>
      ))}
    </ul>
  );

  const spinner = (
    <div className="py-16 flex justify-center" aria-busy="true" aria-label="Loading clubs">
      <Spinner />
    </div>
  );

  const allPanel = isLoading ? (
    spinner
  ) : filtered.length === 0 ? (
    <EmptyState
      icon="📚"
      title={query.trim() ? t('empty_search_title') : t('empty_title')}
      description={query.trim() ? t('empty_search_desc') : t('empty_desc')}
    />
  ) : (
    renderList(filtered)
  );

  return (
    <div className="min-h-screen">
      <section aria-label="Search clubs" className="parchment-hero px-4 py-14 text-center">
        <div className="relative z-10">
          <h1 className="font-fantasy text-4xl font-bold tracking-widest uppercase text-[var(--color-ink)] mb-3 drop-shadow-sm">
            {t('title')}
          </h1>
          <p className="text-[var(--color-ink-muted)] font-display text-lg mb-12">{t('subtitle')}</p>
          <div className="mx-auto max-w-xl lg:max-w-2xl relative">
            <label htmlFor="club-search" className="sr-only">
              {t('search_placeholder')}
            </label>
            <input
              id="club-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('search_placeholder_full')}
              className="w-full parchment-input rounded-full px-5 py-3 text-sm"
              aria-label={t('search_placeholder')}
            />
          </div>
        </div>
      </section>

      <div className="page-container py-8 space-y-8">
        {error && (
          <div className="flex items-start gap-2 parchment-card px-4 py-3 text-sm text-red-700 dark:text-red-400" role="alert">
            <span aria-hidden="true">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {sessionPending ? (
          <>
            {TABLIST_PLACEHOLDER}
            <div className="pt-6">{allPanel}</div>
          </>
        ) : isAuthenticated ? (
          // if the tabs chunk cannot load, the plain list (all clubs) stays usable
          <LazyBoundary fallback={<div className="pt-6">{allPanel}</div>}>
            <Suspense
              fallback={
                <>
                  {TABLIST_PLACEHOLDER}
                  <div className="pt-6">{allPanel}</div>
                </>
              }
            >
              <ClubTabs
                tab={tab}
                onTabChange={setTab}
                allLabel={t('all')}
                myLabel={t('my_clubs')}
                myCount={myClubs.length}
                all={allPanel}
                my={
                  isLoading ? (
                    spinner
                  ) : myClubsQuery.isError ? null /* the banner already reports it; an empty state would mislead */ : myClubs.length === 0 ? (
                    <EmptyState icon="📚" title={t('no_clubs')} description={t('my_clubs_empty_desc')} />
                  ) : (
                    renderList(myClubs)
                  )
                }
              />
            </Suspense>
          </LazyBoundary>
        ) : (
          allPanel
        )}
      </div>

      {user?.role === 'organizer' && ownedClubs.length === 0 && (
        <AppLink
          href="/clubs/create"
          className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full fab-fantasy focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)] focus:ring-offset-2 transition-all duration-200"
          aria-label={t('create')}
          title={t('create')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </AppLink>
      )}
    </div>
  );
}
