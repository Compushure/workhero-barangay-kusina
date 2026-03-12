import {
  handleAcceptRedemptionRequestAction,
  handleDeclineRedemptionRequestAction,
} from '@/action-handlers/hr/redemptions';
import {
  handleAddRewardAction,
  handleEditRewardAction,
  handleDeleteRewardAction,
  handleHideRewardAction,
  handleUploadRewardPicture,
} from '@/action-handlers/hr/rewards';
import { handleCreateRedemptionRequestAction } from '@/action-handlers/employee/redemptions';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AddRewardInput, EditRewardInput, RedemptionRequest, Reward } from '@/types';
import { rewardKeys } from '../queries/rewardQueries';
import { redemptionKeys } from '../queries/redemptionQueries';

interface RedemptionRequestParams {
  id: string;
  remarks?: string;
}

interface RedemptionOptimisticContext {
  previousRedemptionLists: Array<[readonly unknown[], RedemptionRequest[] | undefined]>;
  previousMyRequests: Array<[readonly unknown[], RedemptionRequest[] | undefined]>;
  previousRewards: Array<[readonly unknown[], Reward[] | undefined]>;
}

function getStatusFromKey(key: readonly unknown[]): string | undefined {
  const maybeStatusFilter = key[2];
  if (
    maybeStatusFilter &&
    typeof maybeStatusFilter === 'object' &&
    'status' in maybeStatusFilter
  ) {
    const status = (maybeStatusFilter as { status?: string }).status;
    return status;
  }
  return undefined;
}

function shouldIncludeStatus(filterStatus: string | undefined, itemStatus: string): boolean {
  return !filterStatus || filterStatus === 'all' || filterStatus === itemStatus;
}

function getMyStatusFromKey(key: readonly unknown[]): string | undefined {
  const maybeStatusFilter = key[2];
  if (
    maybeStatusFilter &&
    typeof maybeStatusFilter === 'object' &&
    'status' in maybeStatusFilter
  ) {
    return (maybeStatusFilter as { status?: string }).status;
  }
  return undefined;
}

async function optimisticUpdateRedemptionStatus(
  queryClient: ReturnType<typeof useQueryClient>,
  params: RedemptionRequestParams,
  nextStatus: 'approved' | 'rejected'
): Promise<RedemptionOptimisticContext> {
  await queryClient.cancelQueries({ queryKey: redemptionKeys.lists() });
  await queryClient.cancelQueries({ queryKey: redemptionKeys.myRequests() });

  const previousRedemptionLists = queryClient.getQueriesData<RedemptionRequest[]>({
    queryKey: redemptionKeys.lists(),
  });
  const previousMyRequests = queryClient.getQueriesData<RedemptionRequest[]>({
    queryKey: redemptionKeys.myRequests(),
  });
  const previousRewards = queryClient.getQueriesData<Reward[]>({
    queryKey: rewardKeys.all,
  });

  const allKnownRequests = [
    ...previousRedemptionLists.flatMap(([, data]) => data ?? []),
    ...previousMyRequests.flatMap(([, data]) => data ?? []),
  ];
  const existingRequest = allKnownRequests.find((request) => request.id === params.id);

  if (!existingRequest) {
    return { previousRedemptionLists, previousMyRequests, previousRewards };
  }

  const remarks = params.remarks?.trim();
  const updatedRequest: RedemptionRequest = {
    ...existingRequest,
    status: nextStatus,
    remarks: remarks && remarks.length > 0 ? remarks : existingRequest.remarks,
  };

  for (const [queryKey, currentList] of previousRedemptionLists) {
    if (!currentList) continue;

    const statusFilter = getStatusFromKey(queryKey);
    const listWithoutRequest = currentList.filter((request) => request.id !== params.id);
    const shouldInclude = shouldIncludeStatus(statusFilter, nextStatus);

    queryClient.setQueryData<RedemptionRequest[]>(
      queryKey,
      shouldInclude ? [updatedRequest, ...listWithoutRequest] : listWithoutRequest
    );
  }

  for (const [queryKey, currentList] of previousMyRequests) {
    if (!currentList) continue;

    const statusFilter = getMyStatusFromKey(queryKey);
    const listWithoutRequest = currentList.filter((request) => request.id !== params.id);
    const shouldInclude = shouldIncludeStatus(statusFilter, nextStatus);

    queryClient.setQueryData<RedemptionRequest[]>(
      queryKey,
      shouldInclude ? [updatedRequest, ...listWithoutRequest] : listWithoutRequest
    );
  }

  if (nextStatus === 'approved') {
    const deductedQuantity = existingRequest.quantity || 1;
    queryClient.setQueriesData<Reward[]>({ queryKey: rewardKeys.all }, (currentRewards) => {
      if (!currentRewards) return currentRewards;

      return currentRewards.map((reward) => {
        if (reward.id !== existingRequest.rewardId) return reward;
        if (typeof reward.quantity !== 'number') return reward;

        const nextQuantity = Math.max(0, reward.quantity - deductedQuantity);
        return {
          ...reward,
          quantity: nextQuantity,
          isOutOfStock: nextQuantity <= 0,
        };
      });
    });
  }

  return { previousRedemptionLists, previousMyRequests, previousRewards };
}

function rollbackOptimisticRedemptionUpdate(
  queryClient: ReturnType<typeof useQueryClient>,
  context?: RedemptionOptimisticContext
) {
  if (!context) return;

  for (const [queryKey, data] of context.previousRedemptionLists) {
    queryClient.setQueryData(queryKey, data);
  }
  for (const [queryKey, data] of context.previousMyRequests) {
    queryClient.setQueryData(queryKey, data);
  }
  for (const [queryKey, data] of context.previousRewards) {
    queryClient.setQueryData(queryKey, data);
  }
}

export function useDeclineRedemptionRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: RedemptionRequestParams): Promise<void> => {
      await handleDeclineRedemptionRequestAction(params);
    },
    onMutate: async (params) => {
      return await optimisticUpdateRedemptionStatus(queryClient, params, 'rejected');
    },
    onError: (_error, _params, context) => {
      rollbackOptimisticRedemptionUpdate(queryClient, context);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: redemptionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: redemptionKeys.all });
      queryClient.invalidateQueries({ queryKey: redemptionKeys.myRequests() });
      queryClient.invalidateQueries({ queryKey: rewardKeys.all });
      queryClient.invalidateQueries({ queryKey: rewardKeys.available() });
    },
  });
}

export function useAcceptRedemptionRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: RedemptionRequestParams): Promise<void> => {
      await handleAcceptRedemptionRequestAction(params);
    },
    onMutate: async (params) => {
      return await optimisticUpdateRedemptionStatus(queryClient, params, 'approved');
    },
    onError: (_error, _params, context) => {
      rollbackOptimisticRedemptionUpdate(queryClient, context);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: redemptionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: redemptionKeys.all });
      queryClient.invalidateQueries({ queryKey: redemptionKeys.myRequests() });
      queryClient.invalidateQueries({ queryKey: rewardKeys.all });
      queryClient.invalidateQueries({ queryKey: rewardKeys.available() });
    },
  });
}

export function useCreateRedemptionRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ rewardId, quantity }: { rewardId: string; quantity: number }): Promise<boolean> => {
      return await handleCreateRedemptionRequestAction(rewardId, quantity);
    },
    onSuccess: () => {
      // Invalidate redemption queries to refetch the list
      queryClient.invalidateQueries({ queryKey: redemptionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: redemptionKeys.all });
      queryClient.invalidateQueries({ queryKey: redemptionKeys.myRequests() });
      // Invalidate rewards to update quantities after redemption request
      queryClient.invalidateQueries({ queryKey: rewardKeys.all });
      queryClient.invalidateQueries({ queryKey: rewardKeys.available() });
    },
  });
}

/**
 * Mutation hook for adding a new reward/mercado item
 * Optimized to avoid excessive refetching
 */
export function useAddReward() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AddRewardInput): Promise<Reward | null> => {
      return await handleAddRewardAction(input);
    },
    onSuccess: (newReward) => {
      if (newReward) {
        // Optimistically update the cache with the new reward
        queryClient.setQueryData<Reward[]>(rewardKeys.list(), (existing) => {
          if (!existing) return [newReward];
          return [...existing, newReward];
        });
      }

      // Invalidate both HR and Employee queries to ensure real-time updates
      queryClient.invalidateQueries({ queryKey: rewardKeys.all });
      queryClient.invalidateQueries({ queryKey: rewardKeys.available() });
    },
  });
}

/**
 * Mutation hook for editing an existing reward/mercado item
 * Optimized with optimistic updates
 */
export function useEditReward() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: EditRewardInput }): Promise<Reward | null> => {
      return await handleEditRewardAction(id, input);
    },
    onSuccess: (updatedReward) => {
      if (updatedReward) {
        // Optimistically update the cache
        queryClient.setQueryData<Reward[]>(rewardKeys.list(), (existing) => {
          if (!existing) return [updatedReward];
          return existing.map((reward) =>
            reward.id === updatedReward.id ? updatedReward : reward
          );
        });
      }

      // Invalidate both HR and Employee queries to ensure real-time updates
      queryClient.invalidateQueries({ queryKey: rewardKeys.all });
      queryClient.invalidateQueries({ queryKey: rewardKeys.available() });
    },
  });
}

/**
 * Mutation hook for deleting a reward/mercado item
 * Optimized with optimistic updates
 */
export function useDeleteReward() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<boolean> => {
      return await handleDeleteRewardAction(id);
    },
    onSuccess: (success, deletedId) => {
      if (success) {
        // Optimistically remove from cache
        queryClient.setQueryData<Reward[]>(rewardKeys.list(), (existing) => {
          if (!existing) return existing;
          return existing.filter((reward) => reward.id !== deletedId);
        });
      }

      // Invalidate both HR and Employee queries to ensure real-time updates
      queryClient.invalidateQueries({ queryKey: rewardKeys.all });
      queryClient.invalidateQueries({ queryKey: rewardKeys.available() });
    },
  });
}

/**
 * Mutation hook for hiding/unhiding a reward/mercado item
 * Optimized with optimistic updates
 */
export function useHideReward() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive?: boolean }): Promise<boolean> => {
      return await handleHideRewardAction(id, isActive);
    },
    onSuccess: (success, { id, isActive }) => {
      if (success) {
        // Optimistically update the cache
        queryClient.setQueryData<Reward[]>(rewardKeys.list(), (existing) => {
          if (!existing) return existing;
          return existing.map((reward) =>
            reward.id === id ? { ...reward, isActive: isActive ?? false } : reward
          );
        });
      }

      // Invalidate both HR and Employee queries to ensure real-time updates
      queryClient.invalidateQueries({ queryKey: rewardKeys.all });
      queryClient.invalidateQueries({ queryKey: rewardKeys.available() });
    },
  });
}

/**
 * Mutation hook for uploading/updating a reward image
 * Uses optimistic updates with local preview URL for instant feedback
 */
export function useUploadRewardPicture() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      rewardId,
      file,
      rewardName,
    }: {
      rewardId: string;
      file: File;
      rewardName: string;
    }): Promise<string | null> => {
      return await handleUploadRewardPicture(rewardId, file, rewardName);
    },
    // Optimistic update: show local preview immediately
    onMutate: async ({ rewardId, file }) => {
      // Cancel outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: rewardKeys.list() });

      // Snapshot previous state
      const previousRewards = queryClient.getQueryData<Reward[]>(rewardKeys.list());

      // Create local preview URL for immediate display
      const localPreviewUrl = URL.createObjectURL(file);

      // Optimistically update cache with local preview
      queryClient.setQueryData<Reward[]>(rewardKeys.list(), (existing) => {
        if (!existing) return existing;
        return existing.map((reward) =>
          reward.id === rewardId
            ? { ...reward, imageUrl: localPreviewUrl }
            : reward
        );
      });

      return { previousRewards, localPreviewUrl };
    },
    onSuccess: (publicUrl, variables, context) => {
      // Revoke the local preview URL to free memory
      if (context?.localPreviewUrl) {
        URL.revokeObjectURL(context.localPreviewUrl);
      }

      if (publicUrl) {
        // Update cache with actual server URL
        queryClient.setQueryData<Reward[]>(rewardKeys.list(), (existing) => {
          if (!existing) return existing;
          return existing.map((reward) =>
            reward.id === variables.rewardId
              ? { ...reward, imageUrl: publicUrl }
              : reward
          );
        });
      }

      // Invalidate both HR and Employee queries to ensure real-time updates
      queryClient.invalidateQueries({ queryKey: rewardKeys.all });
      queryClient.invalidateQueries({ queryKey: rewardKeys.available() });
    },
    onError: (_error, _variables, context) => {
      // Rollback to previous state on error
      if (context?.previousRewards) {
        queryClient.setQueryData(rewardKeys.list(), context.previousRewards);
      }
      // Revoke the local preview URL
      if (context?.localPreviewUrl) {
        URL.revokeObjectURL(context.localPreviewUrl);
      }
    },
  });
}
