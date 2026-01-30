import { useMutation, useQueryClient } from '@tanstack/react-query';
import { handleCreateRedemptionRequestAction } from '@/action-handlers/hr';
import { redemptionKeys } from '../queries/redemptionQueries';
import { CartItem } from '@/store/cartStore';
import { toast } from 'sonner';

interface CartSubmissionResult {
  successful: string[];
  failed: Array<{ rewardId: string; rewardName: string; error: string }>;
}

/**
 * Mutation hook for submitting multiple cart items as redemption requests.
 * Processes items sequentially to ensure proper validation and error handling.
 */
export function useSubmitCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (items: CartItem[]): Promise<CartSubmissionResult> => {
      const successful: string[] = [];
      const failed: Array<{ rewardId: string; rewardName: string; error: string }> = [];

      // Process items sequentially to avoid race conditions
      for (const item of items) {
        try {
          const result = await handleCreateRedemptionRequestAction(item.rewardId, item.quantity);

          if (result) {
            successful.push(item.rewardId);
          } else {
            failed.push({
              rewardId: item.rewardId,
              rewardName: item.reward.name,
              error: 'Failed to submit request',
            });
          }
        } catch (error) {
          failed.push({
            rewardId: item.rewardId,
            rewardName: item.reward.name,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      return { successful, failed };
    },
    onSuccess: (result) => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: redemptionKeys.all });
      queryClient.invalidateQueries({ queryKey: redemptionKeys.myRequests() });
      queryClient.invalidateQueries({ queryKey: ['employeePoints'] });

      // Show appropriate toast based on results
      if (result.failed.length === 0) {
        toast.success(
          `Successfully submitted ${result.successful.length} redemption request${result.successful.length > 1 ? 's' : ''}!`
        );
      } else if (result.successful.length === 0) {
        toast.error('Failed to submit redemption requests. Please try again.');
      } else {
        toast.warning(
          `Submitted ${result.successful.length} request(s), but ${result.failed.length} failed. Check your pending requests.`
        );
      }
    },
    onError: (error) => {
      toast.error(`Failed to submit cart: ${error.message}`);
    },
  });
}
