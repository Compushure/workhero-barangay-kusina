'use server';

import { createClient } from '@/lib/supabase/server';
import { safeAction, type ActionResult } from '@/lib/utils/safe-action';
import type { EmployeeRank } from '@/types';

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

    return {
      rank: Number(rankData.rank),
      totalEmployees: Number(rankData.total_employees),
    };
  });
}
