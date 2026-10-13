import { NotFoundView, notFoundMetadata } from '@/components/not-found-view';

export const generateMetadata = notFoundMetadata;

export default function NotFound() {
  return <NotFoundView />;
}
