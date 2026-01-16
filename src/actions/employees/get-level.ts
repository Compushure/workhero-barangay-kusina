'use server';

import { createClient } from '@/lib/supabase/server';
import { safeAction, type ActionResult } from '@/lib/utils/safe-action';

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
