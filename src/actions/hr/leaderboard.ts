'use server';

import { createClient } from '@/lib/supabase/server';
import { safeAction, type ActionResult } from '@/lib/utils/safe-action';
import type {

  LeaderboardAsOfRow,
  RankLogRow,
  RankLogPeriodType,
  RankLogEntry,
} from '@/types';

import {
  getCutoffForSpecificPeriod,
  buildPeriodLabel,
} from '@/lib/utils/time-period-utils';



// ---------------------------------------------------------------------------
// RankLog Actions
// ---------------------------------------------------------------------------

const MIN_EMPLOYEES_FOR_RANKING = 1;

/**
 * Generate a ranking for a specific period and persist it in the RankLog table.
 * Requires at least one employee with scores in that period. Rankings show Top N (up to 10).
 */
export async function generateRanking(
  periodType: RankLogPeriodType,
  year: number,
  month?: number,
  week?: number
): Promise<ActionResult<RankLogRow>> {
  return safeAction(async () => {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Not authenticated');
    }

    // Compute cutoff and fetch leaderboard snapshot (no LIMIT — we need to count all)
    // For weekly (ISO week), month is ignored; pass undefined so period_month is stored as null
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

    if (rows.length < MIN_EMPLOYEES_FOR_RANKING) {
      throw new Error(
        `Cannot generate ranking: only ${rows.length} employee(s) found. At least ${MIN_EMPLOYEES_FOR_RANKING} are required.`
      );
    }

    // Build the full rankings JSONB payload (all employees ranked)
    const rankings: RankLogEntry[] = rows.map((row, idx) => ({
      rank: idx + 1,
      user_id: row.user_id,
      user_name: row.user_name || 'Unknown User',
      performance_score: Number(row.performance_score ?? 0),
    }));

    const periodLabel = buildPeriodLabel(
      periodType,
      year,
      periodType === 'weekly' ? undefined : month,
      week
    );

    const { data: inserted, error: insertError } = await supabase
      .from('RankLog')
      .insert({
        period_type: periodType,
        period_year: year,
        period_month: periodType === 'weekly' ? null : (month ?? null),
        period_week: week ?? null,
        period_label: periodLabel,
        rankings,
        is_visible: true,
        generated_by: user.id,
      })
      .select()
      .single();

    if (insertError) {
      if (insertError.code === '23505') {
        throw new Error(`A ranking for "${periodLabel}" already exists.`);
      }
      throw new Error(`Failed to save ranking: ${insertError.message}`);
    }

    return inserted as RankLogRow;
  });
}

/**
 * Toggle visibility of a generated ranking.
 */
export async function toggleRankingVisibility(
  rankLogId: string,
  isVisible: boolean
): Promise<ActionResult<{ id: string; is_visible: boolean }>> {
  return safeAction(async () => {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('RankLog')
      .update({ is_visible: isVisible })
      .eq('id', rankLogId)
      .select('id, is_visible')
      .single();

    if (error) {
      throw new Error(`Failed to update visibility: ${error.message}`);
    }

    return data as { id: string; is_visible: boolean };
  });
}

/**
 * Fetch a single stored ranking matching the exact period (type + year + month/week).
 * Returns null if no ranking exists for that period.
 */
export async function getRankingByPeriod(
  periodType: RankLogPeriodType,
  year: number,
  month?: number,
  week?: number
): Promise<ActionResult<RankLogRow | null>> {
  return safeAction(async () => {
    const supabase = await createClient();

    let query = supabase
      .from('RankLog')
      .select('*')
      .eq('period_type', periodType)
      .eq('period_year', year);

    if (periodType === 'monthly' && month != null) {
      query = query.eq('period_month', month);
    } else if (periodType === 'weekly' && week != null) {
      query = query.eq('period_week', week);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch ranking: ${error.message}`);
    }

    return (data ?? null) as RankLogRow | null;
  });
}

/**
 * Fetch all generated rankings, optionally filtered by period type.
 * HR sees all; employees only see visible ones (handled by RLS).
 */
export async function getGeneratedRankings(
  periodType?: RankLogPeriodType
): Promise<ActionResult<RankLogRow[]>> {
  return safeAction(async () => {
    const supabase = await createClient();

    let query = supabase
      .from('RankLog')
      .select('*')
      .order('period_year', { ascending: false })
      .order('period_month', { ascending: false, nullsFirst: false })
      .order('period_week', { ascending: false, nullsFirst: false });

    if (periodType) {
      query = query.eq('period_type', periodType);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch rankings: ${error.message}`);
    }

    return (data ?? []) as RankLogRow[];
  });
}
