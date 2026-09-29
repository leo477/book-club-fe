import type { MetadataRoute } from 'next';
import { serverApi } from '@/lib/server-api';
import { SITE_URL, STATIC_LAST_MODIFIED } from '@/lib/site';

export const revalidate = 3600;

const ROUTES = [
  { path: '/', changeFrequency: 'weekly', priority: 1 },
  { path: '/clubs', changeFrequency: 'daily', priority: 0.8 },
  { path: '/privacy', changeFrequency: 'yearly', priority: 0.2 },
  { path: '/terms', changeFrequency: 'yearly', priority: 0.2 },
] as const;

async function publicClubs() {
  try {
    const clubs = await serverApi({ revalidate: 3600, tags: ['clubs'] }).clubs.list();
    return clubs.filter((c) => c.isPublic && c.id);
  } catch {
    // degrade to static routes only
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = STATIC_LAST_MODIFIED;
  const clubs = await publicClubs();
  return [
    ...ROUTES.map(({ path, changeFrequency, priority }) => ({ url: `${SITE_URL}${path}`, lastModified, changeFrequency, priority })),
    ...clubs.map((club) => ({
      url: `${SITE_URL}/clubs/${club.id}`,
      lastModified: club.createdAt.slice(0, 10) || lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
  ];
}
