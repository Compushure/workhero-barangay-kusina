'use server';

import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { safeAction, type ActionResult } from '@/lib/utils/safe-action';
import { unstable_noStore as noStore } from 'next/cache';
import type {
  LeaderboardAsOfRow,
  LeaderboardPlayer,
  RankLogPeriodType,
  RankingLeaderboardViewRow,
} from '@/types';

import {
  getCutoffForSpecificPeriod,
  getPeriodDateRangeSubtitle,
  getPeriodStartEnd,
} from '@/lib/utils/time-period-utils';
import { enrichRankingPlayers } from '@/lib/utils/enrich-ranking';
import { format, getISOWeek, getISOWeekYear } from 'date-fns';

// ---------------------------------------------------------------------------
// Enriched leaderboard result — returned by getEnrichedLeaderboardByPeriod
// ---------------------------------------------------------------------------
export interface EnrichedLeaderboardResult {
  players: (LeaderboardPlayer & { rank: number })[];
  periodLabel: string;
  dateRangeSubtitle: string | null;
  rankingPeriodId: string;
  isVisible: boolean;
}

/**
 * Fetch and enrich ranking entries for a specific period in a single server action.
 * Fetches from ranking_leaderboard_view and enriches with enrichRankingPlayers so client
 * components can call this once via TanStack Query without triggering server-side Suspense re-renders.
 */
export async function getEnrichedLeaderboardByPeriod(
  periodType: RankLogPeriodType,
  year: number,
  month?: number,
  week?: number
): Promise<ActionResult<EnrichedLeaderboardResult | null>> {
  return safeAction(async () => {
    noStore();
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Not authenticated');
    }

    const { start } = getPeriodStartEnd(
      periodType,
      year,
      periodType === 'weekly' ? undefined : month,
      periodType === 'weekly' ? week : undefined
    );
    const periodStart = toDateStr(start);

    const { data, error } = await supabase
      .from('ranking_leaderboard_view')
      .select('*')
      .eq('period_type', periodType)
      .eq('period_start', periodStart)
      .order('rank');

    if (error) {
      throw new Error(`Failed to fetch ranking: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return null;
    }

    const rows = data as RankingLeaderboardViewRow[];
    const periodInfo = rows[0];
    const enrichedPlayers = await enrichRankingPlayers(rows, supabase);

    const periodLabel =
      periodType === 'weekly'
        ? periodInfo.period_label.replace(/,\s*\d{4}$/, '')
        : periodInfo.period_label;

    return {
      players: enrichedPlayers,
      periodLabel,
      dateRangeSubtitle: getPeriodDateRangeSubtitle(periodInfo),
      rankingPeriodId: periodInfo.ranking_period_id,
      isVisible: periodInfo.is_visible,
    };
  });
}



// ---------------------------------------------------------------------------
// Ranking Actions (normalized schema: RankingPeriod + RankingEntry)
// ---------------------------------------------------------------------------

const MIN_EMPLOYEES_FOR_RANKING = 1;

/** Format a Date as YYYY-MM-DD for Supabase date columns */
function toDateStr(d: Date): string {
  return format(d, 'yyyy-MM-dd');
}

function buildPeriodLabelLikeView(periodType: RankLogPeriodType, periodStartDate: Date): string {
  switch (periodType) {
    case 'weekly': {
      return `Week ${getISOWeek(periodStartDate)}, ${getISOWeekYear(periodStartDate)}`;
    }
    case 'monthly': {
      return format(periodStartDate, 'MMMM yyyy');
    }
    case 'yearly': {
      return `Year ${format(periodStartDate, 'yyyy')}`;
    }
  }
}


/**
 * Generate ranking for a specific period.
 * Computes via RPC `get_leaderboard_as_of`, persists RankingPeriod + RankingEntry, returns view rows.
 * If the period already exists (unique constraint), returns the existing rows so the UI can refresh.
 */
export async function generateRankingByPeriod(
  periodType: RankLogPeriodType,
  year: number,
  month?: number,
  week?: number
): Promise<ActionResult<RankingLeaderboardViewRow[] | null>> {
  return safeAction(async () => {
    noStore();

    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Not authenticated');
    }

    const { start, end } = getPeriodStartEnd(
      periodType,
      year,
      periodType === 'weekly' ? undefined : month,
      periodType === 'weekly' ? week : undefined
    );
    const periodStart = toDateStr(start);
    const periodEnd = toDateStr(end);

    const cutoff = getCutoffForSpecificPeriod(
      periodType,
      year,
      periodType === 'weekly' ? undefined : month,
      periodType === 'weekly' ? week : undefined
    );

    const { data: leaderboardData, error: lbError } = await supabase.rpc('get_leaderboard_as_of', {
      p_cutoff: cutoff,
    });

    if (lbError) {
      throw new Error(`Failed to compute leaderboard: ${lbError.message}`);
    }

    const leaderboardRows = (leaderboardData ?? []) as LeaderboardAsOfRow[];
    if (leaderboardRows.length < MIN_EMPLOYEES_FOR_RANKING) {
      return null;
    }

    const { data: period, error: periodError } = await supabase
      .from('RankingPeriod')
      .insert({
        period_type: periodType,
        period_start: periodStart,
        period_end: periodEnd,
        is_visible: true,
      })
      .select()
      .single();

    if (periodError) {
      if (periodError.code === '23505') {
        const { data: raceWinner, error: raceError } = await supabase
          .from('RankingPeriod')
          .select('*')
          .eq('period_type', periodType)
          .eq('period_start', periodStart)
          .single();
        if (raceError || !raceWinner) {
          throw new Error(`Failed to fetch existing ranking period: ${raceError?.message ?? 'Unknown error'}`);
        }
        const { data: winnerRows, error: winnerRowsError } = await supabase
          .from('ranking_leaderboard_view')
          .select('*')
          .eq('period_type', periodType)
          .eq('period_start', periodStart)
          .order('rank');
        if (winnerRowsError) {
          throw new Error(`Failed to fetch ranking after race: ${winnerRowsError.message}`);
        }
        return (winnerRows ?? []) as RankingLeaderboardViewRow[];
      }
      throw new Error(`Failed to save ranking period: ${periodError.message}`);
    }

    const entriesToInsert = leaderboardRows.map((row, idx) => ({
      ranking_period_id: period.id,
      user_id: row.user_id,
      rank: idx + 1,
      performance_score: Number(row.performance_score ?? 0),
      total_kpi_points: Number(row.total_kpi_points ?? 0),
      badge_points: Number(row.badge_points ?? 0),
      completed_task_count: Number(row.task_count ?? 0),
    }));

    const { data: insertedEntries, error: entriesError } = await supabase
      .from('RankingEntry')
      .insert(entriesToInsert)
      .select('id, user_id, rank, performance_score, total_kpi_points, badge_points, completed_task_count');

    if (entriesError) {
      throw new Error(`Failed to save ranking entries: ${entriesError.message}`);
    }

    const entryIdByUserId = new Map<string, string>();
    for (const entry of (insertedEntries ?? []) as { id: string; user_id: string }[]) {
      entryIdByUserId.set(entry.user_id, entry.id);
    }

    const periodLabel = buildPeriodLabelLikeView(periodType, start);

    const resultRows: RankingLeaderboardViewRow[] = leaderboardRows.map((row, idx) => {
      const entryId = entryIdByUserId.get(row.user_id);
      if (!entryId) {
        throw new Error('Failed to return generated leaderboard rows (missing entry id)');
      }

      const userName = row.user_name ?? '';
      if (!userName) {
        throw new Error('Failed to return generated leaderboard rows (missing user name)');
      }

      return {
        ranking_period_id: period.id,
        period_type: periodType,
        period_start: periodStart,
        period_end: periodEnd,
        is_visible: period.is_visible,
        generated_at: period.generated_at,
        period_label: periodLabel,
        entry_id: entryId,
        user_id: row.user_id,
        user_name: userName,
        rank: idx + 1,
        performance_score: Number(row.performance_score ?? 0),
        total_kpi_points: Number(row.total_kpi_points ?? 0),
        badge_points: Number(row.badge_points ?? 0),
        completed_task_count: Number(row.task_count ?? 0),
      };
    });

    return resultRows;
  });
}

/**
 * Check whether a ranking already exists for a given period.
 */
export async function checkRankingExists(
  periodType: RankLogPeriodType,
  year: number,
  month?: number,
  week?: number
): Promise<ActionResult<boolean>> {
  return safeAction(async () => {
    noStore();
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Not authenticated');
    }

    const { start } = getPeriodStartEnd(
      periodType,
      year,
      periodType === 'weekly' ? undefined : month,
      periodType === 'weekly' ? week : undefined
    );
    const periodStart = toDateStr(start);

    const { data, error } = await supabase
      .from('RankingPeriod')
      .select('id')
      .eq('period_type', periodType)
      .eq('period_start', periodStart)
      .limit(1)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to check ranking: ${error.message}`);
    }

    return !!data;
  });
}

/**
 * Toggle visibility of a generated ranking.
 */
export async function toggleRankingVisibility(
  rankingPeriodId: string,
  isVisible: boolean
): Promise<ActionResult<{ id: string; is_visible: boolean }>> {
  return safeAction(async () => {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('RankingPeriod')
      .update({ is_visible: isVisible })
      .eq('id', rankingPeriodId)
      .select('id, is_visible')
      .single();

    if (error) {
      throw new Error(`Failed to update visibility: ${error.message}`);
    }

    return data as { id: string; is_visible: boolean };
  });
}


/**
 * Returns the latest generated weekly period (year + ISO week) for default leaderboard view.
 * Uses admin client to bypass RLS so non-visible periods are included.
 * Used so the HR leaderboard page can show the latest week by default instead of "Select a Period".
 */
export async function getLatestWeeklyPeriod(): Promise<
  ActionResult<{ year: number; week: number; is_visible: boolean } | null>
> {
  return safeAction(async () => {
    const { data, error } = await supabaseAdmin
      .from('RankingPeriod')
      .select('period_start, is_visible')
      .eq('period_type', 'weekly')
      .order('period_start', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch latest ranking period: ${error.message}`);
    }

    if (!data?.period_start) {
      return null;
    }

    const startDate = new Date(data.period_start + 'T00:00:00');
    return {
      year: startDate.getFullYear(),
      week: getISOWeek(startDate),
      is_visible: data.is_visible,
    };
  });
}

/**
 * Returns the latest generated monthly period (year + month) from HR.
 * Uses admin client to bypass RLS so non-visible periods are included.
 * Used so the employee leaderboard can show and navigate monthly ranks.
 */
export async function getLatestMonthlyPeriod(): Promise<
  ActionResult<{ year: number; month: number; is_visible: boolean } | null>
> {
  return safeAction(async () => {
    const { data, error } = await supabaseAdmin
      .from('RankingPeriod')
      .select('period_start, is_visible')
      .eq('period_type', 'monthly')
      .order('period_start', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch latest monthly period: ${error.message}`);
    }

    if (!data?.period_start) {
      return null;
    }

    const startDate = new Date(data.period_start + 'T00:00:00');
    return {
      year: startDate.getFullYear(),
      month: startDate.getMonth() + 1,
      is_visible: data.is_visible,
    };
  });
}

/**
 * Returns the latest generated yearly period (year) from HR.
 * Uses admin client to bypass RLS so non-visible periods are included.
 * Used so the employee leaderboard can show and navigate yearly ranks.
 */
export async function getLatestYearlyPeriod(): Promise<
  ActionResult<{ year: number; is_visible: boolean } | null>
> {
  return safeAction(async () => {
    const { data, error } = await supabaseAdmin
      .from('RankingPeriod')
      .select('period_start, is_visible')
      .eq('period_type', 'yearly')
      .order('period_start', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch latest yearly period: ${error.message}`);
    }

    if (!data?.period_start) {
      return null;
    }

    const startDate = new Date(data.period_start + 'T00:00:00');
    return { year: startDate.getFullYear(), is_visible: data.is_visible };
  });
}

/**
 * Returns all previously generated ranking periods across all types, newest first,
 * with the top performer's name (rank 1) for each period.
 * Used by the HR "View Past Ranks" list.
 */
export async function getAllRankingPeriods(): Promise<ActionResult<import('@/types').RankingPeriodWithTop[]>> {
  return safeAction(async () => {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Not authenticated');
    }

    const [periodsRes, topRes, countRes] = await Promise.all([
      supabase
        .from('RankingPeriod')
        .select('id, period_type, period_start, period_end, is_visible, generated_at')
        .order('period_start', { ascending: false }),
      supabase
        .from('ranking_leaderboard_view')
        .select('ranking_period_id, user_name, rank')
        .eq('rank', 1),
      supabase
        .from('RankingEntry')
        .select('ranking_period_id'),
    ]);

    if (periodsRes.error) {
      throw new Error(`Failed to fetch ranking periods: ${periodsRes.error.message}`);
    }
    if (topRes.error) {
      throw new Error(`Failed to fetch top performers: ${topRes.error.message}`);
    }
    if (countRes.error) {
      throw new Error(`Failed to fetch participant counts: ${countRes.error.message}`);
    }

    const topByPeriod = new Map<string, string>();
    for (const row of topRes.data ?? []) {
      topByPeriod.set(row.ranking_period_id, row.user_name);
    }

    const countByPeriod = new Map<string, number>();
    for (const row of countRes.data ?? []) {
      countByPeriod.set(row.ranking_period_id, (countByPeriod.get(row.ranking_period_id) ?? 0) + 1);
    }

    return (periodsRes.data ?? []).map((p) => ({
      ...p,
      top_performer_name: topByPeriod.get(p.id) ?? null,
      participant_count: countByPeriod.get(p.id) ?? 0,
    })) as import('@/types').RankingPeriodWithTop[];
  });
}

/**
 * Returns the latest generated periods for all types (weekly, monthly, yearly).
 * Used by the employee leaderboard to show the latest month/year and to bound period navigation.
 */
export async function getLatestLeaderboardPeriods(): Promise<
  ActionResult<{
    weekly: { year: number; week: number } | null;
    monthly: { year: number; month: number } | null;
    yearly: { year: number } | null;
  }>
> {
  return safeAction(async () => {
    const [weeklyResult, monthlyResult, yearlyResult] = await Promise.all([
      getLatestWeeklyPeriod(),
      getLatestMonthlyPeriod(),
      getLatestYearlyPeriod(),
    ]);

    return {
      weekly: weeklyResult.success ? weeklyResult.data : null,
      monthly: monthlyResult.success ? monthlyResult.data : null,
      yearly: yearlyResult.success ? yearlyResult.data : null,
    };
  });
}

