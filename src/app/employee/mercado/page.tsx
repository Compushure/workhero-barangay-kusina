'use client';

import { useMemo } from 'react';
import { useMercadoContext } from '../../../components/employee/mercado/mercado-context';
import { useMercadoPageData } from '@/hooks/useMercadoPageData';
import { MonthlyRewardsModal } from '@/components/employee/modals/monthly-rewards-modal';
import { useGetAvailableRewardsByMonth } from '@/hooks/tanstack/queries/rewardQueries';

export default function MercadoPage() {
  const { selectedMonth, setSelectedMonth } = useMercadoContext();
  const { pendingRequests, userPoints, deductedPoints, isLoading } = useMercadoPageData({
    includeRewards: false,
  });
  const { data: monthRewards = [] } = useGetAvailableRewardsByMonth(selectedMonth);

  // Get pending reward IDs
  const pendingRewardIds = useMemo(() => {
    return new Set(pendingRequests.map((req) => req.rewardId));
  }, [pendingRequests]);

  const availablePoints = userPoints - deductedPoints;

  return (
    <>
      <MonthlyRewardsModal
        open={!!selectedMonth}
        onOpenChange={(open) => !open && setSelectedMonth(null)}
        month={selectedMonth}
        rewards={monthRewards}
        userPoints={availablePoints}
        pendingRewardIds={pendingRewardIds}
      />
    </>
  );
}
