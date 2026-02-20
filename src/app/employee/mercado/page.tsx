'use client';

import { useState, useMemo, useEffect } from 'react';
import { FileText } from 'lucide-react';
import { MyRequestsModal } from '@/components/employee/modals/my-requests-modal';
import { MonthlyRewardsModal } from '@/components/employee/modals/monthly-rewards-modal';
import { MercadoStallsLayout } from '@/components/employee/mercado/mercado-stalls-layout';
import { MercadoHeader } from '@/components/employee/mercado/mercado-header';
import { PointsDisplay } from '@/components/employee/mercado/points-display';
import { LoadingState } from '@/components/employee/mercado/loading-state';
import { ErrorState } from '@/components/employee/mercado/error-state';
import { BackToNavigation } from '@/components/employee/shared/back-to-navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMercadoPageData } from '@/hooks/useMercadoPageData';

export default function EmployeeMercadoPage() {
  const [isMyRequestsOpen, setIsMyRequestsOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [isMonthModalOpen, setIsMonthModalOpen] = useState(false);
  const { activeRewards, pendingRequests, userPoints, deductedPoints, isLoading, error } =
    useMercadoPageData();

  const pendingRewardIds = new Set((pendingRequests || []).map((request) => request.rewardId));

  // Debug logging to check data flow
  useEffect(() => {
    console.log('=== MERCADO DEBUG ===');
    console.log('Total active rewards:', activeRewards.length);
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

  // Open modal when a month is selected
  useEffect(() => {
    if (selectedMonth !== null) {
      setIsMonthModalOpen(true);
    }
  }, [selectedMonth]);

  // Clear selected month when modal closes
  const handleModalClose = (open: boolean) => {
    setIsMonthModalOpen(open);
    if (!open) {
      setSelectedMonth(null);
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
        {/* Mercado Stalls Layout Gamified with pixel art */} -
        <div className="bg-linear-to-b from-[#fef5f1] to-[#fff8f5] rounded-xl p-8 shadow-inner border-2 border-[#690003]/10">
          <div className="text-center mb-8 space-y-3">
            <h2 className="text-2xl font-bold text-[#690003] mb-2">Monthly Mercado</h2>
            <p className="text-[#7a3d3d]">
              🏪 New stalls unlock each month! Click on unlocked stalls to discover special rewards.
            </p>
          </div>
          <MercadoStallsLayout
            onMonthSelect={setSelectedMonth}
            selectedMonth={selectedMonth}
            rewards={activeRewards}
          />
        </div>
      </div>

      <MyRequestsModal open={isMyRequestsOpen} onOpenChange={setIsMyRequestsOpen} />
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
