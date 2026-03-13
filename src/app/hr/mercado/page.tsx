import { Suspense } from 'react';
import { MercadoPageContent } from '@/components/hr/mercado/mercado-page-content';
import { MarketSuspense } from '@/components/shared/market-suspense';

export default function MercadoPage() {
  return (
    <Suspense fallback={<MarketSuspense label="Loading mercado manager..." />}>
      <MercadoPageContent />
    </Suspense>
  );
}
