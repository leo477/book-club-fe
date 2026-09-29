import uk from '@book-club/i18n/uk.icu.json';

const messages = uk as Record<string, string>;

/** Single source for absolute URLs outside a request (sitemap, robots, JSON-LD); equals SEO.site_url in every locale. */
export const SITE_URL = messages['SEO.site_url']!.replace(/\/$/, '');

/** Bump when the static pages' content changes: a build-time "now" would tell crawlers everything changed on every deploy. */
export const STATIC_LAST_MODIFIED = '2026-09-29';

const DESCRIPTION = 'Платформа для книжкових клубів України';

export const ORGANIZATION_JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'Organization', name: 'Book Club', url: `${SITE_URL}/`, description: DESCRIPTION, logo: `${SITE_URL}/og-image.png`, inLanguage: 'uk' },
    {
      '@type': 'WebApplication',
      name: 'Book Club',
      description: DESCRIPTION,
      url: `${SITE_URL}/`,
      applicationCategory: 'SocialNetworkingApplication',
      inLanguage: 'uk',
    },
  ],
};
