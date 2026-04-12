import { MarketSuspense } from '@/components/shared/market-suspense';

// Simple loading screen while HR Mercado data is still being prepared.

export default function MercadoLoading() {
  return <MarketSuspense label="Loading mercado manager..." />;
}
