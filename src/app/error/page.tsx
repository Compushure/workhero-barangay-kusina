import type { Metadata } from 'next';
import ErrorPageClient from '@/components/error/error-page';

export const metadata: Metadata = {
  title: 'WorkHero | Error',
  description: 'An unexpected error occurred in the WorkHero employee experience portal.',
  icons: {
    icon: '/assets/website-logo.svg',
    shortcut: '/assets/website-logo.svg',
    apple: '/assets/website-logo.svg',
  },
};

export default function ErrorPage() {
  return <ErrorPageClient />;
}
