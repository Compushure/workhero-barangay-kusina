import { useQuery } from '@tanstack/react-query';
import { getRedemptionRequestsAction, getMyRedemptionRequestsAction } from '@/actions/hr';
import { RedemptionRequest } from '@/types';

/**
 * Query keys for redemption-related queries
 */
export const redemptionKeys = {
  all: ['redemptions'] as const,
  lists: () => [...redemptionKeys.all, 'list'] as const,
  list: (status?: string) => [...redemptionKeys.lists(), { status }] as const,
  myRequests: () => [...redemptionKeys.all, 'my-requests'] as const,
  myRequestsByStatus: (status?: string) => [...redemptionKeys.myRequests(), { status }] as const,
};

/**
 * Hook to fetch redemption requests (for HR)
 * @param status - Optional filter by status ('pending' | 'approved' | 'rejected' | 'all')
 */
export function useGetRedemptionRequests(status?: string) {
  return useQuery<RedemptionRequest[], Error>({
    queryKey: redemptionKeys.list(status),
    queryFn: async () => {
      const result = await getRedemptionRequestsAction(status);

      if (result.error) {
        throw new Error(result.error);
      }

      return result.data || [];
    },
  });
}

/**
 * Hook to fetch current user's redemption requests (for employees)
 * @param status - Optional filter by status ('pending' | 'approved' | 'rejected' | 'all')
 */
export function useGetMyRedemptionRequests(status?: string) {
  return useQuery<RedemptionRequest[], Error>({
    queryKey: redemptionKeys.myRequestsByStatus(status),
    queryFn: async () => {
      const result = await getMyRedemptionRequestsAction(status);

      if (result.error) {
        throw new Error(result.error);
      }

      return result.data || [];
    },
  });
}
