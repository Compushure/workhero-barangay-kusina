'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { safeAction, type ActionResult } from '@/lib/utils/safe-action';
import { getUserRole } from '@/actions/auth';

export type EditXPInput = {
  userId: string;
  xpToAdd: number;
};

export type EditXPResult = {
  newXP: number;
  newLevel: number;
};

/**
 * Edit (add) XP for a specific user
 * Only accessible by managers
 * Level is automatically calculated by the database (every 100 XP = 1 level)
 * @param userId - The user ID to update XP for
 * @param xpToAdd - Number of XP to add (must be non-negative)
 * @returns Updated XP and level values
 */
export async function editUserXP({
  userId,
  xpToAdd,
}: EditXPInput): Promise<ActionResult<EditXPResult>> {
  return safeAction(async () => {
    // Verify manager role
    const { role, error: roleError } = await getUserRole();
    if (roleError || !role) {
      throw new Error('Authentication required');
    }

    const normalizedRole = role.trim().toLowerCase();
    if (normalizedRole !== 'manager') {
      throw new Error('Unauthorized: Only managers can edit user XP');
    }

    // Validate input
    if (xpToAdd < 0) {
      throw new Error('XP to add must be non-negative');
    }

    if (!userId || userId.trim() === '') {
      throw new Error('User ID is required');
    }

    // Use admin client for manager operations
    // Update User table - database trigger handles increment and level calculation
    const { error: updateError } = await supabaseAdmin
      .from('User')
      .update({
        xp: xpToAdd,
      })
      .eq('id', userId);

    if (updateError) {
      throw new Error(`Failed to update XP: ${updateError.message}`);
    }

    // Query user_attributes view to get final values
    const { data, error: fetchError } = await supabaseAdmin
      .from('user_attributes')
      .select('xp, user_level')
      .eq('user_id', userId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch updated user data: ${fetchError.message}`);
    }

    if (!data) {
      throw new Error('User not found after update');
    }

    return {
      newXP: data.xp,
      newLevel: data.user_level,
    };
  });
}
