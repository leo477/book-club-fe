import { NamespacesIntl } from '@/components/namespaces-intl';
import { RequireAuth } from '@/features/auth/require-auth';
import { LazyProfile } from '@/features/profile/profile-page';
import { pageMetadata } from '@/lib/page-metadata';

export const generateMetadata = () => pageMetadata('SEO.profile_title', '/profile', { index: false });

export default function ProfilePage() {
  return (
    <NamespacesIntl namespaces={['PROFILE', 'SECURITY', 'common', 'ERRORS']}>
      <RequireAuth>
        <LazyProfile />
      </RequireAuth>
    </NamespacesIntl>
  );
}
