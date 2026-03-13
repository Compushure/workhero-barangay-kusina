'use server';

import { createClient } from '@/lib/supabase/server';
import type { ServerActionResponse } from '@/types';
import type { Badge, BadgeCondition, BadgeOption } from '@/types/manager/badge-editor';
import { addBadgeSchema, editBadgeSchema } from '@/zod/schemas/badge';

const ATTRIBUTE_OPTIONS: BadgeOption[] = [
  { id: 'user_level', name: 'User Level' },
  { id: 'total_xp', name: 'Total XP' },
  { id: 'total_points_earned', name: 'Total Points Earned' },
];

const ATTENDANCE_OPTIONS: BadgeOption[] = [
  { id: 'is_overtime', name: 'Overtime' },
  { id: 'is_absent', name: 'Absent' },
  { id: 'is_undertime', name: 'Undertime' },
  { id: 'over_breaktime', name: 'Over Breaktime' },
];

function getBadgeImageUrl(supabase: any, badgeId: string): string {
  const baseUrl = supabase.storage.from('badges').getPublicUrl(`${badgeId}/badge.png`)
    .data.publicUrl;
  return `${baseUrl}?t=${Date.now()}`;
}

function normalizeConditions(raw: unknown): BadgeCondition[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((condition: any) => ({
    id: String(condition.id ?? ''),
    requirement_type: condition.requirement_type,
    requirement_operator: condition.requirement_operator,
    requirement_attrb_id: condition.requirement_attrb_id ?? null,
    requirement_attrb_value: Number(condition.requirement_attrb_value ?? 0),
    requirement_interval: condition.requirement_interval ?? 'none',
    logic_type: condition.logic_type ?? 'and',
  }));
}

export async function fetchBadges(): Promise<ServerActionResponse<Badge[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('badge_conditions_view')
    .select('*')
    .order('badge_name', { ascending: true });

  if (error) {
    return { error: `Failed to fetch badges: ${error.message}` };
  }

  const badgeIds = (data || []).map((row: any) => row.badge_id).filter(Boolean);

  if (badgeIds.length === 0) {
    return { error: null, data: [] };
  }

  const { data: badgeMeta, error: badgeMetaError } = await supabase
    .from('Badges')
    .select('id, date_created, created_by')
    .in('id', badgeIds);

  if (badgeMetaError) {
    return { error: `Failed to fetch badge metadata: ${badgeMetaError.message}` };
  }

  const metaMap = new Map(
    (badgeMeta || []).map((row: any) => [row.id, { date_created: row.date_created, created_by: row.created_by }])
  );

  const creatorIds = Array.from(new Set((badgeMeta || []).map((row: any) => row.created_by).filter(Boolean)));

  const { data: creators, error: creatorsError } = await supabase
    .from('User')
    .select('id, name')
    .in('id', creatorIds);

  if (creatorsError) {
    return { error: `Failed to fetch badge creators: ${creatorsError.message}` };
  }

  const creatorMap = new Map((creators || []).map((row: any) => [row.id, row.name]));

  const badges: Badge[] = (data || []).map((row: any) => ({
    id: row.badge_id,
    name: row.badge_name,
    description: row.badge_description,
    points: row.badge_points,
    img_link: row.badge_img_link,
    award_at_interval: row.badge_award_at_interval ?? 'none',
    created_at: metaMap.get(row.badge_id)?.date_created ?? row.badge_created_at ?? row.created_at ?? null,
    created_by_name:
      (metaMap.get(row.badge_id)?.created_by && creatorMap.get(metaMap.get(row.badge_id)?.created_by)) ||
      row.badge_created_by_name ||
      row.created_by_name ||
      null,
    conditions: normalizeConditions(row.conditions),
  }));

  return { error: null, data: badges };
}

export async function fetchBadgeTaskOptions(): Promise<ServerActionResponse<BadgeOption[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('KPICategory')
    .select('id, name')
    .order('name', { ascending: true });

  if (error) {
    return { error: `Failed to fetch task options: ${error.message}` };
  }

  const options = (data || []).map((row: any) => ({
    id: row.id,
    name: row.name,
  }));

  return { error: null, data: options };
}

export async function fetchBadgeAttributeOptions(): Promise<ServerActionResponse<BadgeOption[]>> {
  return { error: null, data: ATTRIBUTE_OPTIONS };
}

export async function fetchBadgeAttendanceOptions(): Promise<ServerActionResponse<BadgeOption[]>> {
  return { error: null, data: ATTENDANCE_OPTIONS };
}

export async function uploadBadgeImage(
  badgeId: string,
  file: File
): Promise<ServerActionResponse<{ path: string | null; publicUrl: string }>> {
  try {
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return { error: 'Image size must be less than 5MB' };
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return { error: 'Only JPEG, PNG, and WebP images are allowed' };
    }

    const supabase = await createClient();
    const { data: uploadResult, error } = await supabase.storage
      .from('badges')
      .upload(`${badgeId}/badge.png`, file, {
        cacheControl: '0',
        upsert: true,
        contentType: file.type || 'image/png',
      });

    if (error) {
      return { error: 'Failed to upload badge image: ' + error.message };
    }

    const publicUrl = getBadgeImageUrl(supabase, badgeId);

    const { error: updateError } = await supabase
      .from('Badges')
      .update({ img_link: publicUrl })
      .eq('id', badgeId);

    if (updateError) {
      return { error: 'Failed to update badge image: ' + updateError.message };
    }

    return { error: null, data: { path: uploadResult?.path ?? null, publicUrl } };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'An unexpected error occurred while uploading the image' };
  }
}

export async function deleteBadgeImage(
  badgeId: string
): Promise<ServerActionResponse<void>> {
  try {
    const supabase = await createClient();

    const { error: removeError } = await supabase.storage
      .from('badges')
      .remove([`${badgeId}/badge.png`]);

    if (removeError) {
      return { error: 'Failed to delete badge image: ' + removeError.message };
    }

    const { error: updateError } = await supabase
      .from('Badges')
      .update({ img_link: null })
      .eq('id', badgeId);

    if (updateError) {
      return { error: 'Failed to clear badge image: ' + updateError.message };
    }

    return { error: null };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'An unexpected error occurred while deleting the image' };
  }
}

export async function addBadge(input: unknown): Promise<ServerActionResponse<Badge>> {
  const parsed = addBadgeSchema.parse(input);
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();
  const createdBy = userData?.user?.id ?? null;

  const { data: badgeRow, error: badgeError } = await supabase
    .from('Badges')
    .insert({
      name: parsed.name,
      description: parsed.description?.trim() || null,
      points: parsed.points,
      award_at_interval: parsed.award_at_interval,
      img_link: parsed.img_link?.trim() || null,
      created_by: createdBy,
    })
    .select('*')
    .single();

  if (badgeError || !badgeRow) {
    return { error: `Failed to add badge: ${badgeError?.message || 'Unknown error'}` };
  }

  let conditions: BadgeCondition[] = [];
  if (parsed.conditions.length > 0) {
    const requirements = parsed.conditions.map((condition) => ({
      badge_id: badgeRow.id,
      requirement_type: condition.requirement_type,
      requirement_operator: condition.requirement_operator,
      requirement_interval: 'none',
      requirement_attrb_id: condition.requirement_attrb_id,
      requirement_attrb_value: condition.requirement_attrb_value,
      logic_type: condition.logic_type,
    }));

    const { data: requirementRows, error: requirementError } = await supabase
      .from('BadgeRequirements')
      .insert(requirements)
      .select('*');

    if (requirementError) {
      return { error: `Failed to add badge requirements: ${requirementError.message}` };
    }

    conditions = (requirementRows || []).map((row: any) => ({
      id: row.id,
      requirement_type: row.requirement_type,
      requirement_operator: row.requirement_operator,
      requirement_attrb_id: row.requirement_attrb_id,
      requirement_attrb_value: row.requirement_attrb_value,
      requirement_interval: row.requirement_interval ?? 'none',
      logic_type: row.logic_type ?? 'and',
    }));
  }

  return {
    error: null,
    data: {
      id: badgeRow.id,
      name: badgeRow.name,
      description: badgeRow.description,
      points: badgeRow.points,
      award_at_interval: badgeRow.award_at_interval ?? 'none',
      img_link: badgeRow.img_link,
      conditions,
    },
  };
}

export async function editBadge(id: string, input: unknown): Promise<ServerActionResponse<Badge>> {
  const parsed = editBadgeSchema.parse(input);
  const supabase = await createClient();

  const { data: badgeRow, error: badgeError } = await supabase
    .from('Badges')
    .update({
      name: parsed.name,
      description: parsed.description?.trim() || null,
      points: parsed.points,
      award_at_interval: parsed.award_at_interval,
      img_link: parsed.img_link?.trim() || null,
    })
    .eq('id', id)
    .select('*')
    .single();

  if (badgeError || !badgeRow) {
    return { error: `Failed to update badge: ${badgeError?.message || 'Unknown error'}` };
  }

  const { error: deleteError } = await supabase
    .from('BadgeRequirements')
    .delete()
    .eq('badge_id', id);

  if (deleteError) {
    return { error: `Failed to reset badge requirements: ${deleteError.message}` };
  }

  let conditions: BadgeCondition[] = [];
  if (parsed.conditions.length > 0) {
    const requirements = parsed.conditions.map((condition) => ({
      badge_id: id,
      requirement_type: condition.requirement_type,
      requirement_operator: condition.requirement_operator,
      requirement_interval: 'none',
      requirement_attrb_id: condition.requirement_attrb_id,
      requirement_attrb_value: condition.requirement_attrb_value,
      logic_type: condition.logic_type,
    }));

    const { data: requirementRows, error: requirementError } = await supabase
      .from('BadgeRequirements')
      .insert(requirements)
      .select('*');

    if (requirementError) {
      return { error: `Failed to update badge requirements: ${requirementError.message}` };
    }

    conditions = (requirementRows || []).map((row: any) => ({
      id: row.id,
      requirement_type: row.requirement_type,
      requirement_operator: row.requirement_operator,
      requirement_attrb_id: row.requirement_attrb_id,
      requirement_attrb_value: row.requirement_attrb_value,
      requirement_interval: row.requirement_interval ?? 'none',
      logic_type: row.logic_type ?? 'and',
    }));
  }

  return {
    error: null,
    data: {
      id: badgeRow.id,
      name: badgeRow.name,
      description: badgeRow.description,
      points: badgeRow.points,
      award_at_interval: badgeRow.award_at_interval ?? 'none',
      img_link: badgeRow.img_link,
      conditions,
    },
  };
}

export async function deleteBadge(id: string): Promise<ServerActionResponse<boolean>> {
  const supabase = await createClient();

  const { error } = await supabase.from('Badges').delete().eq('id', id);

  if (error) {
    return { error: `Failed to delete badge: ${error.message}` };
  }

  return { error: null, data: true };
}
