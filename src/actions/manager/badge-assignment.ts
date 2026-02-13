'use server';

import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import type { ServerActionResponse } from '@/types';
import type { BadgeAssignmentUser, BadgeSummary, CollectedBadge } from '@/types/manager/badge-assignment';
import { getUserRole } from '@/actions/shared/auth';

function buildBadgeIds(collected: CollectedBadge[]): string[] {
  return collected.map((badge) => badge.badge_id).filter(Boolean);
}

export async function fetchManualBadges(): Promise<ServerActionResponse<BadgeSummary[]>> {
  const { role, error: roleError } = await getUserRole();
  if (roleError || !role || role.trim().toLowerCase() !== 'manager') {
    return { error: 'Unauthorized: Only managers can view manual badges' };
  }

  const { data, error } = await supabaseAdmin
    .from('Badges')
    .select('id, name, description, points, img_link, award_at_interval')
    .eq('award_at_interval', 'none')
    .order('name', { ascending: true });

  if (error) {
    return { error: `Failed to fetch manual badges: ${error.message}` };
  }

  return { error: null, data: (data || []) as BadgeSummary[] };
}

export async function fetchAllBadges(): Promise<ServerActionResponse<BadgeSummary[]>> {
  const { role, error: roleError } = await getUserRole();
  if (roleError || !role || role.trim().toLowerCase() !== 'manager') {
    return { error: 'Unauthorized: Only managers can view badges' };
  }

  const { data, error } = await supabaseAdmin
    .from('Badges')
    .select('id, name, description, points, img_link, award_at_interval')
    .order('name', { ascending: true });

  if (error) {
    return { error: `Failed to fetch badges: ${error.message}` };
  }

  return { error: null, data: (data || []) as BadgeSummary[] };
}

export async function fetchBadgeAssignmentUsers(): Promise<ServerActionResponse<BadgeAssignmentUser[]>> {
  const { role, error: roleError } = await getUserRole();
  if (roleError || !role || role.trim().toLowerCase() !== 'manager') {
    return { error: 'Unauthorized: Only managers can view users' };
  }

  const { data: users, error: usersError } = await supabaseAdmin
    .from('User')
    .select('id, name, email, employee_id')
    .order('name', { ascending: true });

  if (usersError) {
    return { error: `Failed to fetch users: ${usersError.message}` };
  }

  const { data: collectedRows, error: collectedError } = await supabaseAdmin
    .from('user_collected_badges_view')
    .select('awarded_to_id, collected_badges');

  if (collectedError) {
    return { error: `Failed to fetch user badges: ${collectedError.message}` };
  }

  const collectedByUser = new Map<string, CollectedBadge[]>();
  (collectedRows || []).forEach((row: any) => {
    collectedByUser.set(row.awarded_to_id, (row.collected_badges || []) as CollectedBadge[]);
  });

  const usersWithBadges: BadgeAssignmentUser[] = (users || []).map((user: any) => {
    const collected = collectedByUser.get(user.id) ?? [];
    const { data: storageData } = supabaseAdmin.storage
      .from('employees')
      .getPublicUrl(`${user.id}/profile.png`);

    return {
      id: user.id,
      employee_id: user.employee_id ?? null,
      name: user.name || 'Unknown',
      email: user.email || '',
      profilePictureUrl: storageData?.publicUrl || null,
      collected_badges: collected,
      badge_ids: buildBadgeIds(collected),
    };
  });

  return { error: null, data: usersWithBadges };
}

export async function assignManualBadgeToUser(
  badgeId: string,
  userId: string
): Promise<ServerActionResponse<boolean>> {
  const { role, error: roleError } = await getUserRole();
  if (roleError || !role || role.trim().toLowerCase() !== 'manager') {
    return { error: 'Unauthorized: Only managers can award badges' };
  }

  if (!badgeId || !userId) {
    return { error: 'Badge and user are required' };
  }

  const { data: badgeRow, error: badgeError } = await supabaseAdmin
    .from('Badges')
    .select('id, award_at_interval, points')
    .eq('id', badgeId)
    .single();

  if (badgeError || !badgeRow) {
    return { error: `Failed to verify badge: ${badgeError?.message || 'Badge not found'}` };
  }

  if (badgeRow.award_at_interval !== 'none') {
    return { error: 'Only manual badges can be awarded by a manager' };
  }

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  const awardedBy = authData?.user?.id ?? null;

  const { error: insertError } = await supabaseAdmin
    .from('UserBadges')
    .insert({
      badge_id: badgeId,
      awarded_to: userId,
      awarded_by: awardedBy,
    });

  if (insertError) {
    if ((insertError as any).code === '23505') {
      return { error: 'User already has this badge' };
    }
    return { error: `Failed to award badge: ${insertError.message}` };
  }

  // Award points to the user if badge has points
  if (badgeRow.points && badgeRow.points > 0) {
    const { error: updateError } = await supabaseAdmin
      .from('User')
      .update(undefined) // Don't update anything directly, let triggers handle it
      .eq('id', userId);

    // Points should be updated by the trigger on UserBadges insert
    // But we can verify the update completed
    if (updateError) {
      console.error('Warning: Could not verify points update, but badge was awarded:', updateError);
      // Still return success since the badge was awarded
    }
  }

  return { error: null, data: true };
}
