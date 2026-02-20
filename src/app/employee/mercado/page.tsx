'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { FileText, ShoppingBag } from 'lucide-react';
import { MyRequestsModal } from '@/components/employee/modals/my-requests-modal';
import { MonthlyRewardsModal } from '@/components/employee/modals/monthly-rewards-modal';
import { AllRewardsModal } from '@/components/employee/modals/all-rewards-modal';
import { MercadoStallsLayout } from '@/components/employee/mercado/mercado-stalls-layout';
import { MercadoHeader } from '@/components/employee/mercado/mercado-header';
import { PointsDisplay } from '@/components/employee/mercado/points-display';
import { LoadingState } from '@/components/employee/mercado/loading-state';
import { ErrorState } from '@/components/employee/mercado/error-state';
import { RewardCard } from '@/components/employee/mercado/reward-card';
import { BackToNavigation } from '@/components/employee/shared/back-to-navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMercadoPageData } from '@/hooks/useMercadoPageData';

export default function EmployeeMercadoPage() {
  const [isMyRequestsOpen, setIsMyRequestsOpen] = useState(false);
  const [isAllRewardsOpen, setIsAllRewardsOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [isMonthModalOpen, setIsMonthModalOpen] = useState(false);
  const itemsSectionRef = useRef<HTMLDivElement>(null);

  const { activeRewards, pendingRequests, userPoints, deductedPoints, isLoading, error } =
    useMercadoPageData();

  const pendingRewardIds = new Set((pendingRequests || []).map((request) => request.rewardId));

  // Debug logging to check data flow
  useEffect(() => {
    console.log('=== MERCADO DATA DEBUG ===');
    console.log('Total active rewards:', activeRewards.length);

    // Group rewards by month
    const rewardsByMonth = activeRewards.reduce(
      (acc, r) => {
        const month = r.availableMonth || 'No Month';
        if (!acc[month]) acc[month] = [];
        acc[month].push(r.name);
        return acc;
      },
      {} as Record<string | number, string[]>
    );

    console.log('Rewards grouped by month:');
    Object.keys(rewardsByMonth).forEach((month) => {
      console.log(`  Month ${month}: ${rewardsByMonth[month].length} items`, rewardsByMonth[month]);
    });

    console.log(
      'Active rewards with months:',
      activeRewards.map((r) => ({
        name: r.name,
        availableMonth: r.availableMonth,
        isActive: r.isActive,
      }))
    );
  }, [activeRewards]);

  // Filter rewards by selected month
  const filteredRewards = useMemo(() => {
    if (!selectedMonth) return [];
    const filtered = activeRewards.filter((reward) => reward.availableMonth === selectedMonth);
    console.log(`Filtering for month ${selectedMonth}:`, filtered.length, 'items found');
    console.log(
      'Filtered items:',
      filtered.map((r) => r.name)
    );
    return filtered;
  }, [activeRewards, selectedMonth]);

  // Scroll to items section when a stall is selected
  useEffect(() => {
    if (selectedMonth !== null && itemsSectionRef.current) {
      setTimeout(() => {
        itemsSectionRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 100);
    }
  }, [selectedMonth]);

  // Clear selected month when modal closes
  const handleModalClose = (open: boolean) => {
    setIsMonthModalOpen(open);
    if (!open) {
      setSelectedMonth(null);
    }
  };

  const handleMonthSelect = (month: number | null) => {
    setSelectedMonth(month);
    if (month !== null) {
      setIsMonthModalOpen(true);
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading mercado..." />;
  }

  if (error) {
    return <ErrorState message={`Error loading rewards: ${error.message}`} />;
  }

  return (
    <div className="min-h-screen bg-[#fff8f5] p-8 pb-24">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Navigation back to dashboard */}
        <BackToNavigation />
        {/* Header with pixel art icon */}
        <MercadoHeader
          title="Mercado"
          subtitle="Browse rewards and redeem items with your points"
          actions={
            <>
              <Button
                onClick={() => setIsAllRewardsOpen(true)}
                variant="outline"
                className="border-[#690003] text-[#690003] hover:bg-[#fbeaea]"
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                All Rewards
              </Button>
              <Button
                onClick={() => setIsMyRequestsOpen(true)}
                variant="outline"
                className="border-[#690003] text-[#690003] hover:bg-[#fbeaea] relative"
              >
                <FileText className="h-4 w-4 mr-2" />
                My Requests
                {pendingRequests && pendingRequests.length > 0 && (
                  <Badge className="ml-2 bg-yellow-500 text-white text-xs px-1.5 py-0.5 animate-pulse">
                    {pendingRequests.length}
                  </Badge>
                )}
              </Button>
              <PointsDisplay
                availablePoints={userPoints}
                pendingPoints={deductedPoints}
                size="md"
              />
            </>
          }
        />
        {/* Mercado Stalls Layout Gamified with pixel art */}
        <div className="bg-linear-to-b from-[#fef5f1] to-[#fff8f5] rounded-xl p-8 shadow-inner border-2 border-[#690003]/10">
          <div className="text-center mb-8 space-y-3">
            <h2 className="text-2xl font-bold text-[#690003] mb-2">Monthly Mercado</h2>
            <p className="text-[#7a3d3d]">
              🏪 New stalls unlock each month! Click on unlocked stalls to discover special rewards.
            </p>
          </div>
          <MercadoStallsLayout
            onMonthSelect={handleMonthSelect}
            selectedMonth={selectedMonth}
            rewards={activeRewards}
          />
        </div>

        {/* Display items from selected stall */}
        {selectedMonth && (
          <div
            ref={itemsSectionRef}
            className="bg-white rounded-xl p-8 shadow-lg border-2 border-[#690003]/10"
          >
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-[#690003] mb-2">
                {
                  [
                    'January',
                    'February',
                    'March',
                    'April',
                    'May',
                    'June',
                    'July',
                    'August',
                    'September',
                    'October',
                    'November',
                    'December',
                  ][selectedMonth - 1]
                }{' '}
                Market Items
              </h3>
              <p className="text-[#7a3d3d]">
                {filteredRewards.length > 0
                  ? `${filteredRewards.length} ${filteredRewards.length === 1 ? 'item' : 'items'} available this month`
                  : 'No items available for this month yet'}
              </p>
            </div>

            {filteredRewards.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredRewards.map((reward) => (
                  <RewardCard
                    key={reward.id}
                    reward={reward}
                    userPoints={userPoints}
                    hasPendingRequest={pendingRewardIds.has(reward.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📦</div>
                <p className="text-[#7a3d3d] text-lg">This stall is empty. Check back later!</p>
              </div>
            )}
          </div>
        )}
      </div>

      <MyRequestsModal open={isMyRequestsOpen} onOpenChange={setIsMyRequestsOpen} />
      <AllRewardsModal open={isAllRewardsOpen} onOpenChange={setIsAllRewardsOpen} />
      <MonthlyRewardsModal
        open={isMonthModalOpen}
        onOpenChange={handleModalClose}
        month={selectedMonth}
        rewards={filteredRewards}
        userPoints={userPoints}
        pendingRewardIds={pendingRewardIds}
      />
    </div>
  );
}
