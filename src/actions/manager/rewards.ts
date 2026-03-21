'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { safeAction, type ActionResult } from '@/lib/utils/safe-action';
import { getUserRole } from '@/actions/shared/auth';
import type { EditPointsInput, EditXPInput, EditXPResult } from '@/types';

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

    // Fetch current points and total_points_earned so we can increment both
    const { data: userData, error: fetchUserError } = await supabaseAdmin
      .from('User')
      .select('points, total_points_earned')
      .eq('id', userId)
      .single();

    if (fetchUserError || !userData) {
      throw new Error('User not found');
    }

    const currentPoints = Number(userData.points ?? 0);
    const currentTotalEarned = Number(userData.total_points_earned ?? 0);

    const { error: updateError } = await supabaseAdmin
      .from('User')
      .update({
        points: currentPoints + pointsToAdd,
        total_points_earned: currentTotalEarned + pointsToAdd,
      })
      .eq('id', userId);

    if (updateError) {
      throw new Error(`Failed to update points: ${updateError.message}`);
    }

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

/**
 * Edit (add) XP for a specific user
 * Only accessible by managers
 * Level/XP are calculated manually from Level thresholds (no DB trigger dependency)
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

    const { data: userData, error: userFetchError } = await supabaseAdmin
      .from('User')
      .select('xp, level, total_xp')
      .eq('id', userId)
      .single();

    if (userFetchError || !userData) {
      throw new Error('User not found');
    }

    const { data: levelRows, error: levelRowsError } = await supabaseAdmin
      .from('Level')
      .select('level, xp')
      .order('level', { ascending: true });

    if (levelRowsError) {
      throw new Error(`Failed to fetch level thresholds: ${levelRowsError.message}`);
    }

    const levelThresholds = new Map<number, number>();
    for (const row of levelRows ?? []) {
      levelThresholds.set(row.level, row.xp ?? 100);
    }

    const getLevelThreshold = (level: number): number => {
      if (level <= 1) {
        return Math.max(0, levelThresholds.get(1) ?? 0);
      }

      return Math.max(0, levelThresholds.get(level) ?? level * 100);
    };

    const getRequiredXpForLevel = (level: number): number => {
      if (level <= 1) {
        return Math.max(1, getLevelThreshold(2));
      }

      return Math.max(1, getLevelThreshold(level));
    };

    let newLevel = Math.min(Math.max(userData.level ?? 1, 1), 10);
    let newXp = Math.max(0, userData.xp ?? 0) + xpToAdd;

    // Keep awarding XP at cap, but never level past 10.
    if (newLevel < 10) {
      while (newLevel < 10) {
        const requiredXp = getRequiredXpForLevel(newLevel);
        if (newXp < requiredXp) {
          break;
        }

        newXp -= requiredXp;
        newLevel += 1;
      }
    }

    const computeTotalXP = (level: number, xp: number): number => {
      let sum = 0;
      for (let lvl = 1; lvl < level; lvl += 1) {
        sum += getRequiredXpForLevel(lvl);
      }
      return sum + Math.max(0, xp);
    };

    const fallbackTotalXp = computeTotalXP(Math.min(Math.max(userData.level ?? 1, 1), 10), Math.max(0, userData.xp ?? 0));
    const totalXpAfterUpdate = Math.max(0, (userData.total_xp ?? fallbackTotalXp) + xpToAdd);

    const { error: updateError } = await supabaseAdmin
      .from('User')
      .update({
        xp: newXp,
        level: newLevel,
        total_xp: totalXpAfterUpdate,
      })
      .eq('id', userId);

    if (updateError) {
      throw new Error(`Failed to update XP: ${updateError.message}`);
    }

    return {
      newXP: newXp,
      newLevel,
    };
  });
}
