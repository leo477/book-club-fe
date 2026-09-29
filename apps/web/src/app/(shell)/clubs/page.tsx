import type { Club } from '@book-club/contracts';
import { getTranslations } from 'next-intl/server';
import { ClubsListClient } from '@/features/clubs/clubs-list-client';
import { JsonLd } from '@/lib/json-ld';
import { pageMetadata } from '@/lib/page-metadata';
import { serverApi } from '@/lib/server-api';

export const generateMetadata = () => pageMetadata('SEO.clubs_title', '/clubs', {
    descriptionKey: 'SEO.clubs_description',
    ogTitleKey: 'SEO.clubs_og_title',
  });

const ORGANIZATION_JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      name: 'Book Club',
      url: 'https://book-club-planer.vercel.app/',
      description: 'Платформа для книжкових клубів України',
      logo: 'https://book-club-planer.vercel.app/og-image.png',
      inLanguage: 'uk',
    },
    {
      '@type': 'WebApplication',
      name: 'Book Club',
      description: 'Платформа для книжкових клубів України',
      url: 'https://book-club-planer.vercel.app/',
      applicationCategory: 'SocialNetworkingApplication',
      inLanguage: 'uk',
    },
  ],
};

async function loadPublicClubs(): Promise<Club[] | null> {
  try {
    return await serverApi({ revalidate: 300, tags: ['clubs'] }).clubs.list();
  } catch {
    // the client island falls back to fetching (and shows the load error) itself
    return null;
  }
}

export default async function ClubsPage() {
  const [t, clubs] = await Promise.all([getTranslations('SEO'), loadPublicClubs()]);
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: t('site_name'),
          url: t('site_url'),
          description: t('site_description'),
        }}
      />
      <JsonLd data={ORGANIZATION_JSON_LD} />
      <ClubsListClient initialClubs={clubs} />
    </>
  );
}
