'use server';

import { createClient } from '@/lib/supabase/server';
import { safeAction, type ActionResult } from '@/lib/utils/safe-action';
import type { EmployeePointsData } from '@/types';

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
