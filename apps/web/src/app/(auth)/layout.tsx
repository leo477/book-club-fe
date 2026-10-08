import type { ReactNode } from 'react';
import { ErrorToasts } from '@/components/layout/error-toasts';
import { NamespacesIntl } from '@/components/namespaces-intl';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <NamespacesIntl namespaces={['AUTH', 'FORM_ERRORS', 'SECURITY', 'NAV', 'ERRORS']}>
      <ErrorToasts />
      {children}
    </NamespacesIntl>
  );
}
