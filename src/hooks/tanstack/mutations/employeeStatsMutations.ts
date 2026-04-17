import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { handleAdjustActiveUserXPByDelta } from '@/action-handlers/employee/stats';
import type { XPDebugUpdateResult } from '@/actions/employee/stats';
import { employeeKeys } from '../queries/employeeQueries';
import { profileKeys } from '../queries/profileQueries';

// this was for the testing, but basically forces a refetch so changes are reflcted
export function useAdjustActiveUserXPByDelta(): UseMutationResult<
  XPDebugUpdateResult | null,
  Error,
  number
> {
  const queryClient = useQueryClient();
  

  return useMutation({
    mutationFn: async (delta: number) => {
      return await handleAdjustActiveUserXPByDelta(delta);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.xp() });
      queryClient.invalidateQueries({ queryKey: employeeKeys.points() });
      queryClient.invalidateQueries({ queryKey: employeeKeys.rank() });
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
    onError: (error) => {
      console.error('Failed to adjust active user XP:', error);
    },
  });
}
