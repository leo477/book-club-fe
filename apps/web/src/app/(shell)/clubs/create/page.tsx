import { NamespacesIntl } from '@/components/namespaces-intl';
import { RequireRole } from '@/features/auth/require-auth';
import { LazyCreateClub } from '@/features/organizer/lazy';
import { pageMetadata } from '@/lib/page-metadata';

export const generateMetadata = () =>
  pageMetadata('SEO.create_club_title', '/clubs/create', {
    descriptionKey: 'SEO.create_club_description',
    ogTitleKey: 'SEO.create_club_og_title',
    index: false,
  });

export default function CreateClubPage() {
  return (
    <NamespacesIntl namespaces={['CREATE_CLUB', 'ERRORS']}>
      <RequireRole role="organizer">
        <LazyCreateClub />
      </RequireRole>
    </NamespacesIntl>
  );
}
