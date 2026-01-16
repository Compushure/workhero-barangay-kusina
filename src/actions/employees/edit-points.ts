'use server';

import { createClient } from '@/lib/supabase/server';
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

    const supabase = await createClient();

    // Get current points
    const { data: currentData, error: fetchError } = await supabase
      .from('User')
      .select('points')
      .eq('id', userId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch user: ${fetchError.message}`);
    }

    if (!currentData) {
      throw new Error('User not found');
    }

    const currentPoints = currentData.points ?? 0;
    const newPoints = currentPoints + pointsToAdd;

    // Update points
    const { data, error: updateError } = await supabase
      .from('User')
      .update({ points: newPoints })
      .eq('id', userId)
      .select('points')
      .single();

    if (updateError) {
      throw new Error(`Failed to update points: ${updateError.message}`);
    }

    return data.points;
  });
}
