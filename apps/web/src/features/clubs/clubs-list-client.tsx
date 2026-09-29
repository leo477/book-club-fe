'use client';

import { useMutation } from '@tanstack/react-query';
import type { Club } from '@book-club/contracts';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { AppLink } from '@/components/app-link';
import { EmptyState } from '@/components/empty-state';
import { Spinner } from '@/components/ui/spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { ClubCard } from './club-card';
import { filterClubs, useMyClubs, usePublicClubs } from './use-clubs';
import { useSession } from './use-session';

type Tab = 'all' | 'my';

const GRID = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6';
const TAB_CLASS =
  'relative z-10 flex-none rounded-full px-7 py-2 h-auto text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] data-[state=active]:bg-[var(--color-surface-raised)] data-[state=active]:shadow-[var(--shadow-parchment)] data-[state=active]:font-semibold data-[state=active]:text-[var(--color-primary-700)] dark:data-[state=active]:text-[#fbbf24] dark:data-[state=active]:bg-[var(--color-surface-raised)] dark:data-[state=active]:border-transparent';

export function ClubsListClient({ initialClubs }: { initialClubs: readonly Club[] | null }) {
  const t = useTranslations('CLUBS');
  const { user } = useSession();
  const isAuthenticated = user !== null;
  const publicClubs = usePublicClubs(initialClubs);
  const myClubsQuery = useMyClubs(isAuthenticated);
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<Tab>('all');
  const [joiningId, setJoiningId] = useState<string | null>(null);

  const join = useMutation({
    mutationFn: (id: string) => api.clubs.join(id),
    onSettled: () => setJoiningId(null),
  });

  const clubs = publicClubs.data ?? [];
  const myClubs = myClubsQuery.data ?? [];
  const myIds = new Set(myClubs.map((c) => c.id));
  const ownedClubs = user ? clubs.filter((c) => c.organizerId === user.id) : [];
  const ownedIds = new Set(ownedClubs.map((c) => c.id));
  const filtered = filterClubs(clubs, query);
  const isLoading = publicClubs.isLoading;
  const error = publicClubs.isError ? t('load_error') : myClubsQuery.isError ? t('load_my_error') : null;

  const onJoin = (club: Club) => {
    setJoiningId(club.id);
    join.mutate(club.id);
  };

  const renderList = (list: readonly Club[]) => (
    <ul className={GRID}>
      {list.map((club) => (
        <li key={club.id} data-testid="club-card">
          <ClubCard
            club={club}
            isMember={isAuthenticated && myIds.has(club.id)}
            isOwned={isAuthenticated && ownedIds.has(club.id)}
            isAuthenticated={isAuthenticated}
            joining={joiningId === club.id}
            onJoin={() => onJoin(club)}
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

        {isAuthenticated ? (
          <Tabs value={tab} onValueChange={(value) => setTab(value as Tab)} className="gap-0">
            <div className="flex justify-center">
              <TabsList
                aria-label="Club filter"
                className="h-auto rounded-full p-1 bg-[var(--color-surface-sunken)] border border-[var(--color-sepia)] shadow-inner"
              >
                <TabsTrigger value="all" className={TAB_CLASS}>
                  {t('all')}
                </TabsTrigger>
                <TabsTrigger value="my" className={cn(TAB_CLASS, 'gap-1.5')}>
                  {t('my_clubs')}
                  {myClubs.length > 0 && (
                    <span
                      className={cn(
                        'inline-flex items-center justify-center h-4 min-w-[1rem] px-1 rounded-full text-[10px] font-bold leading-none',
                        tab === 'my'
                          ? 'bg-[var(--color-primary-600)] text-white'
                          : 'bg-[var(--color-ink-muted)]/20 text-[var(--color-ink-muted)]',
                      )}
                    >
                      {myClubs.length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="all" className="pt-6 text-base">
              {allPanel}
            </TabsContent>
            <TabsContent value="my" className="pt-6 text-base">
              {isLoading ? (
                spinner
              ) : myClubs.length === 0 ? (
                <EmptyState icon="📚" title={t('no_clubs')} description={t('my_clubs_empty_desc')} />
              ) : (
                renderList(myClubs)
              )}
            </TabsContent>
          </Tabs>
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
