'use client';

import { useState } from 'react';
import { useGetRewards } from '@/hooks/tanstack/queries/rewardQueries';
import { useCreateRedemptionRequest } from '@/hooks/tanstack/mutations/hrMutations';
import { useGetMyRedemptionRequests } from '@/hooks/tanstack/queries/redemptionQueries';
import { getEmployeePoints } from '@/actions/employees/get-points';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ShoppingCart, Loader2, Minus, Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

export default function EmployeeMercadoPage() {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [redeemingRewardId, setRedeemingRewardId] = useState<string | null>(null);

  // Fetch active rewards
  const { data: allRewards = [], isLoading: rewardsLoading, error: rewardsError } = useGetRewards();
  const activeRewards = allRewards.filter(reward => reward.isActive);

  // Fetch user's pending redemption requests
  const { data: pendingRequests = [], isLoading: requestsLoading } = useGetMyRedemptionRequests('pending');

  // Fetch user's current points
  const { data: pointsData, isLoading: pointsLoading } = useQuery({
    queryKey: ['employeePoints'],
    queryFn: async () => {
      const result = await getEmployeePoints();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch points');
      }
      return result.data;
    },
  });

  const userPoints = pointsData ?? 0;

  // Create redemption request mutation
  const createRequestMutation = useCreateRedemptionRequest();

  const getQuantity = (rewardId: string) => quantities[rewardId] || 1;

  const setQuantity = (rewardId: string, value: number) => {
    setQuantities(prev => ({ ...prev, [rewardId]: value }));
  };

  const incrementQuantity = (rewardId: string, max: number) => {
    const current = getQuantity(rewardId);
    if (current < max) {
      setQuantity(rewardId, current + 1);
    }
  };

  const decrementQuantity = (rewardId: string) => {
    const current = getQuantity(rewardId);
    if (current > 1) {
      setQuantity(rewardId, current - 1);
    }
  };

  const handleRedeem = async (rewardId: string, quantity: number) => {
    try {
      setRedeemingRewardId(rewardId);
      await createRequestMutation.mutateAsync({ rewardId, quantity });
      // Reset quantity after successful submission
      setQuantity(rewardId, 1);
    } catch (error) {
      // Error is already handled by the mutation
      console.error('Redemption error:', error);
    } finally {
      setRedeemingRewardId(null);
    }
  };

  if (rewardsLoading || pointsLoading || requestsLoading) {
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

  if (rewardsError) {
    return (
      <div className="min-h-screen bg-[#fff8f5] p-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-center h-64">
            <p className="text-red-600">Error loading rewards: {rewardsError.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff8f5] p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#690003]">Mercado</h1>
              <p className="text-[#7a3d3d] mt-1">
                Redeem your points for rewards
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md px-6 py-4 border-2 border-[#690003]">
              <p className="text-sm text-[#7a3d3d] font-medium">Your Points</p>
              <p className="text-3xl font-bold text-[#690003]">{userPoints}</p>
            </div>
          </div>
        </div>

        {/* Rewards Grid */}
        {activeRewards.length === 0 ? (
          <div className="flex items-center justify-center h-64 bg-white rounded-lg shadow-md">
            <p className="text-[#5a2a2a]">No rewards available at the moment.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {activeRewards.map((reward) => {
              const quantity = getQuantity(reward.id);
              const maxQuantity = reward.redeemingLimit || 99;
              const totalCost = reward.pointsCost * quantity;
              const canAfford = userPoints >= totalCost;
              const isRedeeming = redeemingRewardId === reward.id;
              
              // Check if user has a pending request for this reward
              const hasPendingRequest = pendingRequests.some(req => req.rewardId === reward.id);
              const canRedeem = canAfford && !hasPendingRequest && !(reward.quantity !== undefined && reward.quantity === 0);

              return (
                <Card key={reward.id} className="overflow-hidden border-[#690003]/20 hover:shadow-lg transition-shadow">
                  <CardHeader className="bg-gradient-to-br from-[#fff8f5] to-[#fbeaea] pb-4">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-xl text-[#690003]">{reward.name}</CardTitle>
                      {reward.quantity !== undefined && reward.quantity <= 10 && reward.quantity > 0 && (
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                          Only {reward.quantity} left
                        </Badge>
                      )}
                    </div>
                    {reward.category && (
                      <CardDescription className="text-[#7a3d3d]">{reward.category}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[#7a3d3d]">Cost per item</span>
                        <span className="text-lg font-bold text-[#690003]">
                          {reward.pointsCost} <span className="text-sm font-normal">pts</span>
                        </span>
                      </div>
                      
                      {reward.redeemingLimit && reward.redeemingLimit > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-[#7a3d3d]">Limit per request</span>
                          <span className="text-sm font-medium text-[#5a2a2a]">
                            {reward.redeemingLimit}
                          </span>
                        </div>
                      )}

                      {/* Quantity Selector */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[#5a2a2a]">Quantity</label>
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => decrementQuantity(reward.id)}
                            disabled={quantity <= 1 || isRedeeming}
                            className="h-9 w-9 border-[#690003] text-[#690003] hover:bg-[#fbeaea]"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Input
                            type="number"
                            min="1"
                            max={maxQuantity}
                            value={quantity}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 1;
                              setQuantity(reward.id, Math.min(Math.max(val, 1), maxQuantity));
                            }}
                            disabled={isRedeeming}
                            className="h-9 w-16 text-center border-[#690003] focus-visible:ring-[#690003]"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => incrementQuantity(reward.id, maxQuantity)}
                            disabled={quantity >= maxQuantity || isRedeeming}
                            className="h-9 w-9 border-[#690003] text-[#690003] hover:bg-[#fbeaea]"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Total Cost */}
                      <div className="flex items-center justify-between pt-2 border-t border-[#690003]/10">
                        <span className="text-sm font-medium text-[#7a3d3d]">Total Cost</span>
                        <span className="text-2xl font-bold text-[#690003]">
                          {totalCost} <span className="text-sm font-normal">pts</span>
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-[#fff8f5] pt-4">
                    <Button
                      onClick={() => handleRedeem(reward.id, quantity)}
                      disabled={!canRedeem || isRedeeming}
                      className={`w-full ${
                        canRedeem
                          ? 'bg-[#690003] hover:bg-[#8b0000] text-white'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {isRedeeming ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : reward.quantity === 0 ? (
                        'Out of Stock'
                      ) : hasPendingRequest ? (
                        'Pending Approval'
                      ) : !canAfford ? (
                        <>Insufficient Points</>
                      ) : (
                        <>
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          Redeem ({quantity})
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
