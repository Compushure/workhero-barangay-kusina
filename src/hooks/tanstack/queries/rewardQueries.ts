import { useQuery } from '@tanstack/react-query';
import { getRewardsAction } from '@/actions/hr';
import { Reward } from '@/types';
import { isItemAvailableNow } from '@/utils/date-utils';

/**
 * Query keys for reward-related queries
 */
export const rewardKeys = {
    all: ['rewards'] as const,
    lists: () => [...rewardKeys.all, 'list'] as const,
    list: () => [...rewardKeys.lists()] as const,
    available: () => [...rewardKeys.all, 'available'] as const,
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

/**
 * Hook to fetch only available rewards for employees
 * Filters by:
 * - isActive: true (visible to employees)
 * - availableDate: null OR <= current date in Manila timezone
 * 
 * Used exclusively by employee pages to show only currently available items
 */
export function useGetAvailableRewards() {
    return useQuery<Reward[], Error>({
        queryKey: rewardKeys.available(),
        queryFn: async () => {
            const result = await getRewardsAction();

            if (result.error) {
                throw new Error(result.error);
            }

            const allRewards = result.data || [];

            // Filter rewards that are:
            // 1. Active (isActive: true)
            // 2. Available now (or no availability date set)
            const availableRewards = allRewards.filter((reward) => {
                return reward.isActive && isItemAvailableNow(reward.availableDate);
            });

            return availableRewards;
        },
        staleTime: 1 * 60 * 1000, // refresh data every 1 minute
        gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
        refetchOnWindowFocus: true,
        refetchOnMount: true,
    });
}
