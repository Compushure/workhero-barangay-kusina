import type { Metadata } from 'next';
import { Suspense } from 'react';
import { MercadoPageContent } from '@/components/hr/mercado/mercado-page-content';
import { MarketSuspense } from '@/components/shared/market-suspense';

export const metadata: Metadata = {
  title: 'WorkHero | Mercado',
  icons: {
    icon: '/assets/website-logo.svg',
    shortcut: '/assets/website-logo.svg',
    apple: '/assets/website-logo.svg',
  },
};

export default function MercadoPage() {
  return (
    <Suspense fallback={<MarketSuspense label="Loading mercado manager..." />}>
      <MercadoPageContent />
    </Suspense>
  );
}
