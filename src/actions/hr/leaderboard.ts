'use server';

import { createClient } from '@/lib/supabase/server';
import { safeAction, type ActionResult } from '@/lib/utils/safe-action';
import { unstable_noStore as noStore } from 'next/cache';
import type {
  LeaderboardAsOfRow,
  RankLogPeriodType,
  RankingLeaderboardViewRow,
} from '@/types';

import {
  getCutoffForSpecificPeriod,
  getPeriodStartEnd,
} from '@/lib/utils/time-period-utils';
import { format, getISOWeek, getISOWeekYear } from 'date-fns';



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
 * Fetch ranking entries for a specific period.
 * - First checks `ranking_leaderboard_view` (fast path)
 * - If missing, computes via RPC `get_leaderboard_as_of`, persists, and returns rows immediately
 *
 * This avoids a "generate then re-fetch" pattern that can be affected by request memoization
 * inside a single Server Component render.
 */
export async function getOrGenerateRankingByPeriod(
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

    const { data: existingRows, error: existingError } = await supabase
      .from('ranking_leaderboard_view')
      .select('*')
      .eq('period_type', periodType)
      .eq('period_start', periodStart)
      .order('rank');

    if (existingError) {
      throw new Error(`Failed to fetch ranking: ${existingError.message}`);
    }

    if (existingRows && existingRows.length > 0) {
      return existingRows as RankingLeaderboardViewRow[];
    }

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
 * Used so the HR leaderboard page can show the latest week by default instead of "Select a Period".
 */
export async function getLatestWeeklyPeriod(): Promise<
  ActionResult<{ year: number; week: number } | null>
> {
  return safeAction(async () => {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('RankingPeriod')
      .select('period_start')
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
    };
  });
}
