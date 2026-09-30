import type { Club, ClubEvent } from '@book-club/contracts';
import { useTranslations } from 'next-intl';
import { BookVote } from './book-vote';
import { EventsSection } from './events-section';
import { EventsStatic } from './events-static';
import { ActionError, ChatButton, JoinCta, LeaveButton, ManagePanel } from './membership';
import { Members } from './members';
import { About, AfterMeetingVenue, Champion, Created, Hero, NowReading, PrivateBadge, nearestBook } from './sections';
import { BookStores, OrganizerCard } from './sidebar';

const asideClass = 'w-full lg:w-56 xl:w-64 flex-shrink-0 space-y-4 lg:sticky lg:top-24 self-start';

/** The full club page; rendered on the server for visible clubs and in the browser when a stub upgrades. */
export function ClubView({ club, events }: { club: Club; events: readonly ClubEvent[] }) {
  const t = useTranslations('CLUB_DETAIL');
  const book = nearestBook(club, events);
  const ref = { id: club.id, organizerId: club.organizerId };

  return (
    <section className="min-h-screen">
      <Hero club={club} />
      <div className="page-max-w px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <aside className={`${asideClass} order-2 lg:order-1`} aria-label={t('sidebar_left_label')}>
            {book && <NowReading book={book} />}
            <ManagePanel club={ref} />
          </aside>

          <div className="flex-1 min-w-0 flex flex-col gap-8 order-1 lg:order-2">
            <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex items-center gap-3 flex-wrap">
                <PrivateBadge club={club} />
              </div>
              <LeaveButton club={ref} />
            </header>
            <ActionError clubId={club.id} />
            <About club={club} />
            <BookVote club={ref} />
            <ChatButton club={ref} />
            <JoinCta club={ref} />
            <EventsSection club={ref} initialEvents={events}>
              <EventsStatic events={events} />
            </EventsSection>
            <Members club={{ ...ref, memberCount: club.memberCount }} />
            <Created club={club} />
          </div>

          <aside className={`${asideClass} order-3`} aria-label={t('sidebar_right_label')}>
            <div className="flex flex-col gap-4">
              <Champion club={club} />
              <OrganizerCard club={ref} />
              {book && <BookStores bookTitle={book.title} />}
              <AfterMeetingVenue club={club} />
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
