import type { MetadataRoute } from 'next';

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
    sitemap: 'https://book-club-planer.vercel.app/sitemap.xml',
  };
}
