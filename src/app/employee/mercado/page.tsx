'use client';

import { Loader2 } from 'lucide-react';
import { CartDrawer, CartButton, RewardCard } from '@/components/employee';
import { useMercadoPageData } from '@/hooks/useMercadoPageData';
import { formatNumber } from '@/lib/format';

export default function EmployeeMercadoPage() {
  const { activeRewards, pendingRewardIds, userPoints, deductedPoints, isLoading, error } =
    useMercadoPageData();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fff8f5] p-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-[#690003]" />
              <p className="text-[#5a2a2a]">Loading mercado...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#fff8f5] p-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-center h-64">
            <p className="text-red-600">Error loading rewards: {error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff8f5] p-8 pb-24">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[#690003]">Mercado</h1>
              <p className="text-[#7a3d3d] mt-1">
                Add rewards to your cart and submit your redemption request
              </p>
            </div>
            <div className="flex items-center gap-4">
              <CartButton variant="inline" />
              <div className="bg-white rounded-lg shadow-md h-9 px-4 border-2 border-[#690003] flex items-center gap-2">
                <span className="text-xs text-[#7a3d3d] font-medium whitespace-nowrap">
                  Available Points
                </span>
                <span className="text-lg font-bold text-[#690003]">{formatNumber(userPoints)}</span>
                {deductedPoints > 0 && (
                  <span className="text-xs text-orange-600 whitespace-nowrap">
                    Pending: {formatNumber(deductedPoints)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {activeRewards.length === 0 ? (
          <div className="flex items-center justify-center h-64 bg-white rounded-lg shadow-md">
            <p className="text-[#5a2a2a]">No rewards available at the moment.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {activeRewards.map((reward) => (
              <RewardCard
                key={reward.id}
                reward={reward}
                userPoints={userPoints}
                hasPendingRequest={pendingRewardIds.has(reward.id)}
              />
            ))}
          </div>
        )}
      </div>

      <CartDrawer userPoints={userPoints} deductedPoints={deductedPoints} />
    </div>
  );
}
