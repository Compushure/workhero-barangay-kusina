import { useMutation, useQueryClient } from '@tanstack/react-query';
import { handleCreateRedemptionRequestAction } from '@/action-handlers/hr';
import { redemptionKeys } from '../queries/redemptionQueries';

/**
 * Mutation hook for direct redemption of a reward item.
 * Creates a redemption request immediately when user clicks Redeem button.
 */
export function useRedeemReward() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ rewardId, quantity, rewardName }: { rewardId: string; quantity: number; rewardName: string }) => {
      const result = await handleCreateRedemptionRequestAction(rewardId, quantity);
      
      if (!result) {
        throw new Error('Failed to create redemption request');
      }
      
      return { rewardId, rewardName, quantity };
    },
    onSuccess: (data) => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: redemptionKeys.myRequests() });
      queryClient.invalidateQueries({ queryKey: ['employeePoints'] });
      
      // Toast is already shown in handleCreateRedemptionRequestAction
    },
    onError: (error) => {
      // Error toast is already shown in handleCreateRedemptionRequestAction
      console.error('Redemption error:', error);
    },
  });
}
