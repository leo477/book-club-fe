import { LazyLogin } from '@/features/auth/login-page';
import { pageMetadata } from '@/lib/page-metadata';

export const generateMetadata = () => pageMetadata('SEO.login_title', '/login', { index: false });

export default function LoginPage() {
  return <LazyLogin />;
}
