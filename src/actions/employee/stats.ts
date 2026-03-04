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
import type { TimePeriod } from '@/lib/utils/time-period-utils';
import { getCutoffForPeriod } from '@/lib/utils/time-period-utils';

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

    return data.user_level ?? 0;
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
 * Fetches the current employee's rank among all regular employees
 * Supports period-based queries for historical rankings
 * 
 * @param period - Time period filter ('current' uses user_attributes, others use RPC with cutoff)
 * @returns ActionResult containing rank, performance score, and total employee count
 */
export async function getEmployeeRank(
  period: TimePeriod | 'current' = 'current'
): Promise<ActionResult<EmployeeRank>> {
  return safeAction(async () => {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    if (period === 'current') {
      // For current period, use user_attributes view
      const { data: allUsers, error: usersError } = await supabase
        .from('user_attributes')
        .select('user_id, performance_score')
        .eq('role_type', 'regular')
        .order('performance_score', { ascending: false });

      if (usersError) {
        throw new Error(`Failed to fetch user attributes: ${usersError.message}`);
      }

      if (!allUsers || allUsers.length === 0) {
        return {
          rank: 1,
          performanceScore: 0,
          totalEmployees: 1,
        };
      }

      // Find current user's rank
      const userIndex = allUsers.findIndex((u) => u.user_id === user.id);
      const rank = userIndex !== -1 ? userIndex + 1 : allUsers.length;
      const performanceScore = allUsers[userIndex]?.performance_score ?? 0;

      return {
        rank,
        performanceScore: Number(performanceScore),
        totalEmployees: allUsers.length,
      };
    } else {
      // For other periods, use RPC with cutoff timestamp
      const cutoff = getCutoffForPeriod(period);

      const { data, error } = await supabase.rpc('get_employee_rank_as_of', {
        p_user_id: user.id,
        p_cutoff: cutoff,
      });

      if (error) {
        throw new Error(`Failed to fetch employee rank: ${error.message}`);
      }

      if (!data || data.length === 0) {
        return {
          rank: 1,
          performanceScore: 0,
          totalEmployees: 1,
        };
      }

      const rankData = data[0];

      return {
        rank: Number(rankData.employee_rank ?? 1),
        performanceScore: Number(rankData.performance_score ?? 0),
        totalEmployees: Number(rankData.total_employees ?? 1),
      };
    }
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

    const currentXP = data.xp ?? 0;
    const level = data.user_level ?? 0;
    const totalXP = level * 100 + currentXP;

    return {
      currentXP,
      totalXP,
      level,
    };
  });
}
