'use client';

import { useMemo } from 'react';
import { useMercadoContext } from './mercado-context';
import { useMercadoPageData } from '@/hooks/useMercadoPageData';
import { MonthlyRewardsModal } from '@/components/employee/modals/monthly-rewards-modal';
import { useGetAvailableRewardsByInterval } from '@/hooks/tanstack/queries/rewardQueries';
import ProfileAndLevel from '../attendance/profile-level';
import XPProgressAndPoints from '../attendance/xp-points';
import { RankWidget } from '../dashboard/rank-panel';
import { Card, CardContent } from '@/components/ui/card';

export function MercadoPageClient() {
  const { selectedInterval, setSelectedInterval } = useMercadoContext();
  const { pendingRequests, userPoints } = useMercadoPageData({
    includeRewards: false,
  });
  const { data: intervalRewards = [], isLoading: intervalRewardsLoading } =
    useGetAvailableRewardsByInterval(selectedInterval);

  const pendingRewardIds = useMemo(() => {
    return new Set(pendingRequests.map((req) => req.rewardId));
  }, [pendingRequests]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header HUD */}
      <header className="sticky top-0 left-0 right-0 w-full px-2 sm:px-4 pt-2 z-20 pointer-events-none bg-white/10 backdrop-blur-sm">
        <div className="flex flex-wrap items-start justify-between gap-2 sm:gap-4 p-1">
          <div className="pointer-events-auto flex items-center gap-3 sm:gap-4 flex-nowrap overflow-x-auto">
            <ProfileAndLevel />
            <XPProgressAndPoints />
          </div>

          <div className="pointer-events-auto w-full sm:w-auto flex justify-end">
            <Card className="bg-transparent shadow-none border-none w-full sm:w-auto p-0 gap-0 mr-15">
              <CardContent className="p-0">
                <RankWidget />
              </CardContent>
            </Card>
          </div>
        </div>
      </header>

      {/* Mercado modal content */}
      <div className="flex-1">
        <MonthlyRewardsModal
          open={!!selectedInterval}
          onOpenChange={(open) => !open && setSelectedInterval(null)}
          interval={selectedInterval}
          onIntervalChange={setSelectedInterval}
          rewards={intervalRewards}
          isLoading={intervalRewardsLoading}
          userPoints={userPoints}
          pendingRewardIds={pendingRewardIds}
          pendingRequests={pendingRequests}
        />
      </div>
    </div>
  );
}
