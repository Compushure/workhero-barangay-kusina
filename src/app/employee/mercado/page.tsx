'use client';

import { useMemo } from 'react';
import { useMercadoContext } from './mercado-context';
import { useMercadoPageData } from '@/hooks/useMercadoPageData';
import { MonthlyRewardsModal } from '@/components/employee/modals/monthly-rewards-modal';

export default function MercadoPage() {
  const { selectedMonth, setSelectedMonth } = useMercadoContext();
  const { activeRewards, pendingRequests, userPoints, deductedPoints, isLoading } =
    useMercadoPageData();

  // Filter rewards by selected month
  const monthRewards = useMemo(() => {
    if (!selectedMonth) return [];
    return activeRewards.filter((reward) => reward.availableMonth === selectedMonth);
  }, [activeRewards, selectedMonth]);

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
