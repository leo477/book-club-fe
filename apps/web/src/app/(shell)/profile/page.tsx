import { NamespacesIntl } from '@/components/namespaces-intl';
import { RequireAuth } from '@/features/auth/require-auth';
import { ProfileView } from '@/features/profile/profile-view';
import { pageMetadata } from '@/lib/page-metadata';

export const generateMetadata = () => pageMetadata('SEO.profile_title', '/profile', { index: false });

export default function ProfilePage() {
  return (
    <NamespacesIntl namespaces={['PROFILE', 'SECURITY', 'common', 'ERRORS']}>
      <RequireAuth>
        <ProfileView />
      </RequireAuth>
    </NamespacesIntl>
  );
}
