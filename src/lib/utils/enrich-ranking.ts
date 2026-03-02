import type { SupabaseClient } from '@supabase/supabase-js';
import type { RankLogRow, LeaderboardPlayer } from '@/types';
import type { UserBadge } from '@/actions/employee/badges';
import {
  normalizeBadgeImageLink,
  enrichBadgesWithImages,
  sortAndLimitBadges,
} from '@/lib/utils/badge-utils';

/**
 * Enrich stored RankLog entries with live profile images and badges.
 * Used by the HR leaderboard page.
 */
export async function enrichRankingPlayers(
  ranking: RankLogRow,
  supabase: SupabaseClient
): Promise<(LeaderboardPlayer & { rank: number })[]> {
  const userIds = ranking.rankings.map((r) => r.user_id);

  const { data: badgeData } = await supabase
    .from('user_collected_badges_view')
    .select('awarded_to_id, collected_badges')
    .in('awarded_to_id', userIds);

  const badgesByUserId = new Map<string, UserBadge[]>();
  if (badgeData) {
    for (const row of badgeData as { awarded_to_id: string; collected_badges: UserBadge[] | null }[]) {
      const badges = (row.collected_badges || []) as UserBadge[];
      let normalized = badges.map(normalizeBadgeImageLink);
      normalized = await enrichBadgesWithImages(normalized, supabase);
      badgesByUserId.set(row.awarded_to_id, sortAndLimitBadges(normalized, 3));
    }
  }

  return ranking.rankings.map((entry) => {
    const { data: storageData } = supabase.storage
      .from('employees')
      .getPublicUrl(`${entry.user_id}/profile.png`);

    return {
      id: entry.user_id,
      name: entry.user_name,
      performanceScore: entry.performance_score,
      image: storageData?.publicUrl ?? null,
      badges: badgesByUserId.get(entry.user_id) || [],
      rank: entry.rank,
    };
  });
}
