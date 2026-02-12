/**
 * Manager Badge Mutation Hooks
 * ============================
 * TanStack Query mutation hooks for badge editor operations.
 */

import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import type { Badge } from '@/types/manager/badge-editor';
import type { AddBadgeInput, EditBadgeInput } from '@/zod/schemas/badge';
import {
  handleAddBadge,
  handleDeleteBadge,
  handleDeleteBadgeImage,
  handleEditBadge,
  handleUploadBadgeImage,
} from '@/action-handlers/manager/badges';
import { badgeKeys } from '../queries/managerBadgeQueries';
import { badgeAssignmentKeys } from '../queries/managerBadgeAssignmentQueries';
import { employeeKeys } from '../queries/employeeQueries';

function invalidateBadgeCaches(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: badgeKeys.lists() });
  queryClient.invalidateQueries({ queryKey: badgeAssignmentKeys.manualBadges() });
  queryClient.invalidateQueries({ queryKey: badgeAssignmentKeys.allBadges() });
  queryClient.invalidateQueries({ queryKey: employeeKeys.badges() });
}

export function useAddBadge(): UseMutationResult<Badge | null, Error, AddBadgeInput> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AddBadgeInput) => handleAddBadge(input),
    onSettled: () => {
      invalidateBadgeCaches(queryClient);
    },
  });
}

export function useEditBadge(): UseMutationResult<
  Badge | null,
  Error,
  { id: string; input: EditBadgeInput; suppressToast?: boolean }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input, suppressToast }: { id: string; input: EditBadgeInput; suppressToast?: boolean }) =>
      handleEditBadge(id, input, { suppressToast }),
    onSettled: () => {
      invalidateBadgeCaches(queryClient);
    },
  });
}

export function useDeleteBadge(): UseMutationResult<boolean, Error, string> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => handleDeleteBadge(id),
    onSettled: () => {
      invalidateBadgeCaches(queryClient);
    },
  });
}

export function useUploadBadgeImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ badgeId, file }: { badgeId: string; file: File }): Promise<string | null> => {
      return await handleUploadBadgeImage(badgeId, file);
    },
    onSuccess: () => {
      invalidateBadgeCaches(queryClient);
    },
  });
}

export function useDeleteBadgeImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (badgeId: string): Promise<boolean> => {
      return await handleDeleteBadgeImage(badgeId);
    },
    onSuccess: () => {
      invalidateBadgeCaches(queryClient);
    },
  });
}
