'use server';

import { createClient } from '@/lib/supabase/server';
import { safeAction, type ActionResult } from '@/lib/utils/safe-action';
import type { LeaderboardPlayer } from '@/types';

/**
 * Fetches the top 10 players ordered by performance_score in descending order.
 * Performance score = (count of approved KPITask) × (sum of KPICategory.points for those tasks).
 * Only includes regular employees (excludes admin, manager, hr, and superadmin roles).
 */
export async function getTopPlayers(): Promise<ActionResult<LeaderboardPlayer[]>> {
  return safeAction(async () => {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('user_attributes')
      .select('user_id, user_name, performance_score, role_type')
      .eq('role_type', 'regular')
      .order('performance_score', { ascending: false })
      .limit(10);

    if (error) {
      throw new Error(`Failed to fetch leaderboard data: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return [];
    }

    const players: LeaderboardPlayer[] = data.map((user) => {
      const { data: storageData } = supabase.storage
        .from('employees')
        .getPublicUrl(`${user.user_id}/profile.png`);

      return {
        id: user.user_id,
        name: user.user_name || 'Unknown User',
        performanceScore: Number(user.performance_score ?? 0),
        image: storageData?.publicUrl ?? null,
      };
    });

    return players;
  });
}
