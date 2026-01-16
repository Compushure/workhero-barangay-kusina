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
  leveledUp: boolean;
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
    // Get current XP and level before update
    const { data: currentData, error: fetchError } = await supabaseAdmin
      .from('User')
      .select('xp, level')
      .eq('id', userId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch user: ${fetchError.message}`);
    }

    if (!currentData) {
      throw new Error('User not found');
    }

    const currentLevel = currentData.level ?? 1;
    const currentXP = currentData.xp ?? 0;

    // Add XP to current XP
    // The database trigger will automatically calculate the new level
    const { data, error: updateError } = await supabaseAdmin
      .from('User')
      .update({
        xp: currentXP + xpToAdd,
      })
      .eq('id', userId)
      .select('xp, level')
      .single();

    if (updateError) {
      throw new Error(`Failed to update XP: ${updateError.message}`);
    }

    return {
      newXP: data.xp,
      newLevel: data.level,
      leveledUp: data.level > currentLevel,
    };
  });
}
