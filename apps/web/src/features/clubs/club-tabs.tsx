'use client';

import type { ReactNode } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

const TAB_CLASS =
  'relative z-10 flex-none rounded-full px-7 py-2 h-auto text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] data-[state=active]:bg-[var(--color-surface-raised)] data-[state=active]:shadow-[var(--shadow-parchment)] data-[state=active]:font-semibold data-[state=active]:text-[var(--color-primary-700)] dark:data-[state=active]:text-[#fbbf24] dark:data-[state=active]:bg-[var(--color-surface-raised)] dark:data-[state=active]:border-transparent';

export type Tab = 'all' | 'my';

interface ClubTabsProps {
  tab: Tab;
  onTabChange: (tab: Tab) => void;
  allLabel: string;
  myLabel: string;
  myCount: number;
  all: ReactNode;
  my: ReactNode;
}

/** Loaded lazily (Radix Tabs) once the session resolves to a signed-in user. */
export default function ClubTabs({ tab, onTabChange, allLabel, myLabel, myCount, all, my }: ClubTabsProps) {
  return (
    <Tabs value={tab} onValueChange={(value) => onTabChange(value as Tab)} className="gap-0">
      <div className="flex justify-center">
        <TabsList
          aria-label="Club filter"
          className="h-auto rounded-full p-1 bg-[var(--color-surface-sunken)] border border-[var(--color-sepia)] shadow-inner"
        >
          <TabsTrigger value="all" className={TAB_CLASS}>
            {allLabel}
          </TabsTrigger>
          <TabsTrigger value="my" className={cn(TAB_CLASS, 'gap-1.5')}>
            {myLabel}
            {myCount > 0 && (
              <span
                className={cn(
                  'inline-flex items-center justify-center h-4 min-w-[1rem] px-1 rounded-full text-[10px] font-bold leading-none',
                  tab === 'my' ? 'bg-[var(--color-primary-600)] text-white' : 'bg-[var(--color-ink-muted)]/20 text-[var(--color-ink-muted)]',
                )}
              >
                {myCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="all" className="pt-6 text-base">
        {all}
      </TabsContent>
      <TabsContent value="my" className="pt-6 text-base">
        {my}
      </TabsContent>
    </Tabs>
  );
}
