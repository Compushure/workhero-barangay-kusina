import { useQuery } from '@tanstack/react-query';
// Shared Mercado query hooks used by both HR and employee pages.
import {
    handleGetAvailableRewardsByIntervalAction,
    handleGetAvailableRewardsByMonthAction,
    handleGetRewardsAction,
} from '@/action-handlers/hr/rewards';
import { Reward } from '@/types';
import { isItemAvailableNow } from '@/utils/date-utils';

/**
 *reward-related queries
 */
export const rewardKeys = {
    all: ['rewards'] as const,
    lists: () => [...rewardKeys.all, 'list'] as const,
    list: () => [...rewardKeys.lists()] as const,
    available: () => [...rewardKeys.all, 'available'] as const,
    availableByMonth: (month: number) => [...rewardKeys.available(), 'month', month] as const,
    availableByInterval: (interval: 'weekly' | 'monthly' | 'yearly') =>
        [...rewardKeys.available(), 'interval', interval] as const,
};

/**
 * Hook to fetch all rewards/mercado items
 * Used by HR to manage all rewards
 */
export function useGetRewards() {
    // Base list for management views and interval checks.
    return useQuery<Reward[], Error>({
        queryKey: rewardKeys.list(),
        queryFn: async () => {
            return await handleGetRewardsAction();
        },
        staleTime: 30 * 1000, // Consider data stale after 30 seconds
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
 * - OR has availableMonth set (for monthly stalls)
 * 
 * Used exclusively by employee pages to show only currently available items
 */
export function useGetAvailableRewards(options?: { enabled?: boolean }) {
    // Employee-facing list: only items currently allowed to appear.
    return useQuery<Reward[], Error>({
        queryKey: rewardKeys.available(),
        enabled: options?.enabled ?? true,
        queryFn: async () => {
            const allRewards = await handleGetRewardsAction();

            console.log('📊 Rewards from database:', allRewards.length);
            console.log('📊 Rewards by month:', allRewards.reduce((acc, r) => {
                if (r.availableMonth) {
                    const key = String(r.availableMonth);
                    acc[key] = (acc[key] || 0) + 1;
                }
                return acc;
            }, {} as Record<string, number>));

            // Filter rewards that are:
            // 1. Active (isActive: true)
            // 2. Available now (or no availability date set)
            // 3. OR has a specific month assigned (for monthly stalls)
            const availableRewards = allRewards.filter((reward) => {
                if (!reward.isActive) return false;
                
                // If reward has a specific month assigned, include it (for monthly stalls)
                if (reward.availableMonth) return true;
                
                // Otherwise check date-based availability
                return isItemAvailableNow(reward.availableDate);
            });

            console.log('✅ Available rewards after filtering:', availableRewards.length);
            console.log('✅ Available by month:', availableRewards.reduce((acc, r) => {
                if (r.availableMonth) {
                    const key = String(r.availableMonth);
                    acc[key] = (acc[key] || 0) + 1;
                }
                return acc;
            }, {} as Record<string, number>));

            return availableRewards;
        },
        staleTime: 10 * 1000, // Consider data stale after 10 seconds for employees
        gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
        refetchOnWindowFocus: true,
        refetchOnMount: true,
        refetchInterval: 30 * 1000, // Poll every 30 seconds for real-time updates
    });
}

/**
 * Hook to fetch available rewards for a specific month (1-12)
 * Used by employee Mercado modal to fetch cards assigned to the selected month
 */
export function useGetAvailableRewardsByMonth(month: number | null) {
    // Loads cards for one month-specific stall.
    return useQuery<Reward[], Error>({
        queryKey: month ? rewardKeys.availableByMonth(month) : [...rewardKeys.available(), 'month', 'none'],
        enabled: typeof month === 'number' && month >= 1 && month <= 12,
        queryFn: async () => {
            return await handleGetAvailableRewardsByMonthAction(month as number);
        },
        staleTime: 10 * 1000,
        gcTime: 5 * 60 * 1000,
        refetchOnWindowFocus: true,
        refetchOnMount: true,
    });
}

/**
 * Hook to fetch available rewards for a specific interval (weekly/monthly/yearly)
 * Used by employee Mercado interval modal
 */
export function useGetAvailableRewardsByInterval(
    interval: 'weekly' | 'monthly' | 'yearly' | null
) {
    // Loads cards for weekly/monthly/yearly stall view.
    return useQuery<Reward[], Error>({
        queryKey: interval
            ? rewardKeys.availableByInterval(interval)
            : [...rewardKeys.available(), 'interval', 'none'],
        enabled: interval === 'weekly' || interval === 'monthly' || interval === 'yearly',
        queryFn: async () => {
            return await handleGetAvailableRewardsByIntervalAction(interval as 'weekly' | 'monthly' | 'yearly');
        },
        // Keep previously rendered cards visible while switching intervals/refetching.
        placeholderData: (previousData) => previousData ?? [],
        staleTime: 10 * 1000,
        gcTime: 5 * 60 * 1000,
        refetchOnWindowFocus: true,
        refetchOnMount: true,
    });
}
