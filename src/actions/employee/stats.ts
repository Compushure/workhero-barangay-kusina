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
import { safeAction, type ActionResult } from '@/lib/utils/safe-action';
import type { EmployeeRank, EmployeeXP } from '@/types';

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

    const { data, error } = await supabase
      .from('user_attributes')
      .select('points, deducted_points')
      .eq('user_id', user.id)
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
 * Uses the get_employee_rank RPC function which calculates rank using window functions
 * 
 * @returns ActionResult containing rank and total employee count
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

    // Call the RPC function to get rank
    const { data, error } = await supabase.rpc('get_employee_rank', {
      p_user_id: user.id,
    });

    if (error) {
      throw new Error(`Failed to fetch employee rank: ${error.message}`);
    }

    // The RPC returns an array with a single row
    if (!data || data.length === 0) {
      throw new Error('Employee rank data not found');
    }

    const rankData = data[0];
    // RPC returns employee_rank and total_employees
    const rank = rankData.employee_rank ?? rankData.rank;
    const totalEmployees = rankData.total_employees;

    return {
      rank: Number(rank),
      totalEmployees: Number(totalEmployees),
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
