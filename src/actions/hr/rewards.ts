'use server';

import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import {
  ServerActionResponse,
  AddRewardInput,
  EditRewardInput,
  Reward,
} from '@/types';
import { addRewardSchema, editRewardSchema } from '@/zod/schemas';

const ANCHOR_PREFIX = 'anchor:';

/**
 * Converts a Date into YYYY-MM-DD using local calendar values.
 * Used to persist interval anchor dates without time components.
 */
function toDateOnlyIso(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parses the stored anchor date value into a local Date at start of day.
 * Accepts raw dates and prefixed values like `anchor:YYYY-MM-DD`.
 */
function parseAnchorDate(value?: string | Date | null): Date | null {
  if (!value) return null;
  const raw = value instanceof Date ? toDateOnlyIso(value) : value;
  const datePart = raw.startsWith(ANCHOR_PREFIX) ? raw.slice(ANCHOR_PREFIX.length) : raw;
  const parsed = new Date(`${datePart}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Normalizes any supported date input into a date-only anchor string.
 * Returns null when input is empty or invalid.
 */
function toAnchorString(date?: Date | string | null): string | null {
  if (!date) return null;
  const parsed = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(parsed.getTime())) return null;
  return toDateOnlyIso(parsed);
}

/**
 * Returns the Sunday-start beginning of the week for a given date.
 * This is used for weekly interval comparisons.
 */
function startOfWeekSunday(date: Date): Date {
  const copy = new Date(date);
  const day = copy.getDay();
  copy.setDate(copy.getDate() - day);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

/**
 * Truncates a Date to local midnight for day-level comparisons.
 */
function startOfDayLocal(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

/**
 * Checks whether an anchor date still belongs to the current interval window
 * (current week, current month, or current year).
 */
function isDateInCurrentInterval(anchorDate: Date | null, interval: 'weekly' | 'monthly' | 'yearly'): boolean {
  if (!anchorDate) return true;

  const now = new Date();

  if (interval === 'weekly') {
    return startOfWeekSunday(anchorDate).getTime() === startOfWeekSunday(now).getTime();
  }

  if (interval === 'monthly') {
    return (
      anchorDate.getFullYear() === now.getFullYear() &&
      anchorDate.getMonth() === now.getMonth()
    );
  }

  return anchorDate.getFullYear() === now.getFullYear();
}

/**
 * Checks whether today's date has reached/passed the anchor date.
 * Used to keep future-dated rewards hidden until their start day.
 */
function isAnchorDateReached(anchorDate: Date | null): boolean {
  if (!anchorDate) return true;
  return startOfDayLocal(anchorDate).getTime() <= startOfDayLocal(new Date()).getTime();
}

/**
 * Determines if a reward should be visible for an interval query.
 * Rule: it must be inside the current interval and not before anchor date.
 */
function isRewardActiveForIntervalWindow(
  anchorDate: Date | null,
  interval: 'weekly' | 'monthly' | 'yearly'
): boolean {
  // Reward is visible only while we are still within the anchor's interval window.
  if (!isDateInCurrentInterval(anchorDate, interval)) return false;

  // If anchor date is in the future within this interval, keep it hidden until that date.
  return isAnchorDateReached(anchorDate);
}

/**
 * Normalizes availability interval values from DB/UI into supported literals.
 * Returns null for unsupported legacy values.
 */
function normalizeAvailabilityIntervalValue(
  value?: number | string | null
): 'weekly' | 'monthly' | 'yearly' | null {
  if (value === null || value === undefined) return null;

  if (value === 'weekly' || value === 'monthly' || value === 'yearly') {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'weekly' || normalized === 'monthly' || normalized === 'yearly') {
      return normalized;
    }
  }

  return null;
}

/**
 * Builds a public reward image URL with a cache-busting query string.
 * Keeps recently uploaded images from appearing stale in the UI.
 */
function getRewardImageUrl(supabase: any, rewardId: string): string {
  const baseUrl = supabase.storage.from('reward').getPublicUrl(`${rewardId}/profile.png`)
    .data.publicUrl;
  // Add cache-busting query parameter to force fresh image on every fetch
  return `${baseUrl}?t=${Date.now()}`;
}

// ============================================
// HR Reward Management Actions
// ============================================

/**
 * Get all reward/mercado items
 * Used by HR to manage rewards inventory
 * @returns ServerActionResponse with array of rewards
 */
export async function getRewardsAction(): Promise<ServerActionResponse<Reward[]>> {
  try {
    // Get Supabase client
    const supabase = await createClient();

    // Fetch all rewards
    const { data, error } = await supabase
      .from('Reward')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching rewards:', error);
      return { error: `Failed to fetch items: ${error.message}` };
    }

    // Fetch approved redemption counts for each reward
    const { data: redemptionData } = await supabase
      .from('RewardRequest')
      .select('reward_id, quantity')
      .eq('status', 'approved');

    // Calculate total redeemed quantity per reward
    const redeemedCounts = new Map<string, number>();
    if (redemptionData) {
      redemptionData.forEach((req: any) => {
        const current = redeemedCounts.get(req.reward_id) || 0;
        redeemedCounts.set(req.reward_id, current + (req.quantity || 1));
      });
    }

    // Transform database response to match Reward type
    const rewards: Reward[] = (data || []).map((item) => {
      const redeemedCount = redeemedCounts.get(item.id) || 0;
      const hasQuantityLimit = item.quantity !== null && item.quantity !== undefined;

      return {
        id: item.id,
        name: item.name,
        pointsCost: item.points_cost,
        quantity: item.quantity,
        redeemingLimit: item.redeeming_limit,
        category: item.category,
        isActive: item.is_active,
        availableDate: parseAnchorDate(item.availability_anchor_date),
        availableMonth: normalizeAvailabilityIntervalValue(item.availability_interval),
        createdAt: item.created_at,
        createdBy: item.created_by,
        imageUrl: getRewardImageUrl(supabase, item.id),
        redeemedCount,
        isOutOfStock: hasQuantityLimit && item.quantity <= 0,
      };
    });

    console.log('🔵 getRewardsAction - Total rewards from DB:', rewards.length);
    console.log('🔵 Items with availableMonth:', rewards.filter(r => r.availableMonth).map(r => ({
      name: r.name,
      availableMonth: r.availableMonth,
      isActive: r.isActive
    })));
    console.log('🔵 Items with isActive=true:', rewards.filter(r => r.isActive).length);

    return { error: null, data: rewards };
  } catch (error) {
    console.error('Error in getRewardsAction:', error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'An unexpected error occurred while fetching items' };
  }
}

/**
 * Get active reward/mercado items assigned to a specific month number
 * Used by employee Mercado month stalls (1 = January, 12 = December)
 * @param month - Month number (1-12)
 * @returns ServerActionResponse with array of rewards for the month
 */
export async function getAvailableRewardsByMonthAction(
  month: number
): Promise<ServerActionResponse<Reward[]>> {
  try {
    if (!Number.isInteger(month) || month < 1 || month > 12) {
      return { error: 'Invalid month. Must be a number from 1 to 12.' };
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('Reward')
      .select('*')
      .eq('is_active', true)
      .eq('availability_interval', String(month))
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching rewards by month:', error);
      return { error: `Failed to fetch monthly items: ${error.message}` };
    }

    const rewardIds = (data || []).map((item) => item.id);

    let redemptionData: Array<{ reward_id: string; quantity: number | null }> | null = null;
    if (rewardIds.length > 0) {
      const { data: approvedRedemptions } = await supabase
        .from('RewardRequest')
        .select('reward_id, quantity')
        .eq('status', 'approved')
        .in('reward_id', rewardIds);

      redemptionData = approvedRedemptions;
    }

    const redeemedCounts = new Map<string, number>();
    if (redemptionData) {
      redemptionData.forEach((req: any) => {
        const current = redeemedCounts.get(req.reward_id) || 0;
        redeemedCounts.set(req.reward_id, current + (req.quantity || 1));
      });
    }

    const rewards: Reward[] = (data || []).map((item) => {
      const redeemedCount = redeemedCounts.get(item.id) || 0;
      const hasQuantityLimit = item.quantity !== null && item.quantity !== undefined;

      return {
        id: item.id,
        name: item.name,
        pointsCost: item.points_cost,
        quantity: item.quantity,
        redeemingLimit: item.redeeming_limit,
        category: item.category,
        isActive: item.is_active,
        availableDate: parseAnchorDate(item.availability_anchor_date),
        availableMonth: normalizeAvailabilityIntervalValue(item.availability_interval),
        createdAt: item.created_at,
        createdBy: item.created_by,
        imageUrl: getRewardImageUrl(supabase, item.id),
        redeemedCount,
        isOutOfStock: hasQuantityLimit && item.quantity <= 0,
      };
    });

    return { error: null, data: rewards };
  } catch (error) {
    console.error('Error in getAvailableRewardsByMonthAction:', error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'An unexpected error occurred while fetching monthly items' };
  }
}

/**
 * Get active reward/mercado items assigned to a specific interval
 * Used by employee Mercado interval stalls (weekly/monthly/yearly)
 * @param interval - Availability interval
 * @returns ServerActionResponse with array of rewards for the interval
 */
export async function getAvailableRewardsByIntervalAction(
  interval: 'weekly' | 'monthly' | 'yearly'
): Promise<ServerActionResponse<Reward[]>> {
  try {
    if (!['weekly', 'monthly', 'yearly'].includes(interval)) {
      return { error: 'Invalid interval. Must be weekly, monthly, or yearly.' };
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('Reward')
      .select('*')
      .eq('is_active', true)
      .eq('availability_interval', interval)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching rewards by interval:', error);
      return { error: `Failed to fetch ${interval} items: ${error.message}` };
    }

    const rewardIds = (data || []).map((item) => item.id);

    let redemptionData: Array<{ reward_id: string; quantity: number | null }> | null = null;
    if (rewardIds.length > 0) {
      const { data: approvedRedemptions } = await supabase
        .from('RewardRequest')
        .select('reward_id, quantity')
        .eq('status', 'approved')
        .in('reward_id', rewardIds);

      redemptionData = approvedRedemptions;
    }

    const redeemedCounts = new Map<string, number>();
    if (redemptionData) {
      redemptionData.forEach((req: any) => {
        const current = redeemedCounts.get(req.reward_id) || 0;
        redeemedCounts.set(req.reward_id, current + (req.quantity || 1));
      });
    }

    const rewards: Reward[] = (data || [])
      .filter((item) =>
        isRewardActiveForIntervalWindow(parseAnchorDate(item.availability_anchor_date), interval)
      )
      .map((item) => {
      const redeemedCount = redeemedCounts.get(item.id) || 0;
      const hasQuantityLimit = item.quantity !== null && item.quantity !== undefined;

      return {
        id: item.id,
        name: item.name,
        pointsCost: item.points_cost,
        quantity: item.quantity,
        redeemingLimit: item.redeeming_limit,
        category: item.category,
        isActive: item.is_active,
        availableDate: parseAnchorDate(item.availability_anchor_date),
        availableMonth: normalizeAvailabilityIntervalValue(item.availability_interval),
        createdAt: item.created_at,
        createdBy: item.created_by,
        imageUrl: getRewardImageUrl(supabase, item.id),
        redeemedCount,
        isOutOfStock: hasQuantityLimit && item.quantity <= 0,
      };
    });

    return { error: null, data: rewards };
  } catch (error) {
    console.error('Error in getAvailableRewardsByIntervalAction:', error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'An unexpected error occurred while fetching interval items' };
  }
}

/**
 * Add a new reward/mercado item
 * HR only - creates a new reward in the system
 * @param input - The reward data to add
 * @returns ServerActionResponse with the created reward
 */
export async function addRewardAction(
  input: AddRewardInput
): Promise<ServerActionResponse<Reward>> {
  try {
    // Validate input
    const validatedData = addRewardSchema.parse(input);

    const supabase = await createClient();

    // Additional backend validation for redeeming_limit
    if (validatedData.redeemingLimit !== undefined) {
      if (validatedData.redeemingLimit < 0) {
        return { error: 'Redeeming limit cannot be negative' };
      }
      if (
        validatedData.quantity !== undefined &&
        validatedData.redeemingLimit > validatedData.quantity
      ) {
        return { error: 'Redeeming limit cannot be greater than quantity' };
      }
    }

    const normalizedAvailableMonth = normalizeAvailabilityIntervalValue(validatedData.availableMonth);
    if (
      (normalizedAvailableMonth === 'weekly' ||
        normalizedAvailableMonth === 'monthly' ||
        normalizedAvailableMonth === 'yearly') &&
      !validatedData.availableDate
    ) {
      return { error: 'Availability date is required for weekly, monthly, or yearly interval.' };
    }
    const availabilityAnchorDate =
      normalizedAvailableMonth === 'weekly' ||
      normalizedAvailableMonth === 'monthly' ||
      normalizedAvailableMonth === 'yearly'
        ? toAnchorString(validatedData.availableDate)
        : null;

    // Insert reward into database
    const { data, error } = await supabase
      .from('Reward')
      .insert({
        name: validatedData.name,
        points_cost: validatedData.pointsCost,
        quantity: validatedData.quantity,
        redeeming_limit: validatedData.redeemingLimit,
        category: validatedData.category,
        is_active: validatedData.isActive,
        availability_interval:
          normalizedAvailableMonth === null ? null : String(normalizedAvailableMonth),
        availability_anchor_date: availabilityAnchorDate,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding reward:', error);
      return { error: `Failed to add item: ${error.message}` };
    }

    // Transform database response to match Reward type
    const reward: Reward = {
      id: data.id,
      name: data.name,
      pointsCost: data.points_cost,
      quantity: data.quantity,
      redeemingLimit: data.redeeming_limit,
      category: data.category,
      isActive: data.is_active,
      availableDate: parseAnchorDate(data.availability_anchor_date),
      availableMonth: normalizeAvailabilityIntervalValue(data.availability_interval),
      createdAt: data.created_at,
      createdBy: data.created_by,
      imageUrl: getRewardImageUrl(supabase, data.id),
    };

    return { error: null, data: reward };
  } catch (error) {
    console.error('Error in addRewardAction:', error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'An unexpected error occurred while adding the item' };
  }
}

/**
 * Edit an existing reward/mercado item
 * HR only - updates reward details
 * @param id - The reward ID to edit
 * @param input - The updated reward data
 * @returns ServerActionResponse with the updated reward
 */
export async function editRewardAction(
  id: string,
  input: EditRewardInput
): Promise<ServerActionResponse<Reward>> {
  try {
    // Validate input
    const validatedData = editRewardSchema.parse(input);

    // Get Supabase client
    const supabase = await createClient();

    // Additional backend validation for redeeming_limit
    if (validatedData.redeemingLimit !== undefined) {
      if (validatedData.redeemingLimit < 0) {
        return { error: 'Redeeming limit cannot be negative' };
      }

      // If quantity is also being updated, validate against it
      if (validatedData.quantity !== undefined) {
        if (validatedData.redeemingLimit > validatedData.quantity) {
          return { error: 'Redeeming limit cannot be greater than quantity' };
        }
      } else {
        // If quantity is not being updated, fetch current quantity and validate
        const { data: currentReward, error: fetchError } = await supabase
          .from('Reward')
          .select('quantity, redeeming_limit')
          .eq('id', id)
          .single();

        if (fetchError) {
          return { error: 'Failed to validate redeeming limit exceeding current quantity' };
        }

        if (
          currentReward?.quantity !== undefined &&
          validatedData.redeemingLimit > currentReward.quantity
        ) {
          return { error: 'Redeeming limit cannot be greater than current quantity' };
        }
      }
    }

    // Build update object with only provided fields
    const updateData: Record<string, unknown> = {};
    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.pointsCost !== undefined) updateData.points_cost = validatedData.pointsCost;
    if (validatedData.quantity !== undefined) updateData.quantity = validatedData.quantity;
    if (validatedData.redeemingLimit !== undefined)
      updateData.redeeming_limit = validatedData.redeemingLimit;
    if (validatedData.category !== undefined) updateData.category = validatedData.category;
    if (validatedData.isActive !== undefined) updateData.is_active = validatedData.isActive;
    if (validatedData.availableMonth !== undefined) {
      const normalizedAvailableMonth = normalizeAvailabilityIntervalValue(validatedData.availableMonth);
      if (
        (normalizedAvailableMonth === 'weekly' ||
          normalizedAvailableMonth === 'monthly' ||
          normalizedAvailableMonth === 'yearly') &&
        !validatedData.availableDate
      ) {
        return {
          error: 'Availability date is required when setting weekly, monthly, or yearly interval.',
        };
      }
      updateData.availability_interval =
        normalizedAvailableMonth === null ? null : String(normalizedAvailableMonth);
      updateData.availability_anchor_date =
        normalizedAvailableMonth === 'weekly' ||
        normalizedAvailableMonth === 'monthly' ||
        normalizedAvailableMonth === 'yearly'
          ? toAnchorString(validatedData.availableDate)
          : null;
    } else if (validatedData.availableDate !== undefined) {
      const existingReward = await supabase
        .from('Reward')
        .select('availability_interval')
        .eq('id', id)
        .single();

      const existingInterval = normalizeAvailabilityIntervalValue(
        existingReward.data?.availability_interval
      );
      if (
        existingInterval === 'weekly' ||
        existingInterval === 'monthly' ||
        existingInterval === 'yearly'
      ) {
        updateData.availability_anchor_date = toAnchorString(validatedData.availableDate);
      }
    }

    // Update reward in database
    const { data, error } = await supabase
      .from('Reward')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating reward:', error);
      return { error: `Failed to update item: ${error.message}` };
    }

    // Transform database response to match Reward type
    const reward: Reward = {
      id: data.id,
      name: data.name,
      pointsCost: data.points_cost,
      quantity: data.quantity,
      redeemingLimit: data.redeeming_limit,
      category: data.category,
      isActive: data.is_active,
      availableDate: parseAnchorDate(data.availability_anchor_date),
      availableMonth: normalizeAvailabilityIntervalValue(data.availability_interval),
      createdAt: data.created_at,
      createdBy: data.created_by,
      imageUrl: getRewardImageUrl(supabase, data.id),
    };

    return { error: null, data: reward };
  } catch (error) {
    console.error('Error in editRewardAction:', error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'An unexpected error occurred while updating the item' };
  }
}

/**
 * Delete a reward/mercado item
 * HR only - permanently removes a reward and its image
 * @param id - The reward ID to delete
 * @returns ServerActionResponse indicating success or failure
 */
export async function deleteRewardAction(id: string): Promise<ServerActionResponse<void>> {
  try {
    // Get Supabase client
    const supabase = await createClient();

    // Delete reward from database
    const { error } = await supabase.from('Reward').delete().eq('id', id);

    if (error) {
      console.error('Error deleting reward:', error);
      return { error: `Failed to delete item: ${error.message}` };
    }

    const { data, error: profileError } = await supabase.storage
      .from('reward')
      .remove([`${id}/profile.png`]);

    if (profileError) {
      return { error: 'Failed to delete profile picture: ' + profileError.message };
    }

    return { error: null };
  } catch (error) {
    console.error('Error in deleteRewardAction:', error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'An unexpected error occurred while deleting the item' };
  }
}

/**
 * Hide/unhide a reward/mercado item
 * HR only - toggles visibility of a reward to employees
 * @param id - The ID of the reward to hide/unhide
 * @param isActive - Whether the item should be active (visible) or hidden
 * @returns ServerActionResponse indicating success or failure
 */
export async function hideRewardAction(
  id: string,
  isActive: boolean = false
): Promise<ServerActionResponse<void>> {
  try {
    // Get Supabase client
    const supabase = await createClient();

    // Update reward is_active status
    const { error } = await supabase.from('Reward').update({ is_active: isActive }).eq('id', id);

    if (error) {
      console.error('Error hiding/unhiding reward:', error);
      return { error: `Failed to ${isActive ? 'unhide' : 'hide'} item: ${error.message}` };
    }

    return { error: null };
  } catch (error) {
    console.error('Error in hideRewardAction:', error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return {
      error: `An unexpected error occurred while ${isActive ? 'unhiding' : 'hiding'} the item`,
    };
  }
}

/**
 * Upload reward picture
 * HR only - uploads or updates an image for a reward
 * @param rewardId - The reward ID to upload image for
 * @param file - The image file to upload
 * @returns ServerActionResponse with the path and public URL
 */
export async function uploadRewardPicture(
  rewardId: string,
  file: File
): Promise<ServerActionResponse<{ path: string | null; publicUrl: string }>> {
  try {
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      return { error: 'Image size must be less than 5MB' };
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return { error: 'Only JPEG, PNG, and WebP images are allowed' };
    }

    const supabase = await createClient();
    const { data: uploadResult, error } = await supabase.storage
      .from('reward')
      .upload(`${rewardId}/profile.png`, file, {
        // cacheControl: '0',
        upsert: true,
        contentType: file.type || 'image/png',
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return { error: 'Failed to upload reward picture: ' + error.message };
    }

    const publicUrl = getRewardImageUrl(supabase, rewardId);

    return {
      error: null,
      data: { path: uploadResult?.path ?? null, publicUrl },
    };
  } catch (error) {
    console.error('Upload reward picture error:', error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'An unexpected error occurred while uploading the image' };
  }
}

/**
 * Auto-hide out-of-stock rewards
 * HR utility - automatically marks items with quantity <= 0 as inactive
 * Can be called manually or set up as a scheduled task
 * @returns ServerActionResponse with count of items hidden
 */
export async function autoHideOutOfStockRewardsAction(): Promise<ServerActionResponse<{ hiddenCount: number }>> {
  try {
    const supabase = await createClient();

    // Get all rewards with quantity tracking (quantity is not null)
    const { data: rewards, error: fetchError } = await supabase
      .from('Reward')
      .select('id, quantity, is_active')
      .not('quantity', 'is', null)
      .lte('quantity', 0)
      .eq('is_active', true);

    if (fetchError) {
      console.error('Error fetching out-of-stock rewards:', fetchError);
      return { error: `Failed to check stock: ${fetchError.message}` };
    }

    if (!rewards || rewards.length === 0) {
      return { error: null, data: { hiddenCount: 0 } };
    }

    // Update all out-of-stock items to inactive
    const rewardIds = rewards.map(r => r.id);
    const { error: updateError } = await supabase
      .from('Reward')
      .update({ is_active: false })
      .in('id', rewardIds);

    if (updateError) {
      console.error('Error hiding out-of-stock rewards:', updateError);
      return { error: `Failed to hide items: ${updateError.message}` };
    }

    return { error: null, data: { hiddenCount: rewards.length } };
  } catch (error) {
    console.error('Error in autoHideOutOfStockRewardsAction:', error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'An unexpected error occurred while checking stock' };
  }
}
