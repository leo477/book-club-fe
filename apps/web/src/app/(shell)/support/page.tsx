import { NamespacesIntl } from '@/components/namespaces-intl';
import { RequireAuth } from '@/features/auth/require-auth';
import { SupportBoard } from '@/features/support/support-board';
import { pageMetadata } from '@/lib/page-metadata';

export const generateMetadata = () => pageMetadata('SUPPORT.title', '/support', { index: false });

export default function SupportPage() {
  return (
    <NamespacesIntl namespaces={['SUPPORT', 'ERRORS']}>
      <RequireAuth>
        <SupportBoard />
      </RequireAuth>
    </NamespacesIntl>
  );
}
