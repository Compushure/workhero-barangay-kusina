import {
  handleAcceptRedemptionRequestAction,
  handleDeclineRedemptionRequestAction,
  handleAddRewardAction,
  handleEditRewardAction,
  handleDeleteRewardAction,
  handleHideRewardAction,
  handleCreateRedemptionRequestAction,
  handleUploadRewardPicture,
} from '@/action-handlers/hr';
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
    },
  });
}

/**
 * Mutation hook for adding a new reward/mercado item
 */
export function useAddReward() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AddRewardInput): Promise<Reward | null> => {
      return await handleAddRewardAction(input);
    },
    onSuccess: () => {
      // Invalidate and refetch rewards list immediately
      queryClient.invalidateQueries({ queryKey: rewardKeys.lists() });
      queryClient.invalidateQueries({ queryKey: rewardKeys.all });

      // Force immediate refetch
      queryClient.refetchQueries({ queryKey: rewardKeys.list() });
    },
  });
}

/**
 * Mutation hook for editing an existing reward/mercado item
 */
export function useEditReward() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: EditRewardInput }): Promise<Reward | null> => {
      return await handleEditRewardAction(id, input);
    },
    onSuccess: () => {
      // Invalidate and refetch rewards list immediately
      queryClient.invalidateQueries({ queryKey: rewardKeys.lists() });
      queryClient.invalidateQueries({ queryKey: rewardKeys.all });

      // Force immediate refetch
      queryClient.refetchQueries({ queryKey: rewardKeys.list() });
    },
  });
}

/**
 * Mutation hook for deleting a reward/mercado item
 */
export function useDeleteReward() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<boolean> => {
      return await handleDeleteRewardAction(id);
    },
    onSuccess: () => {
      // Invalidate and refetch rewards list immediately
      queryClient.invalidateQueries({ queryKey: rewardKeys.lists() });
      queryClient.invalidateQueries({ queryKey: rewardKeys.all });

      // Force immediate refetch
      queryClient.refetchQueries({ queryKey: rewardKeys.list() });
    },
  });
}

/**
 * Mutation hook for hiding/unhiding a reward/mercado item
 */
export function useHideReward() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive?: boolean }): Promise<boolean> => {
      return await handleHideRewardAction(id, isActive);
    },
    onSuccess: () => {
      // Invalidate and refetch rewards list immediately
      queryClient.invalidateQueries({ queryKey: rewardKeys.lists() });
      queryClient.invalidateQueries({ queryKey: rewardKeys.all });

      // Force immediate refetch
      queryClient.refetchQueries({ queryKey: rewardKeys.list() });
    },
  });
}

/**
 * Mutation hook for uploading/updating a reward image
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
    onSuccess: (publicUrl, variables) => {
      if (publicUrl) {
        // Optimistically update cached rewards with new image URL
        queryClient.setQueryData<Reward[]>(rewardKeys.list(), (existing) => {
          if (!existing) return existing;
          return existing.map((reward) =>
            reward.id === variables.rewardId ? { ...reward, imageUrl: publicUrl } : reward
          );
        });
      }

      // Ensure reward list reflects latest image URL
      queryClient.invalidateQueries({ queryKey: rewardKeys.lists() });
      queryClient.invalidateQueries({ queryKey: rewardKeys.all });
      queryClient.refetchQueries({ queryKey: rewardKeys.list() });
    },
  });
}
