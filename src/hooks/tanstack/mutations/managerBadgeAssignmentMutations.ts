/**
 * Manager Badge Assignment Mutation Hooks
 * =======================================
 */

import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { handleAssignManualBadgeToUser, handleRemoveBadgeAward } from '@/action-handlers/manager/badge-assignment';
import { badgeAssignmentKeys } from '../queries/managerBadgeAssignmentQueries';
import { employeeKeys } from '../queries/employeeQueries';
import { useManagerBadgeAssignmentStore } from '@/store/managerBadgeAssignmentStore';
import { toast } from 'sonner';

type BulkAssignResult = {
  succeededUserIds: string[];
  failedUserIds: string[];
};

export function useAssignManualBadgeToUser(): UseMutationResult<
  boolean,
  Error,
  { badgeId: string; userId: string }
> {
  const queryClient = useQueryClient();
  const { startOptimistic, optimisticAssignBadgeToUser, rollback, commit } =
    useManagerBadgeAssignmentStore();

  return useMutation({
    mutationFn: async ({ badgeId, userId }: { badgeId: string; userId: string }) =>
      handleAssignManualBadgeToUser(badgeId, userId, { notify: false }),
    onMutate: ({ badgeId, userId }) => {
      startOptimistic();
      optimisticAssignBadgeToUser(userId, badgeId);
    },
    onSuccess: (didAssign) => {
      if (didAssign) {
        commit();
        toast.success('Badge awarded');
        return;
      }

      rollback();
      toast.error('Failed to award badge. Rolled back changes.');
    },
    onError: () => {
      rollback();
      toast.error('Failed to award badge. Rolled back changes.');
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: badgeAssignmentKeys.users() });
      queryClient.invalidateQueries({ queryKey: badgeAssignmentKeys.manualBadges() });
      queryClient.invalidateQueries({ queryKey: badgeAssignmentKeys.allBadges() });
      queryClient.invalidateQueries({ queryKey: badgeAssignmentKeys.debug() });
      // Invalidate ALL employee badge queries to refresh badge displays everywhere
      queryClient.invalidateQueries({ queryKey: employeeKeys.badges() });
      if (variables?.userId) {
        queryClient.invalidateQueries({ queryKey: employeeKeys.userBadges(variables.userId) });
      }
    },
  });
}

export function useAssignManualBadgesToUsersBulk(): UseMutationResult<
  BulkAssignResult,
  Error,
  { badgeId: string; userIds: string[] }
> {
  const queryClient = useQueryClient();
  const { startOptimistic, optimisticAssignBadgeToUsers, rollback, commit } =
    useManagerBadgeAssignmentStore();

  return useMutation({
    mutationFn: async ({ badgeId, userIds }: { badgeId: string; userIds: string[] }) => {
      const results = await Promise.all(
        userIds.map(async (userId) => ({
          userId,
          ok: await handleAssignManualBadgeToUser(badgeId, userId, { notify: false }),
        }))
      );

      return {
        succeededUserIds: results.filter((result) => result.ok).map((result) => result.userId),
        failedUserIds: results.filter((result) => !result.ok).map((result) => result.userId),
      };
    },
    onMutate: ({ badgeId, userIds }) => {
      startOptimistic();
      optimisticAssignBadgeToUsers(userIds, badgeId);
    },
    onSuccess: ({ succeededUserIds, failedUserIds }, variables) => {
      if (failedUserIds.length === 0) {
        commit();
        toast.success(`Badge awarded to ${succeededUserIds.length} user${succeededUserIds.length === 1 ? '' : 's'}`);
        return;
      }

      rollback();

      if (succeededUserIds.length > 0) {
        startOptimistic();
        optimisticAssignBadgeToUsers(succeededUserIds, variables.badgeId);
        commit();
      }

      toast.error(
        `Assigned to ${succeededUserIds.length} user${succeededUserIds.length === 1 ? '' : 's'}, failed for ${failedUserIds.length}`
      );
    },
    onError: () => {
      rollback();
      toast.error('Failed to award badges. Rolled back changes.');
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: badgeAssignmentKeys.users() });
      queryClient.invalidateQueries({ queryKey: badgeAssignmentKeys.manualBadges() });
      queryClient.invalidateQueries({ queryKey: badgeAssignmentKeys.allBadges() });
      queryClient.invalidateQueries({ queryKey: badgeAssignmentKeys.debug() });
      queryClient.invalidateQueries({ queryKey: employeeKeys.badges() });
      variables?.userIds.forEach((userId) => {
        queryClient.invalidateQueries({ queryKey: employeeKeys.userBadges(userId) });
      });
    },
  });
}

export function useRemoveBadgeAward(): UseMutationResult<
  boolean,
  Error,
  { awardId: string }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ awardId }: { awardId: string }) => handleRemoveBadgeAward(awardId),
    onSettled: (_data, _error) => {
      queryClient.invalidateQueries({ queryKey: badgeAssignmentKeys.users() });
      queryClient.invalidateQueries({ queryKey: badgeAssignmentKeys.manualBadges() });
      queryClient.invalidateQueries({ queryKey: badgeAssignmentKeys.allBadges() });
      queryClient.invalidateQueries({ queryKey: badgeAssignmentKeys.debug() });
      queryClient.invalidateQueries({ queryKey: employeeKeys.badges() });
    },
  });
}
