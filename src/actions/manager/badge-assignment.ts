'use server';

import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import type { ServerActionResponse } from '@/types';
import type { BadgeAssignmentUser, BadgeSummary, CollectedBadge, BadgeAwardDebugEntry } from '@/types/manager/badge-assignment';
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
    const { error: pointsError } = await supabaseAdmin.rpc('increment_points_for_user', {
      target_user_id: userId,
      amount: badgeRow.points,
    });

    if (pointsError) {
      const { data: userRow, error: userFetchError } = await supabaseAdmin
        .from('User')
        .select('points')
        .eq('id', userId)
        .single();

      if (userFetchError || !userRow) {
        return { error: 'Failed to add points after awarding badge' };
      }

      const currentPoints = (userRow as { points: number | null }).points ?? 0;
      const { error: manualUpdateError } = await supabaseAdmin
        .from('User')
        .update({ points: currentPoints + badgeRow.points })
        .eq('id', userId);

      if (manualUpdateError) {
        return { error: 'Failed to add points after awarding badge' };
      }
    }
  }

  return { error: null, data: true };
}

export async function fetchBadgeAwardDebugEntries(): Promise<ServerActionResponse<BadgeAwardDebugEntry[]>> {
  const { role, error: roleError } = await getUserRole();
  if (roleError || !role || role.trim().toLowerCase() !== 'manager') {
    return { error: 'Unauthorized: Only managers can view badge debug logs' };
  }

  const { data: awardRows, error: awardError } = await supabaseAdmin
    .from('UserBadges')
    .select('id, badge_id, awarded_to, awarded_by, date_acquired')
    .order('date_acquired', { ascending: false })
    .limit(100);

  if (awardError) {
    return { error: `Failed to fetch badge awards: ${awardError.message}` };
  }

  const badgeIds = Array.from(new Set((awardRows || []).map((row: any) => row.badge_id).filter(Boolean)));
  const userIds = Array.from(
    new Set(
      (awardRows || [])
        .flatMap((row: any) => [row.awarded_to, row.awarded_by])
        .filter(Boolean)
    )
  );

  const { data: badgeRows, error: badgeFetchError } = await supabaseAdmin
    .from('Badges')
    .select('id, name, points')
    .in('id', badgeIds.length ? badgeIds : ['00000000-0000-0000-0000-000000000000']);

  if (badgeFetchError) {
    return { error: `Failed to fetch badges: ${badgeFetchError.message}` };
  }

  const { data: userRows, error: userFetchError } = await supabaseAdmin
    .from('User')
    .select('id, name, employee_id, points')
    .in('id', userIds.length ? userIds : ['00000000-0000-0000-0000-000000000000']);

  if (userFetchError) {
    return { error: `Failed to fetch users: ${userFetchError.message}` };
  }

  const badgeMap = new Map((badgeRows || []).map((badge: any) => [badge.id, badge]));
  const userMap = new Map((userRows || []).map((user: any) => [user.id, user]));

  const entries: BadgeAwardDebugEntry[] = (awardRows || []).map((row: any) => {
    const badge = badgeMap.get(row.badge_id);
    const awardedTo = userMap.get(row.awarded_to);
    const awardedBy = row.awarded_by ? userMap.get(row.awarded_by) : null;

    return {
      id: row.id,
      badge_id: row.badge_id,
      badge_name: badge?.name || 'Unknown badge',
      badge_points: badge?.points ?? 0,
      awarded_to_id: row.awarded_to,
      awarded_to_name: awardedTo?.name || 'Unknown',
      employee_id: awardedTo?.employee_id ?? null,
      awarded_by_id: row.awarded_by ?? null,
      awarded_by_name: awardedBy?.name ?? null,
      user_points: awardedTo?.points ?? 0,
      date_acquired: row.date_acquired,
    };
  });

  return { error: null, data: entries };
}

export async function removeBadgeAward(awardId: string): Promise<ServerActionResponse<boolean>> {
  const { role, error: roleError } = await getUserRole();
  if (roleError || !role || role.trim().toLowerCase() !== 'manager') {
    return { error: 'Unauthorized: Only managers can remove badge awards' };
  }

  if (!awardId) {
    return { error: 'Award id is required' };
  }

  const { data: awardRow, error: awardError } = await supabaseAdmin
    .from('UserBadges')
    .select('id, badge_id, awarded_to')
    .eq('id', awardId)
    .single();

  if (awardError || !awardRow) {
    return { error: `Failed to locate badge award: ${awardError?.message || 'Not found'}` };
  }

  const { data: badgeRow, error: badgeError } = await supabaseAdmin
    .from('Badges')
    .select('points')
    .eq('id', awardRow.badge_id)
    .single();

  if (badgeError || !badgeRow) {
    return { error: `Failed to load badge points: ${badgeError?.message || 'Badge not found'}` };
  }

  const { error: deleteError } = await supabaseAdmin
    .from('UserBadges')
    .delete()
    .eq('id', awardId);

  if (deleteError) {
    return { error: `Failed to remove badge award: ${deleteError.message}` };
  }

  const pointsToRemove = badgeRow.points ?? 0;
  if (pointsToRemove > 0 && awardRow.awarded_to) {
    const { data: userRow, error: userFetchError } = await supabaseAdmin
      .from('User')
      .select('points')
      .eq('id', awardRow.awarded_to)
      .single();

    if (userFetchError || !userRow) {
      return { error: 'Failed to adjust user points after removing badge' };
    }

    const currentPoints = (userRow as { points: number | null }).points ?? 0;
    const nextPoints = Math.max(0, currentPoints - pointsToRemove);

    const { error: updateError } = await supabaseAdmin
      .from('User')
      .update({ points: nextPoints })
      .eq('id', awardRow.awarded_to);

    if (updateError) {
      return { error: 'Failed to adjust user points after removing badge' };
    }
  }

  return { error: null, data: true };
}
