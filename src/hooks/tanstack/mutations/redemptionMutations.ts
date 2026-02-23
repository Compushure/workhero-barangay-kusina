import { useMutation, useQueryClient } from '@tanstack/react-query';
import { handleCreateRedemptionRequestAction } from '@/action-handlers/employee/redemptions';
import { redemptionKeys } from '../queries/redemptionQueries';
import { rewardKeys } from '../queries/rewardQueries';

// creates a mutation hook for redeeming a reward. It calls the action handler to create a redemption request and then invalidates relevant queries to refresh data.
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
      // Invalidate rewards to update quantities after redemption
      queryClient.invalidateQueries({ queryKey: rewardKeys.all });
      queryClient.invalidateQueries({ queryKey: rewardKeys.available() });
      
      // Toast is already shown in handleCreateRedemptionRequestAction
    },
    onError: (error) => {
      // Error toast is already shown in handleCreateRedemptionRequestAction
      console.error('Redemption error:', error);
    },
  });
}
