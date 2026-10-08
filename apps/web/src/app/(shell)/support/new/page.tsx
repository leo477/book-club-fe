import { NamespacesIntl } from '@/components/namespaces-intl';
import { RequireAuth } from '@/features/auth/require-auth';
import { LazyCreateSubmission } from '@/features/support/create-submission-page';
import { pageMetadata } from '@/lib/page-metadata';

export const generateMetadata = () => pageMetadata('SUPPORT.create_title', '/support/new', { index: false });

export default function NewSubmissionPage() {
  return (
    <NamespacesIntl namespaces={['SUPPORT', 'ERRORS']}>
      <RequireAuth>
        <LazyCreateSubmission />
      </RequireAuth>
    </NamespacesIntl>
  );
}
