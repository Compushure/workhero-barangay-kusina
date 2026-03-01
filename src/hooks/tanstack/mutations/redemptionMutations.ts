import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  handleCancelMyRedemptionRequestAction,
  handleCreateRedemptionRequestAction,
} from '@/action-handlers/employee/redemptions';
import { employeeKeys } from '../queries/employeeQueries';
import { redemptionKeys } from '../queries/redemptionQueries';
import { rewardKeys } from '../queries/rewardQueries';
import type { RedemptionRequest } from '@/types';

export function useRedeemReward() {
  const queryClient = useQueryClient();

  return useMutation({
    //logic for item request action: send redeem payload to server
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
      //logic for pending UI sync: add optimistic pending request
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

      //logic for request refresh: revalidate points, requests, and rewards
      queryClient.invalidateQueries({ queryKey: redemptionKeys.myRequests() });
      queryClient.invalidateQueries({ queryKey: employeeKeys.points() });
      queryClient.invalidateQueries({ queryKey: ['employeePoints'] });
      queryClient.invalidateQueries({ queryKey: rewardKeys.all });
      queryClient.invalidateQueries({ queryKey: rewardKeys.available() });

    },
    onError: (error) => {
      console.error('Redemption error:', error);
    },
  });
}

export function useCancelMyRedemptionRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    //logic for cancel request action: call cancel endpoint
    mutationFn: async ({ requestId }: { requestId: string }) => {
      const result = await handleCancelMyRedemptionRequestAction(requestId);

      if (!result) {
        throw new Error('Failed to cancel redemption request');
      }

      return { requestId };
    },
    onMutate: async ({ requestId }) => {
      //logic for optimistic cancel state: remove pending item immediately
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
      //logic for cancel item points: refresh points and request state
      queryClient.invalidateQueries({ queryKey: redemptionKeys.myRequests() });
      queryClient.invalidateQueries({ queryKey: redemptionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: redemptionKeys.all });
      queryClient.invalidateQueries({ queryKey: employeeKeys.points() });
      queryClient.invalidateQueries({ queryKey: ['employeePoints'] });
      queryClient.invalidateQueries({ queryKey: rewardKeys.all });
      queryClient.invalidateQueries({ queryKey: rewardKeys.available() });
    },
    onError: (_error, _variables, context) => {
      //logic for cancel rollback: restore previous cache snapshots
      if (context?.previousPending) {
        queryClient.setQueryData(redemptionKeys.myRequestsByStatus('pending'), context.previousPending);
      }
      if (context?.previousAll) {
        queryClient.setQueryData(redemptionKeys.myRequestsByStatus(undefined), context.previousAll);
      }
    },
  });
}
