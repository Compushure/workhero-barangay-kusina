'use server';

import { createClient } from '@/lib/supabase/server';
import { safeAction, type ActionResult } from '@/lib/utils/safe-action';
import type { LeaderboardPlayer } from '@/types';

type TimePeriod = 'weekly' | 'monthly' | 'yearly';

/**
 * Compute cutoff timestamp for a given time period.
 * Returns the end of the previous completed period.
 * - weekly: end of last week (Sunday 23:59:59)
 * - monthly: end of last month
 * - yearly: end of last year
 */
function getCutoffForPeriod(period: TimePeriod): string {
  const now = new Date();
  let cutoff: Date;

  switch (period) {
    case 'weekly': {
      // Get start of current week (Monday), then subtract 1 second to get end of previous week
      const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Days since last Monday
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - daysToMonday);
      startOfWeek.setHours(0, 0, 0, 0);
      cutoff = new Date(startOfWeek.getTime() - 1000); // Subtract 1 second to get end of previous week
      break;
    }
    case 'monthly': {
      // Get first day of current month, then subtract 1 second to get end of previous month
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      cutoff = new Date(firstDayOfMonth.getTime() - 1000);
      break;
    }
    case 'yearly': {
      // Get first day of current year, then subtract 1 second to get end of previous year
      const firstDayOfYear = new Date(now.getFullYear(), 0, 1);
      cutoff = new Date(firstDayOfYear.getTime() - 1000);
      break;
    }
  }

  return cutoff.toISOString();
}

/**
 * Fetches the top 10 players ordered by performance_score.
 * Performance score = (count of approved KPITask) × (sum of KPICategory.points for those tasks).
 * Only includes regular employees (excludes admin, manager, hr, and superadmin roles).
 * 
 * @param timePeriod - Optional time period filter ('weekly', 'monthly', 'yearly')
 *                     When provided, returns cumulative scores as of end of that period.
 *                     When omitted or 'current', returns current all-time cumulative scores.
 */
export async function getTopPlayers(
  timePeriod?: TimePeriod | 'current'
): Promise<ActionResult<LeaderboardPlayer[]>> {
  return safeAction(async () => {
    const supabase = await createClient();

    let data: any[] | null;
    let error: any;

    if (timePeriod && timePeriod !== 'current') {
      // Use RPC function for period-based snapshot
      const cutoff = getCutoffForPeriod(timePeriod);
      const result = await supabase.rpc('get_leaderboard_as_of', { p_cutoff: cutoff });
      data = result.data;
      error = result.error;
    } else {
      // Use current view for all-time cumulative (default or 'current')
      const result = await supabase
        .from('user_attributes')
        .select('user_id, user_name, performance_score, role_type')
        .eq('role_type', 'regular')
        .order('performance_score', { ascending: false })
        .limit(10);
      data = result.data;
      error = result.error;
    }

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
