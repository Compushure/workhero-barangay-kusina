/**
 * Badge Utilities
 * Shared utilities for badge normalization, enrichment, and sorting
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { UserBadge } from '@/actions/employee/badges';

/**
 * Badge table row type (minimal fields needed)
 */
interface BadgeRow {
  id: string;
  img_link: string | null;
}

/**
 * Normalize badge image link by checking both img_link and badge_img_link fields
 * Also normalizes points field (points vs badge_points)
 */
export function normalizeBadgeImageLink(badge: UserBadge): UserBadge {
  const imgLink = badge.img_link ?? badge.badge_img_link ?? null;
  const points = badge.points ?? badge.badge_points;

  // Optimize: return original if no changes needed
  if (imgLink === badge.img_link && points === badge.points) {
    return badge;
  }

  return {
    ...badge,
    img_link: imgLink,
    points,
  };
}

/**
 * Enrich badges with missing images from the Badges table
 * @param badges - Array of badges to enrich
 * @param supabase - Supabase client instance
 * @returns Array of badges with enriched image links
 */
export async function enrichBadgesWithImages(
  badges: UserBadge[],
  supabase: SupabaseClient
): Promise<UserBadge[]> {
  // Find badges that still don't have images
  const missingImageIds = badges
    .filter((badge) => !badge.img_link && badge.badge_id)
    .map((badge) => badge.badge_id);

  if (missingImageIds.length === 0) {
    return badges;
  }

  // Fetch missing images from Badges table
  const { data: badgeRows, error: badgeImageError } = await supabase
    .from('Badges')
    .select('id, img_link')
    .in('id', missingImageIds);

  if (badgeImageError || !badgeRows) {
    // If fetch failed, return badges as-is
    return badges;
  }

  // Create a map for quick lookup
  const badgeImageMap = new Map(
    badgeRows.map((row: BadgeRow) => [row.id, row.img_link ?? null])
  );

  // Update badges with fetched images
  return badges.map((badge) => {
    if (badge.img_link) return badge;
    return {
      ...badge,
      img_link: badgeImageMap.get(badge.badge_id) ?? null,
    };
  });
}

/**
 * Sort badges by date_acquired (descending) and limit to a specific count
 * @param badges - Array of badges to sort and limit
 * @param limit - Maximum number of badges to return (default: 3)
 * @returns Sorted and limited array of badges
 */
export function sortAndLimitBadges(badges: UserBadge[], limit: number = 3): UserBadge[] {
  return badges
    .sort((a, b) => new Date(b.date_acquired).getTime() - new Date(a.date_acquired).getTime())
    .slice(0, limit);
}
