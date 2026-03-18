import type { Metadata } from 'next'; 
import { MercadoPageClient } from '@/components/employee/mercado/mercado-page-client';

export const metadata: Metadata = {
  title: 'WorkHero | Mercado',
  icons: {
    icon: '/assets/website-logo.svg',
    shortcut: '/assets/website-logo.svg',
    apple: '/assets/website-logo.svg',
  },
};

export default function MercadoPage() {
  return <MercadoPageClient />;
}
