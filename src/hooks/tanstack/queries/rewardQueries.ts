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
        staleTime: 1 * 60 * 1000, // refresh data every 1 minute
        gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
        refetchOnWindowFocus: true,
        refetchOnMount: true,
    });
}
