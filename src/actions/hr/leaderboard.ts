'use server';

import { createClient } from '@/lib/supabase/server';
import { safeAction, type ActionResult } from '@/lib/utils/safe-action';
import type {
  LeaderboardAsOfRow,
  RankLogPeriodType,
  RankingPeriodRow,
  RankingLeaderboardViewRow,
} from '@/types';

import {
  getCutoffForSpecificPeriod,
  getPeriodStartEnd,
} from '@/lib/utils/time-period-utils';
import { format } from 'date-fns';



// ---------------------------------------------------------------------------
// Ranking Actions (normalized schema: RankingPeriod + RankingEntry)
// ---------------------------------------------------------------------------

const MIN_EMPLOYEES_FOR_RANKING = 1;

/** Format a Date as YYYY-MM-DD for Supabase date columns */
function toDateStr(d: Date): string {
  return format(d, 'yyyy-MM-dd');
}

/**
 * Generate-or-fetch a ranking for a specific period.
 * If the period already exists, returns the existing RankingPeriod row.
 * Otherwise computes the leaderboard, inserts RankingPeriod + RankingEntry rows, and returns.
 */
export async function generateRanking(
  periodType: RankLogPeriodType,
  year: number,
  month?: number,
  week?: number
): Promise<ActionResult<{ period: RankingPeriodRow; isNew: boolean } | null>> {
  return safeAction(async () => {
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

    // Check if ranking already exists for this period
    const { data: existing } = await supabase
      .from('RankingPeriod')
      .select('*')
      .eq('period_type', periodType)
      .eq('period_start', periodStart)
      .maybeSingle();

    if (existing) {
      return { period: existing as RankingPeriodRow, isNew: false };
    }

    // Compute cutoff and fetch leaderboard snapshot
    const cutoff = getCutoffForSpecificPeriod(
      periodType,
      year,
      periodType === 'weekly' ? undefined : month,
      week
    );

    const { data: leaderboardData, error: lbError } = await supabase.rpc(
      'get_leaderboard_as_of',
      { p_cutoff: cutoff }
    );

    if (lbError) {
      throw new Error(`Failed to compute leaderboard: ${lbError.message}`);
    }

    const rows = (leaderboardData ?? []) as LeaderboardAsOfRow[];

    // No employees with approved KPI tasks for this period — signal "no data" to the caller
    if (rows.length < MIN_EMPLOYEES_FOR_RANKING) {
      return null;
    }

    // Insert the period
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
        // Race condition: another request inserted first — fetch and return
        const { data: raceWinner } = await supabase
          .from('RankingPeriod')
          .select('*')
          .eq('period_type', periodType)
          .eq('period_start', periodStart)
          .single();
        return { period: raceWinner as RankingPeriodRow, isNew: false };
      }
      throw new Error(`Failed to save ranking period: ${periodError.message}`);
    }

    // Insert all entries
    const entries = rows.map((row, idx) => ({
      ranking_period_id: period.id,
      user_id: row.user_id,
      rank: idx + 1,
      performance_score: Number(row.performance_score ?? 0),
      total_kpi_points: Number(row.total_kpi_points ?? 0),
      badge_points: Number(row.badge_points ?? 0),
      completed_task_count: Number(row.task_count ?? 0),
    }));

    const { error: entriesError } = await supabase
      .from('RankingEntry')
      .insert(entries);

    if (entriesError) {
      throw new Error(`Failed to save ranking entries: ${entriesError.message}`);
    }

    return { period: period as RankingPeriodRow, isNew: true };
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
 * Fetch ranking entries for a specific period via the leaderboard view.
 * Returns all entries ordered by rank, or null if no ranking exists for that period.
 */
export async function getRankingByPeriod(
  periodType: RankLogPeriodType,
  year: number,
  month?: number,
  week?: number
): Promise<ActionResult<RankingLeaderboardViewRow[] | null>> {
  return safeAction(async () => {
    const supabase = await createClient();

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

    return data as RankingLeaderboardViewRow[];
  });
}

/**
 * Fetch all generated rankings, optionally filtered by period type.
 * Returns one row per period (the rank=1 entry) for efficient listing.
 */
export async function getGeneratedRankings(
  periodType?: RankLogPeriodType
): Promise<ActionResult<RankingLeaderboardViewRow[]>> {
  return safeAction(async () => {
    const supabase = await createClient();

    let query = supabase
      .from('ranking_leaderboard_view')
      .select('*')
      .eq('rank', 1)
      .order('period_start', { ascending: false });

    if (periodType) {
      query = query.eq('period_type', periodType);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch rankings: ${error.message}`);
    }

    return (data ?? []) as RankingLeaderboardViewRow[];
  });
}
