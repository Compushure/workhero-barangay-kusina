import { useQuery } from '@tanstack/react-query';
import { getRewardsAction } from '@/actions/hr';
import { Reward } from '@/types';

/**
 * Query keys for reward-related queries
 */
export const rewardKeys = {
    all: ['rewards'] as const,
    lists: () => [...rewardKeys.all, 'list'] as const,
    list: () => [...rewardKeys.lists()] as const,
};

/**
 * Hook to fetch all rewards/mercado items
 * Optimized with caching for better performance
 */
export function useGetRewards() {
    return useQuery<Reward[], Error>({
        queryKey: rewardKeys.list(),
        queryFn: async () => {
            const result = await getRewardsAction();

            if (result.error) {
                throw new Error(result.error);
            }

            return result.data || [];
        },
        staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
        gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
        refetchOnWindowFocus: false, // Don't refetch on window focus
        refetchOnMount: false, // Don't refetch on mount if data is still fresh
    });
}
