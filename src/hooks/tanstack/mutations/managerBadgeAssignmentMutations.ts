/**
 * Manager Badge Assignment Mutation Hooks
 * =======================================
 */

import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { handleAssignManualBadgeToUser } from '@/action-handlers/manager/badge-assignment';
import { badgeAssignmentKeys } from '../queries/managerBadgeAssignmentQueries';
import { employeeKeys } from '../queries/employeeQueries';

export function useAssignManualBadgeToUser(): UseMutationResult<
  boolean,
  Error,
  { badgeId: string; userId: string }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ badgeId, userId }: { badgeId: string; userId: string }) =>
      handleAssignManualBadgeToUser(badgeId, userId),
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: badgeAssignmentKeys.users() });
      queryClient.invalidateQueries({ queryKey: badgeAssignmentKeys.manualBadges() });
      queryClient.invalidateQueries({ queryKey: badgeAssignmentKeys.allBadges() });
      // Invalidate ALL employee badge queries to refresh badge displays everywhere
      queryClient.invalidateQueries({ queryKey: employeeKeys.badges() });
      if (variables?.userId) {
        queryClient.invalidateQueries({ queryKey: employeeKeys.userBadges(variables.userId) });
      }
    },
  });
}
