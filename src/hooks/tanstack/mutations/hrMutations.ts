import {
  handleAcceptRedemptionRequestAction,
  handleDeclineRedemptionRequestAction,
  handleAddRewardAction,
  handleEditRewardAction,
  handleDeleteRewardAction,
  handleHideRewardAction,
} from '@/action-handlers/hr';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AddRewardInput, EditRewardInput, Reward } from '@/types';
import { rewardKeys } from '../queries/rewardQueries';

interface RedemptionRequestParams {
  id: string;
  remarks?: string;
}

export function useDeclineRedemptionRequest() {
  return useMutation({
    mutationFn: async (params: RedemptionRequestParams): Promise<void> => {
      await handleDeclineRedemptionRequestAction(params);
    },
  });
}

export function useAcceptRedemptionRequest() {
  return useMutation({
    mutationFn: async (params: RedemptionRequestParams): Promise<void> => {
      await handleAcceptRedemptionRequestAction(params);
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
