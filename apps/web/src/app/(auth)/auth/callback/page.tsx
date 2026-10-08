import { OAuthCallback } from '@/features/auth/oauth-callback';
import { pageMetadata } from '@/lib/page-metadata';

export const generateMetadata = () => pageMetadata('SEO.login_title', '/auth/callback', { index: false });

export default function OAuthCallbackPage() {
  return <OAuthCallback />;
}
