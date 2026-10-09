import { NamespacesIntl } from '@/components/namespaces-intl';
import { RequireRole } from '@/features/auth/require-auth';
import { LazyRandomizer } from '@/features/randomizer/lazy';
import { notFound } from 'next/navigation';
import { pageMetadata } from '@/lib/page-metadata';
import { isUuid } from '@/lib/uuid';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  return pageMetadata('SEO.clubs_title', `/clubs/${(await params).id.toLowerCase()}/randomizer`, { index: false });
}

export default async function RandomizerPage({ params }: Props) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  return (
    <NamespacesIntl namespaces={['RANDOMIZER', 'ERRORS']}>
      <RequireRole role="organizer">
        <LazyRandomizer clubId={id.toLowerCase()} />
      </RequireRole>
    </NamespacesIntl>
  );
}
