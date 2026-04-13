'use server';

import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import type { ServerActionResponse } from '@/types';
import type { BadgeAssignmentUser, BadgeSummary, CollectedBadge, BadgeAwardDebugEntry } from '@/types/manager/badge-assignment';
import { getUserRole } from '@/actions/shared/auth';
import { insertNotification } from '@/lib/notifications';

// more anton stuff 

// this just a heplper that removes weird id validues kay indi ni sa sa badge editor
// always get the valid truthy value for the badge-idsmake sure its VALID and makita sa DB
function buildBadgeIds(collected: CollectedBadge[]): string[] {
  return collected.map((badge) => badge.badge_id).filter(Boolean);
}

//fetch an manual badges
// may ara sang badges na may inteval and may ara na i mannually assign
export async function fetchManualBadges(): Promise<ServerActionResponse<BadgeSummary[]>> {

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
//fetch ALL

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
 // for the employees view need to fetch all valid users sa db and listdown ang badges nila
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
    // diri mo makuha sa awarted_ id, this is actually a coaleased dat nanaman
    // basedsa id na gin providewill get the row of the user and then ang json b collected badges nila


  if (collectedError) {
    return { error: `Failed to fetch user badges: ${collectedError.message}` };
  }

  const collectedByUser = new Map<string, CollectedBadge[]>();
  // ari na di gin unwrap  if wla badges empty ang array
  (collectedRows || []).forEach((row: any) => {
    collectedByUser.set(row.awarded_to_id, (row.collected_badges || []) as CollectedBadge[]);
  });

  // note this iis a MAPPE DARRAY
  const usersWithBadges: BadgeAssignmentUser[] = (users || []).map((user: any) => {
    // gets users with badges and then constructs an path for their picture
    // note the users table never had a profile image link colun so dynamically constructed ang cdn link
    // again mostly because of changing req the user profile was originally going to just be ar andomized icon
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

  // userswithBAdges include the ones wtih mpty arrays btw 
  return { error: null, data: usersWithBadges };
}


//assigns a manual manual badge to a user
export async function assignManualBadgeToUser(
  badgeId: string,
  userId: string
): Promise<ServerActionResponse<boolean>> {
 

  if (!badgeId || !userId) {
    return { error: 'Badge and user are required' };
  }

  const { data: badgeRow, error: badgeError } = await supabaseAdmin
    .from('Badges')
    .select('id, name, award_at_interval, points')
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

  // Award points to the user if badge has points; keep points and total_points_earned in sync.
  if (badgeRow.points && badgeRow.points > 0) {
    const { data: userRow, error: userFetchError } = await supabaseAdmin
      .from('User')
      .select('points, total_points_earned')
      .eq('id', userId)
      .single();

    if (userFetchError || !userRow) {
      return { error: 'Failed to add points after awarding badge' };
    }

    const currentPoints = (userRow as { points: number | null }).points ?? 0;
    const currentTotalPointsEarned =
      (userRow as { total_points_earned: number | null }).total_points_earned ?? 0;

    const { error: manualUpdateError } = await supabaseAdmin
      .from('User')
      .update({
        points: currentPoints + badgeRow.points,
        total_points_earned: currentTotalPointsEarned + badgeRow.points,
      })
      .eq('id', userId);

    if (manualUpdateError) {
      return { error: 'Failed to add points after awarding badge' };
    }
  }

  // this is actually a trigger for a notificatoin
  // since realtime is enaled will show as a pop up on employee view
  await insertNotification({
    userId,
    type: 'badge',
    message: `You have been awarded the ${badgeRow.name ?? 'badge'} badge! You have earned ${badgeRow.points ?? 0} bonus points.`,
    metadata: {
      badgeId,
      badgeName: badgeRow.name ?? null,
      pointsAwarded: badgeRow.points ?? 0,
      awardedBy,
    },
  });

  return { error: null, data: true };
}

// DEBUG PART NO NEED TO CARE ABOUT THIS 
// 👺👺👺 DEBUGLNG NI PRA MAKITA KUNG GAGANA TLDR FOR FUTERE DEVS 
// jus tliek the other debugs whenenv is prod di makita na
// though if you remove it man sa local oks man
export async function fetchBadgeAwardDebugEntries(): Promise<ServerActionResponse<BadgeAwardDebugEntry[]>> {
 

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


// this will never happen in prod, removing a badge SHOULD NOt BE A FUNCTION
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
