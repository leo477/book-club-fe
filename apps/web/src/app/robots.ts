import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/manage/',
        '/events',
        '/support',
        '/profile',
        '/chats',
        '/clubs/create',
        '/clubs/*/edit',
        '/clubs/*/manage',
        '/clubs/*/randomizer',
        '/clubs/*/quizzes',
        '/clubs/*/events/create',
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
