import type { Metadata } from 'next';
import { MercadoPageContent } from '@/components/hr/mercado/mercado-page-content';

export const metadata: Metadata = {
  title: 'WorkHero | Mercado',
  icons: {
    icon: '/assets/website-logo.svg',
    shortcut: '/assets/website-logo.svg',
    apple: '/assets/website-logo.svg',
  },
};

export default function MercadoPage() {
  return <MercadoPageContent />;
}
