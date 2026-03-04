'use client';

import { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RewardCard } from '@/components/employee/mercado/reward-card';
import { Package, Loader2, ShoppingBag, AlertCircle } from 'lucide-react';
import { useGetRewards } from '@/hooks/tanstack/queries/rewardQueries';
import { useGetMyRedemptionRequests } from '@/hooks/tanstack/queries/redemptionQueries';
import { useQuery } from '@tanstack/react-query';
import { getEmployeePoints } from '@/actions/employee/stats';

interface AllRewardsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MODAL_CONTENT_CLASS =
  'bg-[#f5e5dc] border-none w-screen max-w-screen max-h-[86vh] rounded-2xl p-0 flex flex-col overflow-hidden';
const MODAL_GRID_CLASS = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6';

export function AllRewardsModal({ open, onOpenChange }: AllRewardsModalProps) {
  // Fetch ALL rewards (not just available ones - we'll filter client-side)
  const { data: allRewards = [], isLoading: rewardsLoading, error: rewardsError } = useGetRewards();

  // Fetch pending requests
  const { data: pendingRequests = [], isLoading: requestsLoading } =
    useGetMyRedemptionRequests('pending');

  // Fetch user points
  const { data: pointsData, isLoading: pointsLoading } = useQuery({
    queryKey: ['employeePoints'],
    queryFn: async () => {
      const result = await getEmployeePoints();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch points');
      }
      return result.data;
    },
    enabled: open, // Only fetch when modal is open
  });

  const userPoints = pointsData?.points ?? 0;
  const isLoading = rewardsLoading || requestsLoading || pointsLoading;
  const pendingRewardIds = new Set((pendingRequests || []).map((request) => request.rewardId));

  // Filter to show only active rewards
  const activeRewards = allRewards.filter((reward) => reward.isActive);

  // Debug logging to see reward data
  useEffect(() => {
    if (open) {
      console.group('ALL REWARDS MODAL DEBUG');
      console.log(' Data Loading Status:');
      console.log('  - Rewards Loading:', rewardsLoading);
      console.log('  - Requests Loading:', requestsLoading);
      console.log('  - Points Loading:', pointsLoading);
      console.log('  - Overall Loading:', isLoading);
      console.log('');

      console.log(' Rewards Data:');
      console.log('  - Total rewards from DB:', allRewards.length);
      console.log('  - Active rewards:', activeRewards.length);
      console.log('  - Inactive rewards:', allRewards.length - activeRewards.length);
      console.log('');

      console.log(' User Data:');
      console.log('  - User points:', userPoints);
      console.log('  - Pending requests:', pendingRequests.length);
      console.log('');

      if (rewardsError) {
        console.error(' ERROR loading rewards:', rewardsError);
        console.log('');
      }

      if (allRewards.length === 0) {
        console.error(' NO REWARDS IN DATABASE!');
        console.log('');
        console.log(' TO FIX:');
        console.log('   1. Open Supabase SQL Editor');
        console.log('   2. Check file: QUICK_FIX_REWARDS.sql');
        console.log('   3. Run QUERY 1 to check if rewards exist');
        console.log('   4. If no rewards: Create them at /hr/mercado');
        console.log('');
      } else if (activeRewards.length === 0) {
        console.warn('⚠️ REWARDS EXIST BUT NONE ARE ACTIVE!');
        console.log('');
        console.table(
          allRewards.slice(0, 5).map((r) => ({
            Name: r.name,
            Active: r.isActive ? 'True' : 'False',
            Availability: r.availableMonth || 'Not Set',
          }))
        );
        console.log('');
        console.log(' TO FIX:');
        console.log('   1. Open Supabase SQL Editor');
        console.log('   2. Run: UPDATE \"Reward\" SET is_active = true;');
        console.log('   3. Refresh this page');
        console.log('');
      } else {
        console.log('Active Rewards Found!');
        console.log('');
        console.log('Reward Cards Should Display:');
        console.table(
          activeRewards.slice(0, 10).map((r) => ({
            Name: r.name,
            'Points Cost': r.pointsCost,
            Active: r.isActive ? 'True' : 'False',
            Availability: r.availableMonth || 'All',
            Quantity: r.quantity ?? '∞',
            'Has Image': r.imageUrl ? 'True' : 'False',
          }))
        );
        console.log('');
        console.log("If cards still don't show, check:");
        console.log('  - Is the modal actually open?');
        console.log('  - Are there any React errors in console?');
        console.log('  - Try refreshing the page');
        console.log('');
      }

      console.groupEnd();
    }
  }, [
    open,
    allRewards,
    activeRewards,
    userPoints,
    pendingRequests,
    rewardsError,
    isLoading,
    rewardsLoading,
    requestsLoading,
    pointsLoading,
  ]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={MODAL_CONTENT_CLASS}>
        <DialogHeader className="p-6 pb-4 border-b border-[#730202]/10 space-y-1">
          <DialogTitle className="text-xl sm:text-2xl font-bold text-[#5a2a2a] flex items-center gap-3">
            <ShoppingBag className="h-6 w-6 text-[#730202]" />
            <span>All Available Rewards</span>
          </DialogTitle>
          <DialogDescription className="text-[#7a3d3d]">
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading rewards...
              </span>
            ) : activeRewards.length > 0 ? (
              <span className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                {activeRewards.length} {activeRewards.length === 1 ? 'reward' : 'rewards'} available
                • Your points: <span className="font-bold text-[#5a2a2a]">{userPoints}</span> pts
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-gray-400 rounded-full" />
                No rewards available at the moment
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[calc(86vh-120px)] bg-[#730202]/5">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center min-h-100 text-center px-6 py-8">
              <Loader2 className="h-16 w-16 text-[#690003] animate-spin mb-4" />
              <p className="text-[#7a3d3d] text-lg">Loading rewards...</p>
            </div>
          ) : activeRewards.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-100 text-center px-6 py-8">
              <Package className="h-20 w-20 text-gray-300 mb-4" />
              <h3 className="text-[#5a2a2a] text-xl font-bold mb-3">No Rewards Available</h3>
              <p className="text-[#7a3d3d] text-base max-w-md mb-4">
                There are currently no active rewards available for redemption. Please check back
                later!
              </p>
              {/* Debug info for development */}
              {allRewards.length > 0 && (
                <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg max-w-md">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                    <div className="text-left text-sm">
                      <p className="font-semibold text-blue-900 mb-1">Debug Info</p>
                      <p className="text-blue-800">
                        Found {allRewards.length} total rewards, but {activeRewards.length} are
                        active. Check if rewards have{' '}
                        <code className="bg-blue-100 px-1 rounded">is_active = true</code> in the
                        database.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className={MODAL_GRID_CLASS}>
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
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
