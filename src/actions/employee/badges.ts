'use server';

import { createClient } from '@/lib/supabase/server';
import type { ServerActionResponse } from '@/types';

export interface UserBadge {
  badge_id: string;
  badge_name: string;
  userbadge_id: string;
  points?: number;
  badge_points?: number;
  img_link?: string | null;
  badge_img_link?: string | null;
  badge_description?: string | null;
  awarded_by_name: string | null;
  date_acquired: string;
}

function normalizeBadgeImageLink(badge: UserBadge): UserBadge {
  const imgLink = badge.img_link ?? badge.badge_img_link ?? null;
  const points = badge.points ?? badge.badge_points;
  if (imgLink === badge.img_link) {
    if (points === badge.points) {
      return badge;
    }
    return {
      ...badge,
      points,
    };
  }

  return {
    ...badge,
    img_link: imgLink,
    points,
  };
}

/**
 * Fetch all badges awarded to a user using the user_collected_badges_view
 * This view returns badges in a jsonb array format, already properly structured
 * @param userId - The ID of the user to fetch badges for
 * @returns Array of badges awarded to the user, or empty array if no badges earned
 */
export async function fetchUserBadges(userId: string): Promise<ServerActionResponse<UserBadge[]>> {
  if (!userId) {
    return { error: 'User ID is required' };
  }

  const supabase = await createClient();

  try {
    // Query the user_collected_badges_view which returns badges in a jsonb array
    const { data, error } = await supabase
      .from('user_collected_badges_view')
      .select('collected_badges')
      .eq('awarded_to_id', userId)
      .single();

    if (error) {
      // If user not found in view, return empty array (no badges earned yet)
      if ((error as any).code === 'PGRST116') {
        return { error: null, data: [] };
      }
      return { error: `Failed to fetch badges: ${error.message}` };
    }

    // Extract the jsonb array and return it
    const badges = (data?.collected_badges || []) as UserBadge[];
    let normalizedBadges = badges.map(normalizeBadgeImageLink);

    const missingImageIds = normalizedBadges
      .filter((badge) => !badge.img_link && badge.badge_id)
      .map((badge) => badge.badge_id);

    if (missingImageIds.length > 0) {
      const { data: badgeRows, error: badgeError } = await supabase
        .from('Badges')
        .select('id, img_link')
        .in('id', missingImageIds);

      if (!badgeError && badgeRows) {
        const badgeImageMap = new Map(
          badgeRows.map((row: any) => [row.id, row.img_link ?? null])
        );

        normalizedBadges = normalizedBadges.map((badge) => {
          if (badge.img_link) return badge;
          return {
            ...badge,
            img_link: badgeImageMap.get(badge.badge_id) ?? null,
          };
        });
      }
    }

    return { error: null, data: normalizedBadges };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error occurred';
    return { error: `Failed to fetch user badges: ${message}` };
  }
}
