/**
 * Employee Statistics Actions
 * 
 * This file contains all employee stat getter functions:
 * - getEmployeeLevel: Fetches the current employee's level
 * - getEmployeePoints: Fetches points and deducted points
 * - getEmployeePerformanceScore: Fetches performance_score (approved task count × total_points_earned)
 * - getEmployeeRank: Fetches rank among all employees
 * - getEmployeeXP: Fetches current and total XP
 */

'use server';

import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { safeAction, type ActionResult } from '@/lib/utils/safe-action';
import type { EmployeeRank, EmployeeXP } from '@/types';
// import type { TimePeriod } from '@/lib/utils/time-period-utils';
// import { getCutoffForPeriod } from '@/lib/utils/time-period-utils';

export interface EmployeePointsData {
  points: number;
  deductedPoints: number;
}

export async function getEmployeeLevel(): Promise<ActionResult<number>> {
  return safeAction(async () => {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('user_attributes')
      .select('user_level')
      .eq('user_id', user.id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch user level: ${error.message}`);
    }

    if (!data) {
      throw new Error('User level data not found');
    }

    return data.user_level ?? 1;
  });
}

export async function getEmployeePoints(): Promise<ActionResult<EmployeePointsData>> {
  return safeAction(async () => {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabaseAdmin
      .from('User')
      .select('points, deducted_points')
      .eq('id', user.id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch user points: ${error.message}`);
    }

    if (!data) {
      throw new Error('User points data not found');
    }

    return {
      points: data.points ?? 0,
      deductedPoints: data.deducted_points ?? 0,
    };
  });
}

/**
 * Fetches the current employee's performance score from user_attributes.
 * performance_score = (count of approved KPITask) × total_points_earned (used for leaderboard ranking).
 */
export async function getEmployeePerformanceScore(): Promise<ActionResult<number>> {
  return safeAction(async () => {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('user_attributes')
      .select('performance_score')
      .eq('user_id', user.id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch performance score: ${error.message}`);
    }

    if (!data) {
      return 0;
    }

    return Number(data.performance_score ?? 0);
  });
}

/**
 * Fetches the latest weekly rank snapshot for the current employee.
 * Ranking is generated automatically weekly and stored in RankingPeriod + RankingEntry.
 * Only shows rankings where is_visible = true in RankingPeriod.
 */
export async function getEmployeeRank(): Promise<ActionResult<EmployeeRank>> {
  return safeAction(async () => {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    // Step 1: Find the latest visible weekly ranking period
    const { data: latestPeriod, error: periodError } = await supabase
      .from('RankingPeriod')
      .select('id')
      .eq('period_type', 'weekly')
      .eq('is_visible', true)
      .order('period_start', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (periodError) {
      throw new Error(`Failed to fetch ranking period: ${periodError.message}`);
    }

    // No visible weekly ranking exists yet
    if (!latestPeriod) {
      return {
        rank: 1,
        performanceScore: 0,
        totalEmployees: 1,
      };
    }

    // Step 2: Fetch all entries for this period to get total employee count
    const { data: allEntries, error: allEntriesError } = await supabase
      .from('RankingEntry')
      .select('user_id, rank, performance_score')
      .eq('ranking_period_id', latestPeriod.id);

    if (allEntriesError) {
      throw new Error(`Failed to fetch ranking entries: ${allEntriesError.message}`);
    }

    if (!allEntries || allEntries.length === 0) {
      return {
        rank: 1,
        performanceScore: 0,
        totalEmployees: 1,
      };
    }

    // Step 3: Find the current user's entry
    const userEntry = allEntries.find((entry) => entry.user_id === user.id);

    return {
      rank: userEntry?.rank ?? allEntries.length + 1,
      performanceScore: Number(userEntry?.performance_score ?? 0),
      totalEmployees: allEntries.length,
    };
  });
}

export async function getEmployeeXP(): Promise<ActionResult<EmployeeXP>> {
  return safeAction(async () => {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('user_attributes')
      .select('xp, user_level')
      .eq('user_id', user.id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch user XP: ${error.message}`);
    }

    if (!data) {
      throw new Error('User XP data not found');
    }

    // Default level to 1 if null or 0
    const level = data.user_level && data.user_level > 0 ? data.user_level : 1;
    const currentXP = data.xp ?? 0;

    // totalXP counts cumulative XP including previous levels
    const totalXP = (level - 1) * 100 + currentXP;

    return {
      currentXP,
      totalXP,
      level,
    };
  });
}