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
import { AddRewardInput, EditRewardInput, RedemptionRequest, Reward } from '@/types';
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

interface OptimisticRedemptionContext {
  previousListQueries: Array<[QueryKey, RedemptionRequest[] | undefined]>;
  previousMyRequestQueries: Array<[QueryKey, RedemptionRequest[] | undefined]>;
  previousRewardQueries: Array<[QueryKey, Reward[] | undefined]>;
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
  previousLatestPeriods: LatestPeriods | null | undefined;
}

const OPTIMISTIC_ROWS = 10;

interface RewardMutationContext {
  previousRewards: Reward[] | undefined;
  temporaryRewardId?: string;
}

function invalidateRewardCaches(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: rewardKeys.all });
  queryClient.invalidateQueries({ queryKey: rewardKeys.available() });
}

function updateRedemptionStatus(
  list: RedemptionRequest[] | undefined,
  params: RedemptionRequestParams,
  status: RedemptionRequest['status']
): RedemptionRequest[] | undefined {
  if (!list) return list;

  return list.map((item) =>
    item.id === params.id
      ? {
          ...item,
          status,
          remarks: params.remarks ?? item.remarks,
        }
      : item
  );
}

function getStatusFilterFromQueryKey(queryKey: QueryKey): string | undefined {
  const maybeFilter = queryKey.at(-1);

  if (!maybeFilter || typeof maybeFilter !== 'object' || Array.isArray(maybeFilter)) {
    return undefined;
  }

  if (!('status' in maybeFilter)) {
    return undefined;
  }

  const status = (maybeFilter as { status?: unknown }).status;
  return typeof status === 'string' ? status : undefined;
}

function updateRedemptionStatusForQuery(
  list: RedemptionRequest[] | undefined,
  queryKey: QueryKey,
  params: RedemptionRequestParams,
  status: RedemptionRequest['status']
): RedemptionRequest[] | undefined {
  if (!list) return list;

  const filterStatus = getStatusFilterFromQueryKey(queryKey);

  // Pending-filtered lists should remove the row immediately after HR decision.
  if (filterStatus === 'pending') {
    return list.filter((item) => item.id !== params.id);
  }

  return updateRedemptionStatus(list, params, status);
}

function findRequestById(
  queryDataSets: Array<[QueryKey, RedemptionRequest[] | undefined]>,
  requestId: string
): RedemptionRequest | undefined {
  for (const [, requests] of queryDataSets) {
    const foundRequest = requests?.find((request) => request.id === requestId);
    if (foundRequest) {
      return foundRequest;
    }
  }

  return undefined;
}

function isRewardAvailableQuery(queryKey: QueryKey): boolean {
  return queryKey[0] === rewardKeys.all[0] && queryKey[1] === 'available';
}

function updateRewardStockAfterApproval(
  rewards: Reward[] | undefined,
  rewardId: string,
  requestedQuantity: number,
  queryKey: QueryKey,
  options?: { reactivateWhenInStock?: boolean; stockDeltaMultiplier?: number }
): Reward[] | undefined {
  if (!rewards) return rewards;

  const stockDeltaMultiplier = options?.stockDeltaMultiplier ?? -1;
  const reactivateWhenInStock = options?.reactivateWhenInStock ?? false;

  const updatedRewards = rewards.map((reward) => {
    if (reward.id !== rewardId) {
      return reward;
    }

    if (reward.quantity === null || reward.quantity === undefined) {
      return reward;
    }

    const nextQuantity = Math.max(0, reward.quantity + requestedQuantity * stockDeltaMultiplier);
    const isOutOfStock = nextQuantity <= 0;

    return {
      ...reward,
      quantity: nextQuantity,
      isOutOfStock,
      isActive: isOutOfStock ? false : reactivateWhenInStock ? true : reward.isActive,
    };
  });

  if (!isRewardAvailableQuery(queryKey)) {
    return updatedRewards;
  }

  return updatedRewards.filter((reward) => reward.isActive !== false);
}

async function optimisticUpdateRedemptionStatus(
  queryClient: ReturnType<typeof useQueryClient>,
  params: RedemptionRequestParams,
  status: RedemptionRequest['status'],
  options?: { applyRewardStockAdjustment?: boolean }
): Promise<OptimisticRedemptionContext> {
  await queryClient.cancelQueries({ queryKey: redemptionKeys.lists() });
  await queryClient.cancelQueries({ queryKey: redemptionKeys.myRequests() });
  await queryClient.cancelQueries({ queryKey: rewardKeys.all });

  const previousListQueries = queryClient.getQueriesData<RedemptionRequest[]>({
    queryKey: redemptionKeys.lists(),
  });
  const previousMyRequestQueries = queryClient.getQueriesData<RedemptionRequest[]>({
    queryKey: redemptionKeys.myRequests(),
  });
  const previousRewardQueries = queryClient.getQueriesData<Reward[]>({
    queryKey: rewardKeys.all,
  });

  for (const [queryKey] of previousListQueries) {
    queryClient.setQueryData<RedemptionRequest[]>(queryKey, (existing) =>
      updateRedemptionStatusForQuery(existing, queryKey, params, status)
    );
  }

  for (const [queryKey] of previousMyRequestQueries) {
    queryClient.setQueryData<RedemptionRequest[]>(queryKey, (existing) =>
      updateRedemptionStatusForQuery(existing, queryKey, params, status)
    );
  }

  if (options?.applyRewardStockAdjustment) {
    const matchedRequest =
      findRequestById(previousMyRequestQueries, params.id) ??
      findRequestById(previousListQueries, params.id);

    if (matchedRequest) {
      const requestedQuantity = matchedRequest.quantity || 1;
      const stockDeltaMultiplier = status === 'approved' ? -1 : 1;
      const reactivateWhenInStock = status === 'rejected';

      for (const [queryKey] of previousRewardQueries) {
        queryClient.setQueryData<Reward[]>(queryKey, (existing) =>
          updateRewardStockAfterApproval(
            existing,
            matchedRequest.rewardId,
            requestedQuantity,
            queryKey,
            {
              reactivateWhenInStock,
              stockDeltaMultiplier,
            }
          )
        );
      }
    }
  }

  return { previousListQueries, previousMyRequestQueries, previousRewardQueries };
}

function rollbackOptimisticRedemptionUpdate(
  queryClient: ReturnType<typeof useQueryClient>,
  context?: OptimisticRedemptionContext
) {
  if (!context) return;

  for (const [queryKey, data] of context.previousListQueries) {
    queryClient.setQueryData(queryKey, data);
  }

  for (const [queryKey, data] of context.previousMyRequestQueries) {
    queryClient.setQueryData(queryKey, data);
  }

  for (const [queryKey, data] of context.previousRewardQueries) {
    queryClient.setQueryData(queryKey, data);
  }
}

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
      ? 'Week'
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
    mutationKey: ['hr-redemption', 'decline'],
    mutationFn: async (params: RedemptionRequestParams): Promise<void> => {
      await handleDeclineRedemptionRequestAction(params);
    },
    onMutate: async (params) => {
      return await optimisticUpdateRedemptionStatus(queryClient, params, 'rejected', {
        applyRewardStockAdjustment: true,
      });
    },
    onError: (_error, _params, context) => {
      rollbackOptimisticRedemptionUpdate(queryClient, context);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: redemptionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: redemptionKeys.all });
      queryClient.invalidateQueries({ queryKey: redemptionKeys.myRequests() });
      queryClient.invalidateQueries({ queryKey: rewardKeys.all });
      queryClient.invalidateQueries({ queryKey: rewardKeys.available() });
    },
  });
}

export function useAcceptRedemptionRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['hr-redemption', 'accept'],
    mutationFn: async (params: RedemptionRequestParams): Promise<void> => {
      await handleAcceptRedemptionRequestAction(params);
    },
    onMutate: async (params) => {
      return await optimisticUpdateRedemptionStatus(queryClient, params, 'approved', {
        applyRewardStockAdjustment: true,
      });
    },
    onError: (_error, _params, context) => {
      rollbackOptimisticRedemptionUpdate(queryClient, context);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: redemptionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: redemptionKeys.all });
      queryClient.invalidateQueries({ queryKey: redemptionKeys.myRequests() });
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
      // Refresh employee points shown in Mercado/header widgets after deduction
      queryClient.invalidateQueries({ queryKey: employeeKeys.points() });
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
    onMutate: async (input): Promise<RewardMutationContext> => {
      await queryClient.cancelQueries({ queryKey: rewardKeys.lists() });

      const previousRewards = queryClient.getQueryData<Reward[]>(rewardKeys.list());
      const temporaryRewardId = `optimistic-reward-${Date.now()}`;

      const optimisticReward: Reward = {
        id: temporaryRewardId,
        name: input.name,
        pointsCost: input.pointsCost,
        quantity: input.quantity,
        redeemingLimit: input.redeemingLimit,
        category: input.category,
        isActive: input.isActive ?? true,
        availableDate: input.availableDate ?? null,
        availableMonth: input.availableMonth ?? null,
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData<Reward[]>(rewardKeys.list(), (existing) => {
        if (!existing) return [optimisticReward];
        return [...existing, optimisticReward];
      });

      return { previousRewards, temporaryRewardId };
    },
    onSuccess: (newReward, _input, context) => {
      if (!newReward) {
        if (context?.previousRewards) {
          queryClient.setQueryData(rewardKeys.list(), context.previousRewards);
        }
        return;
      }

      queryClient.setQueryData<Reward[]>(rewardKeys.list(), (existing) => {
        if (!existing) return [newReward];

        if (!context?.temporaryRewardId) {
          return [...existing, newReward];
        }

        return existing.map((reward) =>
          reward.id === context.temporaryRewardId ? newReward : reward
        );
      });
    },
    onError: (_error, _input, context) => {
      if (context?.previousRewards) {
        queryClient.setQueryData(rewardKeys.list(), context.previousRewards);
      }
    },
    onSettled: () => {
      invalidateRewardCaches(queryClient);
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
    onMutate: async ({ id, input }): Promise<RewardMutationContext> => {
      await queryClient.cancelQueries({ queryKey: rewardKeys.lists() });

      const previousRewards = queryClient.getQueryData<Reward[]>(rewardKeys.list());

      queryClient.setQueryData<Reward[]>(rewardKeys.list(), (existing) => {
        if (!existing) return existing;

        return existing.map((reward) =>
          reward.id === id
            ? {
                ...reward,
                name: input.name ?? reward.name,
                pointsCost: input.pointsCost ?? reward.pointsCost,
                quantity: input.quantity ?? reward.quantity,
                redeemingLimit: input.redeemingLimit ?? reward.redeemingLimit,
                category: input.category ?? reward.category,
                isActive: input.isActive ?? reward.isActive,
                availableDate:
                  input.availableDate === undefined ? reward.availableDate : input.availableDate,
                availableMonth:
                  input.availableMonth === undefined
                    ? reward.availableMonth
                    : input.availableMonth,
              }
            : reward
        );
      });

      return { previousRewards };
    },
    onSuccess: (updatedReward, _variables, context) => {
      if (!updatedReward) {
        if (context?.previousRewards) {
          queryClient.setQueryData(rewardKeys.list(), context.previousRewards);
        }
        return;
      }

      queryClient.setQueryData<Reward[]>(rewardKeys.list(), (existing) => {
        if (!existing) return [updatedReward];
        return existing.map((reward) =>
          reward.id === updatedReward.id ? updatedReward : reward
        );
      });
    },
    onError: (_error, _variables, context) => {
      if (context?.previousRewards) {
        queryClient.setQueryData(rewardKeys.list(), context.previousRewards);
      }
    },
    onSettled: () => {
      invalidateRewardCaches(queryClient);
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
    onMutate: async (id): Promise<RewardMutationContext> => {
      await queryClient.cancelQueries({ queryKey: rewardKeys.lists() });

      const previousRewards = queryClient.getQueryData<Reward[]>(rewardKeys.list());

      queryClient.setQueryData<Reward[]>(rewardKeys.list(), (existing) => {
        if (!existing) return existing;
        return existing.filter((reward) => reward.id !== id);
      });

      return { previousRewards };
    },
    onSuccess: (success, _deletedId, context) => {
      if (!success && context?.previousRewards) {
        queryClient.setQueryData(rewardKeys.list(), context.previousRewards);
      }
    },
    onError: (_error, _deletedId, context) => {
      if (context?.previousRewards) {
        queryClient.setQueryData(rewardKeys.list(), context.previousRewards);
      }
    },
    onSettled: () => {
      invalidateRewardCaches(queryClient);
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
    onMutate: async ({ id, isActive }): Promise<RewardMutationContext> => {
      await queryClient.cancelQueries({ queryKey: rewardKeys.lists() });

      const previousRewards = queryClient.getQueryData<Reward[]>(rewardKeys.list());

      queryClient.setQueryData<Reward[]>(rewardKeys.list(), (existing) => {
        if (!existing) return existing;
        return existing.map((reward) =>
          reward.id === id ? { ...reward, isActive: isActive ?? false } : reward
        );
      });

      return { previousRewards };
    },
    onSuccess: (success, _variables, context) => {
      if (!success && context?.previousRewards) {
        queryClient.setQueryData(rewardKeys.list(), context.previousRewards);
      }
    },
    onError: (_error, _variables, context) => {
      if (context?.previousRewards) {
        queryClient.setQueryData(rewardKeys.list(), context.previousRewards);
      }
    },
    onSettled: () => {
      invalidateRewardCaches(queryClient);
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
    mutationFn: async (params) => {
      const rows = await handleGenerateRankingByPeriodAction(
        params.periodType,
        params.year,
        params.month,
        params.week
      );

      if (!rows || rows.length === 0) {
        throw new Error('No eligible employees found to generate ranking for this period');
      }

      return rows;
    },
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

      toast.success('Ranking generated successfully');
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

      return { previousHrData, previousVisiblePeriods, previousLatestPeriods };
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
        queryClient.setQueryData(employeeKeys.latestPeriods(), context.previousLatestPeriods);
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
