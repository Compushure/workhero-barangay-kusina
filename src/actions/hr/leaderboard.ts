'use server';

import { createClient } from '@/lib/supabase/server';
import { safeAction, type ActionResult } from '@/lib/utils/safe-action';
import type { LeaderboardPlayer } from '@/types';
import type { UserBadge } from '@/actions/employee/badges';

type TimePeriod = 'weekly' | 'monthly' | 'yearly';

/**
 * Normalize badge image link by checking both img_link and badge_img_link fields
 */
function normalizeBadgeImageLink(badge: UserBadge): UserBadge {
  const imgLink = badge.img_link ?? badge.badge_img_link ?? null;
  const points = badge.points ?? badge.badge_points;
  
  return {
    ...badge,
    img_link: imgLink,
    points,
  };
}

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

    // Extract all user IDs for batch badge fetching
    const userIds = data.map((user) => user.user_id);

    // Fetch all badges for these users in a single query
    const { data: badgeData, error: badgeError } = await supabase
      .from('user_collected_badges_view')
      .select('awarded_to_id, collected_badges')
      .in('awarded_to_id', userIds);

    // Create a map of user_id -> badges for quick lookup
    const badgesByUserId = new Map<string, UserBadge[]>();
    if (!badgeError && badgeData) {
      // First, normalize all badges and collect them
      let allBadges: UserBadge[] = [];
      const tempBadgesByUserId = new Map<string, UserBadge[]>();
      
      for (const row of badgeData) {
        const badges = (row.collected_badges || []) as UserBadge[];
        const normalizedBadges = badges.map(normalizeBadgeImageLink);
        tempBadgesByUserId.set(row.awarded_to_id, normalizedBadges);
        allBadges = allBadges.concat(normalizedBadges);
      }

      // Find badges that still don't have images after normalization
      const missingImageIds = allBadges
        .filter((badge) => !badge.img_link && badge.badge_id)
        .map((badge) => badge.badge_id);

      // If there are badges with missing images, fetch them from Badges table
      if (missingImageIds.length > 0) {
        const { data: badgeRows, error: badgeImageError } = await supabase
          .from('Badges')
          .select('id, img_link')
          .in('id', missingImageIds);

        if (!badgeImageError && badgeRows) {
          const badgeImageMap = new Map(
            badgeRows.map((row: any) => [row.id, row.img_link ?? null])
          );

          // Update badges with fetched images
          for (const [userId, badges] of tempBadgesByUserId.entries()) {
            const updatedBadges = badges.map((badge) => {
              if (badge.img_link) return badge;
              return {
                ...badge,
                img_link: badgeImageMap.get(badge.badge_id) ?? null,
              };
            });
            
            // Sort by date_acquired descending (most recent first)
            const sortedBadges = updatedBadges.sort(
              (a, b) => new Date(b.date_acquired).getTime() - new Date(a.date_acquired).getTime()
            );
            badgesByUserId.set(userId, sortedBadges);
          }
        } else {
          // If badge image fetch failed, just use the normalized badges
          for (const [userId, badges] of tempBadgesByUserId.entries()) {
            const sortedBadges = badges.sort(
              (a, b) => new Date(b.date_acquired).getTime() - new Date(a.date_acquired).getTime()
            );
            badgesByUserId.set(userId, sortedBadges);
          }
        }
      } else {
        // No missing images, just sort and use normalized badges
        for (const [userId, badges] of tempBadgesByUserId.entries()) {
          const sortedBadges = badges.sort(
            (a, b) => new Date(b.date_acquired).getTime() - new Date(a.date_acquired).getTime()
          );
          badgesByUserId.set(userId, sortedBadges);
        }
      }
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
        badges: badgesByUserId.get(user.user_id) || [],
      };
    });

    return players;
  });
}
