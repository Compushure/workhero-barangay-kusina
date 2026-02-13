'use server';

import { createClient } from '@/lib/supabase/server';
import { safeAction, type ActionResult } from '@/lib/utils/safe-action';
import type { LeaderboardPlayer } from '@/types';

/**
 * Fetches the top 10 players ordered by points in descending order
 * Only includes regular employees (excludes admin, manager, hr, and superadmin roles)
 * Used by the leaderboard page to display rankings
 */
export async function getTopPlayers(): Promise<ActionResult<LeaderboardPlayer[]>> {
  return safeAction(async () => {
    const supabase = await createClient();

    // Fetch top 10 regular employees from user_attributes view ordered by points
    const { data, error } = await supabase
      .from('user_attributes')
      .select('user_id, user_name, points, role_type')
      .eq('role_type', 'regular')
      .order('points', { ascending: false })
      .limit(10);

    if (error) {
      throw new Error(`Failed to fetch leaderboard data: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Map data with profile picture URLs (synchronous generation)
    const players: LeaderboardPlayer[] = data.map((user) => {
      // Get the public URL synchronously without awaiting
      const { data: storageData } = supabase.storage
        .from('employees')
        .getPublicUrl(`${user.user_id}/profile.png`);

      return {
        id: user.user_id,
        name: user.user_name || 'Unknown User',
        performanceScore: user.points ?? 0, // Using points as performance score for employee view
        image: storageData?.publicUrl ?? null,
      };
    });

    return players;
  });
}
