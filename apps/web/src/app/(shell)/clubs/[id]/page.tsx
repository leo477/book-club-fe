import type { Metadata } from 'next';
import { isClubStub } from '@book-club/contracts';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages, getTranslations } from 'next-intl/server';
import { ClubView } from '@/features/club-detail/club-view';
import { loadClub } from '@/features/club-detail/load-club';
import { PrivateClub } from '@/features/club-detail/private-club';
import { clubDescription, clubJsonLd, safeHttpUrl } from '@/features/club-detail/structured-data';
import { JsonLd } from '@/lib/json-ld';
import { pageMetadata } from '@/lib/page-metadata';

// the nested provider replaces the shell's, so it repeats the namespaces the shell already ships
const CLIENT_NAMESPACES = ['CLUB_DETAIL', 'BOOK_VOTE', 'MEMBERS', 'BOOK_STORES', 'EVENT', 'EVENTS', 'events', 'CLUB_MANAGE', 'CLUBS', 'CHAT', 'ERRORS'] as const;

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { club } = await loadClub((await params).id);
  // A private club's name, description and cover must not reach title/og/twitter tags (link unfurlers ignore noindex).
  if (isClubStub(club) || !club.isPublic) return pageMetadata('SEO.clubs_title', `/clubs/${club.id}`, { ogTitleKey: 'SEO.clubs_og_title', index: false });
  const description = clubDescription(club);
  const image = safeHttpUrl(club.coverUrl);
  return pageMetadata('SEO.club_detail_title', `/clubs/${club.id}`, {
    ogTitleKey: 'SEO.club_detail_og_title',
    values: { name: club.name, city: club.city ?? '' },
    ...(description ? { description } : { descriptionKey: 'SEO.club_detail_description' }),
    ...(image && { image }),
    index: true,
  });
}

export default async function ClubDetailPage({ params }: Props) {
  const { club, events } = await loadClub((await params).id);
  const [allMessages, locale] = await Promise.all([getMessages(), getLocale()]);
  const messages = Object.fromEntries(CLIENT_NAMESPACES.map((ns) => [ns, allMessages[ns]]));

  if (isClubStub(club)) {
    return (
      <NextIntlClientProvider locale={locale} messages={messages}>
        <PrivateClub stub={club} />
      </NextIntlClientProvider>
    );
  }

  const tSeo = await getTranslations('SEO');
  const description = clubDescription(club) ?? tSeo('club_detail_description', { name: club.name, city: club.city ?? '' });
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {club.isPublic && <JsonLd data={clubJsonLd(club, events, description)} />}
      <ClubView club={club} events={events} />
    </NextIntlClientProvider>
  );
}
