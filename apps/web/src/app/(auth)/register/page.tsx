import { LazyRegister } from '@/features/auth/register-page';
import { pageMetadata } from '@/lib/page-metadata';

export const generateMetadata = () => pageMetadata('SEO.register_title', '/register', { index: false });

export default function RegisterPage() {
  return <LazyRegister />;
}
