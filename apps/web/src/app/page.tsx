import { redirect } from 'next/navigation';

// Angular's `'' -> events` redirect; /events itself is routed by the proxy, so it lands on whichever app owns it
export default function RootPage() {
  redirect('/events');
}
