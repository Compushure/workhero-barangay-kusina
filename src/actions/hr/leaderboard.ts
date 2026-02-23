'use server';

import { createClient } from '@/lib/supabase/server';
import type { SupabaseClient, PostgrestError } from '@supabase/supabase-js';
import { safeAction, type ActionResult } from '@/lib/utils/safe-action';
import type {
  LeaderboardPlayer,
  UserAttributesRow,
  UserCollectedBadgesRow,
  LeaderboardAsOfRow,
} from '@/types';
import type { UserBadge } from '@/actions/employee/badges';
import {
  normalizeBadgeImageLink,
  enrichBadgesWithImages,
  sortAndLimitBadges,
} from '@/lib/utils/badge-utils';
import { getCutoffForPeriod, type TimePeriod } from '@/lib/utils/time-period-utils';

/**
 * Helper Functions
 */

/**
 * Fetch and enrich badges for multiple users
 * @param userIds - Array of user IDs to fetch badges for
 * @param supabase - Supabase client instance
 * @param limit - Maximum number of badges to return per user (default: 3)
 * @returns Map of user ID to their badges
 */
async function fetchAndEnrichBadgesForUsers(
  userIds: string[],
  supabase: SupabaseClient,
  limit: number = 3
): Promise<Map<string, UserBadge[]>> {
  const badgesByUserId = new Map<string, UserBadge[]>();

  // Fetch all badges for these users in a single query
  const { data: badgeData, error: badgeError } = await supabase
    .from('user_collected_badges_view')
    .select('awarded_to_id, collected_badges')
    .in('awarded_to_id', userIds);

  if (badgeError || !badgeData) {
    return badgesByUserId;
  }

  // Process badges for each user
  const badgeRows = badgeData as UserCollectedBadgesRow[];
  for (const row of badgeRows) {
    const badges = (row.collected_badges || []) as UserBadge[];
    
    // Normalize all badges
    let normalizedBadges = badges.map(normalizeBadgeImageLink);
    
    // Enrich with missing images
    normalizedBadges = await enrichBadgesWithImages(normalizedBadges, supabase);
    
    // Sort by date and limit
    const sortedBadges = sortAndLimitBadges(normalizedBadges, limit);
    
    badgesByUserId.set(row.awarded_to_id, sortedBadges);
  }

  return badgesByUserId;
}

/**
 * Get player profile image URL from storage
 * @param userId - User ID to get profile image for
 * @param supabase - Supabase client instance
 * @returns Public URL for the profile image, or null if not found
 */
function getPlayerProfileImageUrl(userId: string, supabase: SupabaseClient): string | null {
  const { data: storageData } = supabase.storage
    .from('employees')
    .getPublicUrl(`${userId}/profile.png`);

  return storageData?.publicUrl ?? null;
}

/**
 * Map database rows to LeaderboardPlayer objects
 * @param data - Array of user attribute rows from database
 * @param badgesByUserId - Map of user ID to their badges
 * @param supabase - Supabase client instance
 * @returns Array of LeaderboardPlayer objects
 */
function mapToLeaderboardPlayers(
  data: UserAttributesRow[] | LeaderboardAsOfRow[],
  badgesByUserId: Map<string, UserBadge[]>,
  supabase: SupabaseClient
): LeaderboardPlayer[] {
  return data.map((user) => ({
    id: user.user_id,
    name: user.user_name || 'Unknown User',
    performanceScore: Number(user.performance_score ?? 0),
    image: getPlayerProfileImageUrl(user.user_id, supabase),
    badges: badgesByUserId.get(user.user_id) || [],
  }));
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

    // Fetch leaderboard data based on time period
    let data: UserAttributesRow[] | LeaderboardAsOfRow[] | null;
    let error: PostgrestError | null;

    if (timePeriod && timePeriod !== 'current') {
      // Use RPC function for period-based snapshot
      const cutoff = getCutoffForPeriod(timePeriod);
      const result = await supabase.rpc('get_leaderboard_as_of', { p_cutoff: cutoff });
      data = result.data as LeaderboardAsOfRow[] | null;
      error = result.error;
    } else {
      // Use current view for all-time cumulative (default or 'current')
      const result = await supabase
        .from('user_attributes')
        .select('user_id, user_name, performance_score, role_type')
        .eq('role_type', 'regular')
        .order('performance_score', { ascending: false })
        .limit(10);
      data = result.data as UserAttributesRow[] | null;
      error = result.error;
    }

    if (error) {
      throw new Error(`Failed to fetch leaderboard data: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Fetch and enrich badges for all users
    const userIds = data.map((user) => user.user_id);
    const badgesByUserId = await fetchAndEnrichBadgesForUsers(userIds, supabase);

    // Map database rows to LeaderboardPlayer objects
    const players = mapToLeaderboardPlayers(data, badgesByUserId, supabase);

    return players;
  });
}
