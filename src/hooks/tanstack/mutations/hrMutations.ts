import {
  handleAcceptRedemptionRequestAction,
  handleDeclineRedemptionRequestAction,
} from '@/action-handlers/hr/redemptions';
import {
  handleGenerateRankingByPeriodAction,
  handleToggleRankingVisibilityAction,
} from '@/action-handlers/hr/leaderboard';
import {
  handleAddRewardAction,
  handleEditRewardAction,
  handleDeleteRewardAction,
  handleHideRewardAction,
  handleUploadRewardPicture,
} from '@/action-handlers/hr/rewards';
import { handleCreateRedemptionRequestAction } from '@/action-handlers/employee/redemptions';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AddRewardInput, EditRewardInput, Reward } from '@/types';
import { rewardKeys } from '../queries/rewardQueries';
import { redemptionKeys } from '../queries/redemptionQueries';
import { hrLeaderboardKeys } from '../queries/hrQueries';
import { employeeKeys } from '../queries/employeeQueries';
import { buildPeriodLabel, getISOWeekDateRangeLabel } from '@/lib/utils/time-period-utils';
import { toast } from 'sonner';
import type { QueryKey } from '@tanstack/react-query';
import type { EnrichedLeaderboardResult } from '@/actions/hr/leaderboard';
import type {
  LeaderboardPlayer,
  RankLogPeriodType,
  RankingLeaderboardViewRow,
  RankingPeriodWithTop,
} from '@/types';
import type { LatestPeriods } from '@/components/employee/leaderboard/period-nav';

interface RedemptionRequestParams {
  id: string;
  remarks?: string;
}

interface GenerateRankingParams {
  periodType: RankLogPeriodType;
  year: number;
  month?: number;
  week?: number;
}

interface GenerateRankingContext {
  periodKey: readonly unknown[];
  previousPeriodData: EnrichedLeaderboardResult | null | undefined;
}

interface VisibilityMutationContext {
  previousHrData: Array<[QueryKey, EnrichedLeaderboardResult | null | undefined]>;
  previousVisiblePeriods: RankingPeriodWithTop[] | null | undefined;
}

const OPTIMISTIC_ROWS = 10;

function toOptimisticPlayers(): (LeaderboardPlayer & { rank: number })[] {
  return Array.from({ length: OPTIMISTIC_ROWS }, (_, index) => {
    const rank = index + 1;
    return {
      id: `optimistic-player-${rank}`,
      name: `Generating rank #${rank}`,
      performanceScore: 0,
      totalCompletedTasks: 0,
      taskPoints: 0,
      badgePoints: 0,
      image: null,
      badges: [],
      rank,
    };
  });
}

function toOptimisticLeaderboardResult(params: GenerateRankingParams): EnrichedLeaderboardResult {
  const periodLabel =
    params.periodType === 'weekly'
      ? `Week ${params.week ?? '-'}`
      : buildPeriodLabel(params.periodType, params.year, params.month, params.week);

  const dateRangeSubtitle =
    params.periodType === 'weekly' && params.week != null
      ? getISOWeekDateRangeLabel(params.year, params.week)
      : null;

  return {
    players: toOptimisticPlayers(),
    periodLabel,
    dateRangeSubtitle,
    rankingPeriodId: `optimistic-${params.periodType}-${params.year}-${params.month ?? 0}-${params.week ?? 0}`,
    isVisible: false,
  };
}

function toLeaderboardResultFromRows(
  rows: RankingLeaderboardViewRow[] | null,
  params: GenerateRankingParams
): EnrichedLeaderboardResult | null {
  if (!rows || rows.length === 0) {
    return null;
  }

  const first = rows[0];
  const periodLabel =
    params.periodType === 'weekly'
      ? first.period_label.replace(/,\s*\d{4}$/, '')
      : first.period_label;

  const dateRangeSubtitle =
    params.periodType === 'weekly' && params.week != null
      ? getISOWeekDateRangeLabel(params.year, params.week)
      : null;

  const players: (LeaderboardPlayer & { rank: number })[] = rows.map((row) => ({
    id: row.user_id,
    name: row.user_name,
    performanceScore: row.performance_score,
    totalCompletedTasks: row.completed_task_count,
    taskPoints: row.total_kpi_points,
    badgePoints: row.badge_points,
    image: null,
    badges: [],
    rank: row.rank,
  }));

  return {
    players,
    periodLabel,
    dateRangeSubtitle,
    rankingPeriodId: first.ranking_period_id,
    isVisible: first.is_visible,
  };
}

function toPeriodKey(params: GenerateRankingParams): readonly unknown[] {
  return hrLeaderboardKeys.byPeriod(
    params.periodType,
    params.year,
    params.periodType === 'weekly' ? params.week : undefined,
    params.periodType === 'monthly' ? params.month : undefined
  );
}

export function useDeclineRedemptionRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: RedemptionRequestParams): Promise<void> => {
      await handleDeclineRedemptionRequestAction(params);
    },
    onSuccess: () => {
      // Invalidate redemption queries to refetch the list
      queryClient.invalidateQueries({ queryKey: redemptionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: redemptionKeys.all });
      // Invalidate rewards to update quantities and stock status
      queryClient.invalidateQueries({ queryKey: rewardKeys.all });
      queryClient.invalidateQueries({ queryKey: rewardKeys.available() });
    },
  });
}

export function useAcceptRedemptionRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: RedemptionRequestParams): Promise<void> => {
      await handleAcceptRedemptionRequestAction(params);
    },
    onSuccess: () => {
      // Invalidate redemption queries to refetch the list
      queryClient.invalidateQueries({ queryKey: redemptionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: redemptionKeys.all });
      // Invalidate rewards to update quantities and stock status
      queryClient.invalidateQueries({ queryKey: rewardKeys.all });
      queryClient.invalidateQueries({ queryKey: rewardKeys.available() });
    },
  });
}

export function useCreateRedemptionRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ rewardId, quantity }: { rewardId: string; quantity: number }): Promise<boolean> => {
      return await handleCreateRedemptionRequestAction(rewardId, quantity);
    },
    onSuccess: () => {
      // Invalidate redemption queries to refetch the list
      queryClient.invalidateQueries({ queryKey: redemptionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: redemptionKeys.all });
      queryClient.invalidateQueries({ queryKey: redemptionKeys.myRequests() });
      // Invalidate rewards to update quantities after redemption request
      queryClient.invalidateQueries({ queryKey: rewardKeys.all });
      queryClient.invalidateQueries({ queryKey: rewardKeys.available() });
    },
  });
}

/**
 * Mutation hook for adding a new reward/mercado item
 * Optimized to avoid excessive refetching
 */
export function useAddReward() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AddRewardInput): Promise<Reward | null> => {
      return await handleAddRewardAction(input);
    },
    onSuccess: (newReward) => {
      if (newReward) {
        // Optimistically update the cache with the new reward
        queryClient.setQueryData<Reward[]>(rewardKeys.list(), (existing) => {
          if (!existing) return [newReward];
          return [...existing, newReward];
        });
      }

      // Invalidate both HR and Employee queries to ensure real-time updates
      queryClient.invalidateQueries({ queryKey: rewardKeys.all });
      queryClient.invalidateQueries({ queryKey: rewardKeys.available() });
    },
  });
}

/**
 * Mutation hook for editing an existing reward/mercado item
 * Optimized with optimistic updates
 */
export function useEditReward() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: EditRewardInput }): Promise<Reward | null> => {
      return await handleEditRewardAction(id, input);
    },
    onSuccess: (updatedReward) => {
      if (updatedReward) {
        // Optimistically update the cache
        queryClient.setQueryData<Reward[]>(rewardKeys.list(), (existing) => {
          if (!existing) return [updatedReward];
          return existing.map((reward) =>
            reward.id === updatedReward.id ? updatedReward : reward
          );
        });
      }

      // Invalidate both HR and Employee queries to ensure real-time updates
      queryClient.invalidateQueries({ queryKey: rewardKeys.all });
      queryClient.invalidateQueries({ queryKey: rewardKeys.available() });
    },
  });
}

/**
 * Mutation hook for deleting a reward/mercado item
 * Optimized with optimistic updates
 */
export function useDeleteReward() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<boolean> => {
      return await handleDeleteRewardAction(id);
    },
    onSuccess: (success, deletedId) => {
      if (success) {
        // Optimistically remove from cache
        queryClient.setQueryData<Reward[]>(rewardKeys.list(), (existing) => {
          if (!existing) return existing;
          return existing.filter((reward) => reward.id !== deletedId);
        });
      }

      // Invalidate both HR and Employee queries to ensure real-time updates
      queryClient.invalidateQueries({ queryKey: rewardKeys.all });
      queryClient.invalidateQueries({ queryKey: rewardKeys.available() });
    },
  });
}

/**
 * Mutation hook for hiding/unhiding a reward/mercado item
 * Optimized with optimistic updates
 */
export function useHideReward() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive?: boolean }): Promise<boolean> => {
      return await handleHideRewardAction(id, isActive);
    },
    onSuccess: (success, { id, isActive }) => {
      if (success) {
        // Optimistically update the cache
        queryClient.setQueryData<Reward[]>(rewardKeys.list(), (existing) => {
          if (!existing) return existing;
          return existing.map((reward) =>
            reward.id === id ? { ...reward, isActive: isActive ?? false } : reward
          );
        });
      }

      // Invalidate both HR and Employee queries to ensure real-time updates
      queryClient.invalidateQueries({ queryKey: rewardKeys.all });
      queryClient.invalidateQueries({ queryKey: rewardKeys.available() });
    },
  });
}

/**
 * Mutation hook for uploading/updating a reward image
 * Uses optimistic updates with local preview URL for instant feedback
 */
export function useUploadRewardPicture() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      rewardId,
      file,
      rewardName,
    }: {
      rewardId: string;
      file: File;
      rewardName: string;
    }): Promise<string | null> => {
      return await handleUploadRewardPicture(rewardId, file, rewardName);
    },
    // Optimistic update: show local preview immediately
    onMutate: async ({ rewardId, file }) => {
      // Cancel outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: rewardKeys.list() });

      // Snapshot previous state
      const previousRewards = queryClient.getQueryData<Reward[]>(rewardKeys.list());

      // Create local preview URL for immediate display
      const localPreviewUrl = URL.createObjectURL(file);

      // Optimistically update cache with local preview
      queryClient.setQueryData<Reward[]>(rewardKeys.list(), (existing) => {
        if (!existing) return existing;
        return existing.map((reward) =>
          reward.id === rewardId
            ? { ...reward, imageUrl: localPreviewUrl }
            : reward
        );
      });

      return { previousRewards, localPreviewUrl };
    },
    onSuccess: (publicUrl, variables, context) => {
      // Revoke the local preview URL to free memory
      if (context?.localPreviewUrl) {
        URL.revokeObjectURL(context.localPreviewUrl);
      }

      if (publicUrl) {
        // Update cache with actual server URL
        queryClient.setQueryData<Reward[]>(rewardKeys.list(), (existing) => {
          if (!existing) return existing;
          return existing.map((reward) =>
            reward.id === variables.rewardId
              ? { ...reward, imageUrl: publicUrl }
              : reward
          );
        });
      }

      // Invalidate both HR and Employee queries to ensure real-time updates
      queryClient.invalidateQueries({ queryKey: rewardKeys.all });
      queryClient.invalidateQueries({ queryKey: rewardKeys.available() });
    },
    onError: (_error, _variables, context) => {
      // Rollback to previous state on error
      if (context?.previousRewards) {
        queryClient.setQueryData(rewardKeys.list(), context.previousRewards);
      }
      // Revoke the local preview URL
      if (context?.localPreviewUrl) {
        URL.revokeObjectURL(context.localPreviewUrl);
      }
    },
  });
}

export function useGenerateRankingByPeriod() {
  const queryClient = useQueryClient();

  return useMutation<RankingLeaderboardViewRow[] | null, Error, GenerateRankingParams, GenerateRankingContext>({
    mutationFn: async (params) =>
      handleGenerateRankingByPeriodAction(
        params.periodType,
        params.year,
        params.month,
        params.week
      ),
    onMutate: async (params) => {
      const periodKey = toPeriodKey(params);
      await queryClient.cancelQueries({ queryKey: periodKey });
      const previousPeriodData = queryClient.getQueryData<EnrichedLeaderboardResult | null>(periodKey);

      queryClient.setQueryData<EnrichedLeaderboardResult>(
        periodKey,
        toOptimisticLeaderboardResult(params)
      );

      return { periodKey, previousPeriodData };
    },
    onSuccess: (rows, params, context) => {
      if (context) {
        queryClient.setQueryData<EnrichedLeaderboardResult | null>(
          context.periodKey,
          toLeaderboardResultFromRows(rows, params)
        );
      }

      if (rows && rows.length > 0) {
        toast.success('Ranking generated successfully');
      } else {
        toast.error('No eligible employees found to generate ranking for this period');
      }
    },
    onError: (error, _params, context) => {
      if (context) {
        queryClient.setQueryData(context.periodKey, context.previousPeriodData);
      }
      toast.error(error.message || 'Failed to generate ranking');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: hrLeaderboardKeys.all });
      queryClient.invalidateQueries({ queryKey: employeeKeys.visiblePeriods() });
      queryClient.invalidateQueries({ queryKey: employeeKeys.topWeeklyRanks() });
      queryClient.invalidateQueries({ queryKey: [...employeeKeys.all, 'top-ranks-by-period'] });
    },
  });
}

export function useToggleRankingVisibility() {
  const queryClient = useQueryClient();

  return useMutation<
    { id: string; is_visible: boolean },
    Error,
    { rankingPeriodId: string; isVisible: boolean },
    VisibilityMutationContext
  >({
    mutationFn: async ({ rankingPeriodId, isVisible }) =>
      handleToggleRankingVisibilityAction(rankingPeriodId, isVisible),
    onMutate: async ({ rankingPeriodId, isVisible }) => {
      await queryClient.cancelQueries({ queryKey: hrLeaderboardKeys.all });
      await queryClient.cancelQueries({ queryKey: employeeKeys.visiblePeriods() });
      await queryClient.cancelQueries({ queryKey: employeeKeys.latestPeriods() });

      const previousHrData = queryClient.getQueriesData<EnrichedLeaderboardResult | null>({
        queryKey: hrLeaderboardKeys.all,
      });
      const previousVisiblePeriods = queryClient.getQueryData<RankingPeriodWithTop[] | null>(
        employeeKeys.visiblePeriods()
      );
      const previousLatestPeriods = queryClient.getQueryData<LatestPeriods | null>(
        employeeKeys.latestPeriods()
      );

      queryClient.setQueriesData<EnrichedLeaderboardResult | null>(
        { queryKey: hrLeaderboardKeys.all },
        (existing) => {
          if (!existing || existing.rankingPeriodId !== rankingPeriodId) {
            return existing;
          }
          return { ...existing, isVisible };
        }
      );

      queryClient.setQueryData<RankingPeriodWithTop[] | null>(
        employeeKeys.visiblePeriods(),
        (existing) => {
          if (!existing) return existing;
          if (isVisible) return existing;
          return existing.filter((period) => period.id !== rankingPeriodId);
        }
      );

      return { previousHrData, previousVisiblePeriods };
    },
    onSuccess: (_data, { isVisible }) => {
      toast.success(
        isVisible ? 'Ranking is now visible to employees' : 'Ranking hidden from employees'
      );
    },
    onError: (error, _variables, context) => {
      if (context) {
        for (const [queryKey, data] of context.previousHrData) {
          queryClient.setQueryData(queryKey, data);
        }
        queryClient.setQueryData(employeeKeys.visiblePeriods(), context.previousVisiblePeriods);
      }
      toast.error(error.message || 'Failed to update ranking visibility');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: hrLeaderboardKeys.all });
      queryClient.invalidateQueries({ queryKey: employeeKeys.visiblePeriods() });
      queryClient.invalidateQueries({ queryKey: employeeKeys.topWeeklyRanks() });
      queryClient.invalidateQueries({ queryKey: [...employeeKeys.all, 'top-ranks-by-period'] });
    },
  });
}