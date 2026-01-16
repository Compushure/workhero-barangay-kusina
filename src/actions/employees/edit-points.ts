'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { safeAction, type ActionResult } from '@/lib/utils/safe-action';
import { getUserRole } from '@/actions/auth';

export type EditPointsInput = {
  userId: string;
  pointsToAdd: number;
};

/**
 * Edit (add) points for a specific user
 * Only accessible by managers
 * @param userId - The user ID to update points for
 * @param pointsToAdd - Number of points to add (must be non-negative)
 * @returns Updated points value
 */
export async function editUserPoints({
  userId,
  pointsToAdd,
}: EditPointsInput): Promise<ActionResult<number>> {
  return safeAction(async () => {
    // Verify manager role
    const { role, error: roleError } = await getUserRole();
    if (roleError || !role) {
      throw new Error('Authentication required');
    }

    const normalizedRole = role.trim().toLowerCase();
    if (normalizedRole !== 'manager') {
      throw new Error('Unauthorized: Only managers can edit user points');
    }

    // Validate input
    if (pointsToAdd < 0) {
      throw new Error('Points to add must be non-negative');
    }

    if (!userId || userId.trim() === '') {
      throw new Error('User ID is required');
    }

    // Use admin client for manager operations
    // Update User table - database trigger handles increment
    const { error: updateError } = await supabaseAdmin
      .from('User')
      .update({ points: pointsToAdd })
      .eq('id', userId);

    if (updateError) {
      throw new Error(`Failed to update points: ${updateError.message}`);
    }

    // Query user_attributes view to get final points value
    const { data, error: fetchError } = await supabaseAdmin
      .from('user_attributes')
      .select('points')
      .eq('user_id', userId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch updated user data: ${fetchError.message}`);
    }

    if (!data) {
      throw new Error('User not found after update');
    }

    return data.points;
  });
}
