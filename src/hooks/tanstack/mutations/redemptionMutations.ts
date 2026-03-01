import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  handleCancelMyRedemptionRequestAction,
  handleCreateRedemptionRequestAction,
} from '@/action-handlers/employee/redemptions';
import { employeeKeys } from '../queries/employeeQueries';
import { redemptionKeys } from '../queries/redemptionQueries';
import { rewardKeys } from '../queries/rewardQueries';
import type { RedemptionRequest } from '@/types';

// creates a mutation hook for redeeming a reward. It calls the action handler to create a redemption request and then invalidates relevant queries to refresh data.
export function useRedeemReward() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      rewardId,
      quantity,
      rewardName,
      pointsCost,
    }: {
      rewardId: string;
      quantity: number;
      rewardName: string;
      pointsCost: number;
    }) => {
      const result = await handleCreateRedemptionRequestAction(rewardId, quantity);
      
      if (!result) {
        throw new Error('Failed to create redemption request');
      }
      
      return { rewardId, rewardName, quantity, pointsCost };
    },
    onSuccess: (data) => {
      const optimisticRequest: RedemptionRequest = {
        id: `optimistic-${data.rewardId}-${Date.now()}`,
        userId: 'current-user',
        userName: 'You',
        rewardId: data.rewardId,
        rewardName: data.rewardName,
        pointsCost: data.pointsCost,
        quantity: data.quantity,
        status: 'pending',
        requestedAt: new Date().toISOString(),
      };

      queryClient.setQueryData<RedemptionRequest[]>(
        redemptionKeys.myRequestsByStatus('pending'),
        (previous = []) => [optimisticRequest, ...previous]
      );

      queryClient.setQueryData<RedemptionRequest[]>(
        redemptionKeys.myRequestsByStatus(undefined),
        (previous = []) => [optimisticRequest, ...previous]
      );

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: redemptionKeys.myRequests() });
      queryClient.invalidateQueries({ queryKey: employeeKeys.points() });
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

export function useCancelMyRedemptionRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ requestId }: { requestId: string }) => {
      const result = await handleCancelMyRedemptionRequestAction(requestId);

      if (!result) {
        throw new Error('Failed to cancel redemption request');
      }

      return { requestId };
    },
    onMutate: async ({ requestId }) => {
      await queryClient.cancelQueries({ queryKey: redemptionKeys.myRequests() });

      const previousPending = queryClient.getQueryData<RedemptionRequest[]>(
        redemptionKeys.myRequestsByStatus('pending')
      );
      const previousAll = queryClient.getQueryData<RedemptionRequest[]>(
        redemptionKeys.myRequestsByStatus(undefined)
      );

      queryClient.setQueryData<RedemptionRequest[]>(
        redemptionKeys.myRequestsByStatus('pending'),
        (existing = []) => existing.filter((request) => request.id !== requestId)
      );

      queryClient.setQueryData<RedemptionRequest[]>(
        redemptionKeys.myRequestsByStatus(undefined),
        (existing = []) =>
          existing.map((request) =>
            request.id === requestId ? { ...request, status: 'rejected' } : request
          )
      );

      return { previousPending, previousAll };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: redemptionKeys.myRequests() });
      queryClient.invalidateQueries({ queryKey: redemptionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: redemptionKeys.all });
      queryClient.invalidateQueries({ queryKey: employeeKeys.points() });
      queryClient.invalidateQueries({ queryKey: ['employeePoints'] });
      queryClient.invalidateQueries({ queryKey: rewardKeys.all });
      queryClient.invalidateQueries({ queryKey: rewardKeys.available() });
    },
    onError: (_error, _variables, context) => {
      if (context?.previousPending) {
        queryClient.setQueryData(redemptionKeys.myRequestsByStatus('pending'), context.previousPending);
      }
      if (context?.previousAll) {
        queryClient.setQueryData(redemptionKeys.myRequestsByStatus(undefined), context.previousAll);
      }
    },
  });
}
