import { MercadoStallLoadingState } from '@/components/employee/mercado/mercado-stall-loading-state';

// Loading state while employee Mercado stall data is fetched.

export default function MercadoLoading() {
  return <MercadoStallLoadingState message="Loading employee mercado..." />;
}
