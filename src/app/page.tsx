import type { Metadata } from 'next';
import { HomepagePage } from '@/components/homepage/homepage-page';

export const metadata: Metadata = {
  title: 'WorkHero | Home',
  icons: {
    icon: '/assets/website-logo.svg',
    shortcut: '/assets/website-logo.svg',
    apple: '/assets/website-logo.svg',
  },
};

export default function Home() {
  return <HomepagePage />;
}
