'use server';

import { createClient } from '@/lib/supabase/server';
import { safeAction, type ActionResult } from '@/lib/utils/safe-action';
import type { EmployeeXP } from '@/types';

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
    };
  });
}
