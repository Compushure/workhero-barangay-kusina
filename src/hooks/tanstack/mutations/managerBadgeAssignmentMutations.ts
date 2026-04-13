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
  // take note the utilization of the zustand store here
  // works with the mtutaitons to ensure that both local and server state managemetns are taken into account
  const queryClient = useQueryClient();
  const { startOptimistic, optimisticAssignBadgeToUser, rollback, commit } =
    useManagerBadgeAssignmentStore();

  return useMutation({
    mutationFn: async ({ badgeId, userId }: { badgeId: string; userId: string }) =>
      // the reason whyt the notify is fale is because  the on Sucess again handles the toast messages
    // this prevents 2 scucess toasts from poping out,
    // chose to keep handlers so architecture is consistent
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
    // wehther it's a sucess or not think of the 'finally bolock'
    // just goignt to invatiebatel data qith specified quiert keys
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: badgeAssignmentKeys.users() });
      queryClient.invalidateQueries({ queryKey: badgeAssignmentKeys.manualBadges() });
      queryClient.invalidateQueries({ queryKey: badgeAssignmentKeys.allBadges() });
      queryClient.invalidateQueries({ queryKey: badgeAssignmentKeys.debug() });
      // Invalidate ALL employee badge queries to refresh badge displays everywhere
      queryClient.invalidateQueries({ queryKey: employeeKeys.badges(), refetchType: 'all' });
      // also invalidate invdivual ids to ensure that if the 
      // user has a detailed view open it also gets updated
      if (variables?.userId) {
        queryClient.invalidateQueries({
          queryKey: employeeKeys.userBadges(variables.userId),
          refetchType: 'all',
        });
      }
    },
  });
}

// THIS IS THE BULK ASSIGN FOR QUICK ASSIGN 
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
      // run the promise in parallel and wait for all of them to finish using promise.all
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
      queryClient.invalidateQueries({ queryKey: employeeKeys.badges(), refetchType: 'all' });
      variables?.userIds.forEach((userId) => {
        queryClient.invalidateQueries({
          queryKey: employeeKeys.userBadges(userId),
          refetchType: 'all',
        });
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
      queryClient.invalidateQueries({ queryKey: employeeKeys.badges(), refetchType: 'all' });
    },
  });
}
