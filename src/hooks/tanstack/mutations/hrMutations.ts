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
import { AddRewardInput, EditRewardInput, Reward } from '@/types';
import { rewardKeys } from '../queries/rewardQueries';
import { redemptionKeys } from '../queries/redemptionQueries';

interface RedemptionRequestParams {
  id: string;
  remarks?: string;
}

export function useDeclineRedemptionRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: RedemptionRequestParams): Promise<void> => {
      await handleDeclineRedemptionRequestAction(params);
    },
    onSuccess: () => {
      // Invalidate redemption queries to refetch the list
      queryClient.invalidateQueries({ queryKey: redemptionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: redemptionKeys.all });
      // Invalidate rewards to update quantities and stock status
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
    onSuccess: () => {
      // Invalidate redemption queries to refetch the list
      queryClient.invalidateQueries({ queryKey: redemptionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: redemptionKeys.all });
      // Invalidate rewards to update quantities and stock status
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
