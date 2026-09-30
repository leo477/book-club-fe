'use client';
'use no memo';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Club, ClubEvent } from '@book-club/contracts';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { AppLink } from '@/components/app-link';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/lib/api';
import { showToast } from '@/lib/toast';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { describeError } from './describe-error';
import { EventCard } from './event-card';
import { EVENTS_EMPTY, EVENTS_GRID, EventsFrame } from './events-static';
import { isUpcoming } from './structured-data';
import { eventsKey, pastEventsKey, toastError, useClubEvents, useClubMembers, useClubRole } from './use-club-detail';

type Tab = 'upcoming' | 'history';
type SortKey = 'date' | 'popular' | 'status';

const SORTS: readonly { key: SortKey; labelKey: string }[] = [
  { key: 'date', labelKey: 'sort_nearest' },
  { key: 'popular', labelKey: 'sort_popular' },
  { key: 'status', labelKey: 'sort_status' },
];
const STATUS_ORDER: Record<string, number> = { active: 0, scheduled: 1, rescheduled: 2 };

function sortEvents(events: readonly ClubEvent[], key: SortKey): ClubEvent[] {
  const list = [...events];
  if (key === 'popular') return list.sort((a, b) => b.attendeeCount - a.attendeeCount);
  if (key === 'status') return list.sort((a, b) => (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9));
  return list.sort((a, b) => a.date.localeCompare(b.date));
}

const patchAttendance = (events: ClubEvent[] | undefined, eventId: string, attending: boolean) =>
  events?.map((e) => (e.id === eventId ? { ...e, isAttending: attending, attendeeCount: e.attendeeCount + (attending ? 1 : -1) } : e));

interface ClubEventsProps {
  club: Pick<Club, 'id' | 'organizerId'>;
  initialEvents: readonly ClubEvent[];
}

export function ClubEventsInteractive({ club, initialEvents }: ClubEventsProps) {
  const t = useTranslations('CLUB_DETAIL');
  const tEvent = useTranslations('EVENT');
  const tEvents = useTranslations('EVENTS');
  const tRsvp = useTranslations('events.rsvp');
  const tErrors = useTranslations('ERRORS');
  const queryClient = useQueryClient();
  const role = useClubRole(club);
  const [tab, setTab] = useState<Tab>('upcoming');
  const [sort, setSort] = useState<SortKey>('date');
  const [winnerEventId, setWinnerEventId] = useState<string | null>(null);

  const events = useClubEvents(club.id, initialEvents, role.isAuthenticated);
  const upcoming = events.filter(isUpcoming);
  const liveKey = eventsKey(club.id, true);

  const past = useQuery({
    queryKey: pastEventsKey(club.id),
    queryFn: () => api.clubs.events(club.id, true),
    enabled: tab === 'history',
    refetchOnWindowFocus: false,
    select: (all) => {
      const now = new Date().toISOString();
      return all.filter((e) => e.date < now).sort((a, b) => b.date.localeCompare(a.date));
    },
  });
  const members = useClubMembers(club.id, role.isOwner && tab === 'history');

  const attend = useMutation({
    mutationFn: async ({ eventId, attending }: { eventId: string; attending: boolean }): Promise<void> => {
      if (attending) await api.events.attend(eventId);
      else await api.events.cancelAttendance(eventId);
    },
    onMutate: async ({ eventId, attending }) => {
      await queryClient.cancelQueries({ queryKey: liveKey });
      const previous = queryClient.getQueryData<ClubEvent[]>(liveKey);
      queryClient.setQueryData<ClubEvent[]>(liveKey, patchAttendance(previous ?? [...initialEvents], eventId, attending));
      return { previous };
    },
    onError: (err, _vars, context) => {
      queryClient.setQueryData(liveKey, context?.previous);
      showToast('error', describeError(err, tErrors));
    },
  });
  const attendingId = attend.isPending ? attend.variables.eventId : null;

  const setWinner = useMutation({
    mutationFn: ({ eventId, memberId }: { eventId: string; memberId: string }) => api.events.setWinner(eventId, memberId),
    onMutate: async ({ eventId, memberId }) => {
      await queryClient.cancelQueries({ queryKey: pastEventsKey(club.id) });
      const previous = queryClient.getQueryData<ClubEvent[]>(pastEventsKey(club.id));
      const name = members.data?.find((m) => m.userId === memberId)?.displayName ?? null;
      queryClient.setQueryData<ClubEvent[]>(pastEventsKey(club.id), (list) =>
        list?.map((e) => (e.id === eventId ? { ...e, winnerId: memberId, winnerName: name } : e)),
      );
      return { previous };
    },
    onSuccess: () => setWinnerEventId(null),
    onError: (err, _vars, context) => {
      queryClient.setQueryData(pastEventsKey(club.id), context?.previous);
      toastError(err, tErrors);
    },
  });

  const card = (event: ClubEvent, isAttending: boolean) => {
    const rsvp = (attending: boolean) => attend.mutate({ eventId: event.id, attending });
    let actions: ReactNode = null;
    if (role.user?.id === event.organizerId) {
      actions = <span className="text-xs font-semibold text-[var(--color-primary-600)] dark:text-[#fbbf24]">{tEvents('organizer_badge')}</span>;
    } else if (role.isAuthenticated && event.status !== 'cancelled' && event.status !== 'held') {
      actions = (
        <Button
          type="button"
          size="sm"
          data-testid="event-rsvp-button"
          disabled={isAttending}
          onClick={() => rsvp(!event.isAttending)}
          className={event.isAttending ? 'bg-[var(--color-accent-600)] hover:bg-[var(--color-accent-700)] text-white' : 'bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)] text-white'}
        >
          {isAttending ? <Spinner className="text-xs" /> : event.isAttending ? `${tRsvp('attending')} · ${tRsvp('cancel')}` : tRsvp('join')}
        </Button>
      );
    }
    return <EventCard event={event} actions={actions} />;
  };

  return (
    <EventsFrame
      action={
        role.isOwner && (
          <Button asChild size="sm">
            <AppLink href={`/clubs/${club.id}/events/create`}>{t('create_event')}</AppLink>
          </Button>
        )
      }
    >

      <Tabs value={tab} onValueChange={(value) => setTab(value as Tab)}>
        <TabsList className="mb-4">
          <TabsTrigger value="upcoming">{t('events_tab_upcoming')}</TabsTrigger>
          <TabsTrigger value="history">{t('events_tab_history')}</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          {upcoming.length > 1 && (
            <div className="flex flex-wrap gap-2 mb-5" role="group" aria-label={t('events_title')}>
              {SORTS.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  aria-pressed={sort === option.key}
                  onClick={() => setSort(option.key)}
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-medium border transition-colors',
                    sort === option.key
                      ? 'bg-[var(--color-primary-600)] text-white border-[var(--color-primary-600)] shadow-sm'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-primary-400 dark:hover:border-primary-600',
                  )}
                >
                  {t(option.labelKey)}
                </button>
              ))}
            </div>
          )}
          {upcoming.length === 0 ? (
            <p className={EVENTS_EMPTY}>{t('events_empty')}</p>
          ) : (
            <ul className={EVENTS_GRID}>
              {sortEvents(upcoming, sort).map((event) => (
                <li key={event.id}>{card(event, attendingId === event.id)}</li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="history">
          {past.isPending ? (
            <p className={EVENTS_EMPTY}>{t('events_loading')}</p>
          ) : !past.data || past.data.length === 0 ? (
            <p className={EVENTS_EMPTY}>{t('events_history_empty')}</p>
          ) : (
            <ul className={EVENTS_GRID}>
              {past.data.map((event) => (
                <li key={event.id} className="flex flex-col gap-2">
                  {card(event, false)}
                  {event.hasWinner && event.winnerId && <p className="text-xs text-[var(--color-primary-500)] px-1">🏆 {event.winnerName}</p>}
                  {role.isOwner && event.hasWinner && !event.winnerId &&
                    (winnerEventId === event.id ? (
                      <div className="flex flex-col gap-1 px-1">
                        <select
                          className="w-full rounded-lg border border-[var(--color-sepia)] bg-[var(--color-surface)] px-3 py-1.5 text-sm text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
                          aria-label={tEvent('set_winner')}
                          disabled={setWinner.isPending}
                          value=""
                          onChange={(e) => e.target.value && setWinner.mutate({ eventId: event.id, memberId: e.target.value })}
                        >
                          <option value="">— {tEvent('set_winner')} —</option>
                          {members.data?.map((member) => (
                            <option key={member.userId} value={member.userId}>
                              {member.displayName}
                            </option>
                          ))}
                        </select>
                        <Button type="button" variant="ghost" size="sm" className="self-start text-xs text-[var(--color-ink-muted)]" aria-label={tErrors('dismiss')} onClick={() => setWinnerEventId(null)}>
                          ✕
                        </Button>
                      </div>
                    ) : (
                      <Button type="button" variant="outline" size="sm" className="self-start mx-1 text-xs" onClick={() => setWinnerEventId(event.id)}>
                        🏆 {tEvent('set_winner')}
                      </Button>
                    ))}
                </li>
              ))}
            </ul>
          )}
        </TabsContent>
      </Tabs>
    </EventsFrame>
  );
}
