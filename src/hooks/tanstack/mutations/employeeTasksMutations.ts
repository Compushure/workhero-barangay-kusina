/**
 * Employee Tasks TanStack Mutations
 * =================================
 * React Query mutation hooks for employee task operations.
 * Provides optimistic updates, error handling, and cache invalidation.
 */

import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import {
  handleSubmitTaskVerification,
  handleClaimTaskPointsAndXP,
} from '@/action-handlers/employee/tasks';
import type { SubmitVerificationResult, ClaimTaskResult } from '@/actions/employee/tasks';
import { employeeTasksKeys } from '../queries/employeeTasksQueries';

/**
 * Mutation for submitting a task for manager verification
 * Automatically invalidates tasks cache on success to refresh the UI
 */
export function useSubmitTaskVerification(): UseMutationResult<
  SubmitVerificationResult | null,
  Error,
  { kpitaskId: string; pendingOrders: number }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ kpitaskId, pendingOrders }) => {
      return await handleSubmitTaskVerification(kpitaskId, pendingOrders);
    },
    onSuccess: () => {
      // Invalidate tasks cache to reflect the status change
      queryClient.invalidateQueries({ queryKey: employeeTasksKeys.lists() });
    },
    onError: (error) => {
      console.error('Failed to submit task verification:', error);
    },
  });
}

/**
 * Mutation for claiming task points and XP
 * Automatically invalidates tasks cache on success to reflect the claimed status
 */
export function useClaimTaskPoints(): UseMutationResult<
  ClaimTaskResult | null,
  Error,
  string
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (kpitaskId: string) => {
      return await handleClaimTaskPointsAndXP(kpitaskId);
    },
    onSuccess: () => {
      // Invalidate tasks cache to reflect the claimed status
      queryClient.invalidateQueries({ queryKey: employeeTasksKeys.lists() });
    },
    onError: (error) => {
      console.error('Failed to claim task points:', error);
    },
  });
}
