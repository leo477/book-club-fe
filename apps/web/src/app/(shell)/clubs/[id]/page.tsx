import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages, getTranslations } from 'next-intl/server';
import { BookVote } from '@/features/club-detail/book-vote';
import { EventsSection } from '@/features/club-detail/events-section';
import { EventsStatic } from '@/features/club-detail/events-static';
import { loadClub } from '@/features/club-detail/load-club';
import { ActionError, ChatButton, JoinCta, LeaveButton, ManagePanel } from '@/features/club-detail/membership';
import { Members } from '@/features/club-detail/members';
import { About, AfterMeetingVenue, Champion, Created, Hero, NowReading, PrivateBadge, nearestBook } from '@/features/club-detail/sections';
import { BookStores, OrganizerCard } from '@/features/club-detail/sidebar';
import { clubDescription, clubJsonLd } from '@/features/club-detail/structured-data';
import { JsonLd } from '@/lib/json-ld';
import { pageMetadata } from '@/lib/page-metadata';

// the nested provider replaces the shell's, so it repeats the namespaces the shell already ships
const CLIENT_NAMESPACES = ['CLUB_DETAIL', 'BOOK_VOTE', 'MEMBERS', 'BOOK_STORES', 'EVENT', 'EVENTS', 'events', 'CLUB_MANAGE', 'CLUBS', 'CHAT', 'ERRORS'] as const;

type Props = { params: Promise<{ id: string }> };

const absoluteImage = (value: string | null): string | undefined => {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : undefined;
  } catch {
    return undefined;
  }
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { club } = await loadClub((await params).id);
  const description = clubDescription(club);
  const image = absoluteImage(club.coverUrl);
  return pageMetadata('SEO.club_detail_title', `/clubs/${club.id}`, {
    ogTitleKey: 'SEO.club_detail_og_title',
    values: { name: club.name, city: club.city ?? '' },
    ...(description ? { description } : { descriptionKey: 'SEO.club_detail_description' }),
    ...(image && { image }),
    index: club.isPublic,
  });
}

export default async function ClubDetailPage({ params }: Props) {
  const { club, events } = await loadClub((await params).id);
  const [t, tSeo, allMessages, locale] = await Promise.all([getTranslations('CLUB_DETAIL'), getTranslations('SEO'), getMessages(), getLocale()]);
  const messages = Object.fromEntries(CLIENT_NAMESPACES.map((ns) => [ns, allMessages[ns]]));
  const description = clubDescription(club) ?? tSeo('club_detail_description', { name: club.name, city: club.city ?? '' });
  const book = nearestBook(club, events);
  const ref = { id: club.id, organizerId: club.organizerId };
  const asideClass = 'w-full lg:w-56 xl:w-64 flex-shrink-0 space-y-4 lg:sticky lg:top-24 self-start';

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {club.isPublic && <JsonLd data={clubJsonLd(club, events, description)} />}
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
              <ActionError />
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
    </NextIntlClientProvider>
  );
}
