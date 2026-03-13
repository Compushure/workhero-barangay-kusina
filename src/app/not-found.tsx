import NotFound from '@/components/error/not-found';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'WorkHero | Error',
  description: 'An unexpected error occurred in the WorkHero employee experience portal.',
  icons: {
    icon: '/assets/website-logo.svg',
    shortcut: '/assets/website-logo.svg',
    apple: '/assets/website-logo.svg',
  },
};

export default function NotFoundPage() {
  return (
    <NotFound
      cause="Page not found"
      recommendation="Check the URL or return to the login page."
    />
  );
}
